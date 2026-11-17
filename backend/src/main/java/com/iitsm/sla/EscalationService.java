package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

@Service
public class EscalationService {

    private static final Logger log = LoggerFactory.getLogger(EscalationService.class);

    // Only critical and high priority incidents are escalated automatically
    private static final Set<Priority> ESCALATED_PRIORITIES =
            Set.of(Priority.P1_CRITICAL, Priority.P2_HIGH);

    private final SlaIncidentSource source;
    private final SLAPolicyResolver resolver;
    private final SLAService slaService;
    private final EscalationRecordRepository records;
    private final ApplicationEventPublisher publisher;
    private final long intervalMinutes;

    public EscalationService(SlaIncidentSource source,
                             SLAPolicyResolver resolver,
                             SLAService slaService,
                             EscalationRecordRepository records,
                             ApplicationEventPublisher publisher,
                             @Value("${escalation.interval-minutes:10}") long intervalMinutes) {
        this.source = source;
        this.resolver = resolver;
        this.slaService = slaService;
        this.records = records;
        this.publisher = publisher;
        this.intervalMinutes = intervalMinutes;
    }

    public void check(LocalDateTime now) {
        for (SlaTrackedIncident incident : source.findOpenIncidents()) {
            try {
                checkOne(incident, now);
            } catch (SlaNotConfiguredException e) {
                log.warn("Skipping escalation for incident {}: {}", incident.id(), e.getMessage());
            }
        }
    }

    private void checkOne(SlaTrackedIncident incident, LocalDateTime now) {
        if (!ESCALATED_PRIORITIES.contains(incident.priority()) || incident.acknowledgedAt() != null) {
            return;
        }
        SLAPolicy policy = resolver.resolve(incident.priority());
        LocalDateTime responseDue = slaService.responseDeadline(incident.createdAt(), policy);
        if (!now.isAfter(responseDue)) {
            return;
        }

        Optional<EscalationRecord> last = records.findTopByIncidentIdOrderByEscalatedAtDesc(incident.id());
        Optional<EscalationLevel> next;
        if (last.isEmpty()) {
            // Every incident starts at TECHNICIAN, so the first escalation goes to TEAM_LEAD
            next = EscalationLevel.TECHNICIAN.next();
        } else if (now.isBefore(last.get().getEscalatedAt().plusMinutes(intervalMinutes))) {
            return;
        } else {
            next = last.get().getLevel().next();
        }

        if (next.isEmpty()) {
            return; // already at the top of the chain
        }
        escalate(incident, next.get(), now);
    }

    private void escalate(SlaTrackedIncident incident, EscalationLevel level, LocalDateTime now) {
        String reason = "Not acknowledged within the response target";
        records.save(EscalationRecord.builder()
                .incidentId(incident.id())
                .level(level)
                .escalatedAt(now)
                .reason(reason)
                .build());
        publisher.publishEvent(new EscalationEvent(incident.id(), level, reason, now));
    }
}
