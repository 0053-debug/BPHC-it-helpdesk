package com.iitsm.sla;

import com.iitsm.core.model.SLAPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentEventPublisher;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SlaMonitorService {

    private static final Logger log = LoggerFactory.getLogger(SlaMonitorService.class);

    // A warning is raised once 75% of the allowed time has passed.
    static final double WARNING_FRACTION = 0.75;

    private final SlaIncidentSource source;
    private final SLAPolicyResolver resolver;
    private final SLAService slaService;
    private final SlaViolationRepository violations;
    private final ApplicationEventPublisher publisher;

    // Remembers warnings already sent (resets on restart)
    private final JdbcTemplate jdbc;
    private final IncidentEventPublisher incidentEvents;
    private final Set<String> localWarnings = ConcurrentHashMap.newKeySet();

    @Autowired
    public SlaMonitorService(SlaIncidentSource source,
                             SLAPolicyResolver resolver,
                             SLAService slaService,
                             SlaViolationRepository violations,
                             ApplicationEventPublisher publisher,
                             JdbcTemplate jdbc) {
        this(source, resolver, slaService, violations, publisher, jdbc, null);
    }

    @Autowired
    public SlaMonitorService(SlaIncidentSource source, SLAPolicyResolver resolver, SLAService slaService,
                             SlaViolationRepository violations, ApplicationEventPublisher publisher,
                             JdbcTemplate jdbc, IncidentEventPublisher incidentEvents) {
        this.source = source;
        this.resolver = resolver;
        this.slaService = slaService;
        this.violations = violations;
        this.publisher = publisher;
        this.jdbc = jdbc;
        this.incidentEvents = incidentEvents;
    }

    public SlaMonitorService(SlaIncidentSource source, SLAPolicyResolver resolver, SLAService slaService,
                             SlaViolationRepository violations, ApplicationEventPublisher publisher) {
        this(source, resolver, slaService, violations, publisher, null);
    }

    @org.springframework.transaction.annotation.Transactional
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
            boolean firstWarning = jdbc == null
                    ? localWarnings.add(incident.id() + ":" + type)
                    : jdbc.update("INSERT INTO sla_warnings (incident_id, violation_type) VALUES (?, ?) ON CONFLICT (incident_id, violation_type) DO NOTHING", incident.id(), type.name()) > 0;
            if (firstWarning) {
                publishIncidentEvent(incident.id(), type, "SLA_WARNING", "SLA reached 75% of its allowed window");
                publisher.publishEvent(new SlaAlertEvent(incident.id(), type, AlertKind.WARNING, due));
            }
        }
    }

    private void recordViolation(SlaTrackedIncident incident, ViolationType type,
                                 LocalDateTime due, LocalDateTime now) {
        if (violations.existsByIncidentIdAndViolationType(incident.id(), type)) {
            if (jdbc != null) jdbc.update("UPDATE incidents SET sla_breached=TRUE, updated_at=CURRENT_TIMESTAMP WHERE id=?", incident.id());
            return;
        }
        violations.save(SlaViolation.builder()
                .incidentId(incident.id())
                .violationType(type)
                .deadline(due)
                .recordedAt(now)
                .build());
        if (jdbc != null) {
            jdbc.update("UPDATE incidents SET sla_breached=TRUE, updated_at=CURRENT_TIMESTAMP WHERE id=?", incident.id());
        }
        publishIncidentEvent(incident.id(), type, "SLA_BREACHED", "SLA target was breached");
        publisher.publishEvent(new SlaAlertEvent(incident.id(), type, AlertKind.VIOLATED, due));
    }

    private void publishIncidentEvent(Long incidentId, ViolationType type, String action, String detail) {
        if (incidentEvents == null || jdbc == null) {
            if (jdbc != null) jdbc.update("INSERT INTO audit_logs (incident_id, actor_name, actor_role, action, description) VALUES (?, 'SLA Monitor', 'SYSTEM', ?, ?)", incidentId, action, type + " " + detail);
            return;
        }
        var row = jdbc.queryForMap("SELECT tracking_number,title,status,reporter_id,assigned_technician_id FROM incidents WHERE id=?", incidentId);
        Long reporterId = (Long) row.get("reporter_id");
        Long technicianId = (Long) row.get("assigned_technician_id");
        java.util.LinkedHashSet<Long> recipients = new java.util.LinkedHashSet<>();
        if (reporterId != null) recipients.add(reporterId);
        if (technicianId != null) recipients.add(technicianId);
        if (recipients.isEmpty()) recipients.add(null);
        for (Long recipient : recipients) {
            String email = recipient == null ? null : jdbc.query("SELECT email FROM users WHERE id=?", rs -> rs.next() ? rs.getString(1) : null, recipient);
            incidentEvents.publishEvent(IncidentEvent.builder().eventType(action).incidentId(incidentId)
                    .trackingNumber((String) row.get("tracking_number")).actorName("SLA Monitor").actorRole("SYSTEM")
                    .action(action).previousState((String) row.get("status")).newState((String) row.get("status"))
                    .title((String) row.get("title")).description(type + " " + detail)
                    .recipientId(recipient).recipientEmail(email).timestamp(java.time.Instant.now()).build());
        }
    }
}
