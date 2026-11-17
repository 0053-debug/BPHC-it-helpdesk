package com.iitsm.sla;

import com.iitsm.core.model.SLAPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SlaMonitorService {

    private static final Logger log = LoggerFactory.getLogger(SlaMonitorService.class);

    // A warning is raised once 80% of the allowed time has passed
    static final double WARNING_FRACTION = 0.8;

    private final SlaIncidentSource source;
    private final SLAPolicyResolver resolver;
    private final SLAService slaService;
    private final SlaViolationRepository violations;
    private final ApplicationEventPublisher publisher;

    // Remembers warnings already sent (resets on restart)
    private final Set<String> warned = ConcurrentHashMap.newKeySet();

    public SlaMonitorService(SlaIncidentSource source,
                             SLAPolicyResolver resolver,
                             SLAService slaService,
                             SlaViolationRepository violations,
                             ApplicationEventPublisher publisher) {
        this.source = source;
        this.resolver = resolver;
        this.slaService = slaService;
        this.violations = violations;
        this.publisher = publisher;
    }

    public void check(LocalDateTime now) {
        for (SlaTrackedIncident incident : source.findOpenIncidents()) {
            try {
                checkOne(incident, now);
            } catch (SlaNotConfiguredException e) {
                // One incident without a policy must not stop the others
                log.warn("Skipping incident {}: {}", incident.id(), e.getMessage());
            }
        }
    }

    private void checkOne(SlaTrackedIncident incident, LocalDateTime now) {
        SLAPolicy policy = resolver.resolve(incident.priority());

        LocalDateTime responseDue = slaService.responseDeadline(incident.createdAt(), policy);
        if (incident.acknowledgedAt() == null) {
            evaluate(incident, ViolationType.RESPONSE, responseDue, now);
        } else if (incident.acknowledgedAt().isAfter(responseDue)) {
            recordViolation(incident, ViolationType.RESPONSE, responseDue, now);
        }

        LocalDateTime resolutionDue = slaService.resolutionDeadline(incident.createdAt(), policy);
        if (incident.resolvedAt() == null) {
            evaluate(incident, ViolationType.RESOLUTION, resolutionDue, now);
        } else if (incident.resolvedAt().isAfter(resolutionDue)) {
            recordViolation(incident, ViolationType.RESOLUTION, resolutionDue, now);
        }
    }

    private void evaluate(SlaTrackedIncident incident, ViolationType type,
                          LocalDateTime due, LocalDateTime now) {
        if (now.isAfter(due)) {
            recordViolation(incident, type, due, now);
            return;
        }
        long total = Duration.between(incident.createdAt(), due).toMillis();
        long elapsed = Duration.between(incident.createdAt(), now).toMillis();
        if (elapsed >= total * WARNING_FRACTION) {
            String key = incident.id() + ":" + type;
            if (warned.add(key)) {
                publisher.publishEvent(new SlaAlertEvent(incident.id(), type, AlertKind.WARNING, due));
            }
        }
    }

    private void recordViolation(SlaTrackedIncident incident, ViolationType type,
                                 LocalDateTime due, LocalDateTime now) {
        if (violations.existsByIncidentIdAndViolationType(incident.id(), type)) {
            return;
        }
        violations.save(SlaViolation.builder()
                .incidentId(incident.id())
                .violationType(type)
                .deadline(due)
                .recordedAt(now)
                .build());
        publisher.publishEvent(new SlaAlertEvent(incident.id(), type, AlertKind.VIOLATED, due));
    }
}
