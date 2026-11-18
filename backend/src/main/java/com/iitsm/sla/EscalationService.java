package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentEventPublisher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;

@Service
public class EscalationService {
    private final SlaIncidentSource source;
    private final SLAPolicyResolver resolver;
    private final SLAService slaService;
    private final EscalationRecordRepository records;
    private final ApplicationEventPublisher publisher;
    private final JdbcTemplate jdbc;
    private final IncidentEventPublisher incidentEvents;

    @Autowired
    public EscalationService(SlaIncidentSource source, SLAPolicyResolver resolver, SLAService slaService,
                             EscalationRecordRepository records, ApplicationEventPublisher publisher,
                             @Autowired(required = false) JdbcTemplate jdbc,
                             @Autowired(required = false) IncidentEventPublisher incidentEvents) {
        this.source = source; this.resolver = resolver; this.slaService = slaService;
        this.records = records; this.publisher = publisher; this.jdbc = jdbc; this.incidentEvents = incidentEvents;
    }

    public EscalationService(SlaIncidentSource source, SLAPolicyResolver resolver, SLAService slaService,
                             EscalationRecordRepository records, ApplicationEventPublisher publisher, long ignoredLegacyInterval) {
        this(source, resolver, slaService, records, publisher, null, null);
    }

    @Transactional
    public void check(LocalDateTime now) {
        for (SlaTrackedIncident incident : source.findOpenIncidents()) {
            if (incident.priority() != Priority.P1_CRITICAL) continue;
            SLAPolicy policy;
            try { policy = resolver.resolve(incident.priority()); }
            catch (SlaNotConfiguredException ignored) { continue; }

            if (incident.assignedAt() != null && incident.acknowledgedAt() == null
                    && !now.isBefore(incident.assignedAt().plusMinutes(5))
                    && !records.existsByIncidentIdAndLevel(incident.id(), EscalationLevel.TEAM_LEAD)) {
                escalate(incident.id(), EscalationLevel.TEAM_LEAD,
                        "P1 incident was not acknowledged within five minutes of assignment", now);
            }

            LocalDateTime resolutionDeadline = slaService.resolutionDeadline(incident.createdAt(), policy);
            LocalDateTime escalationAt = incident.createdAt().plusNanos(
                    java.time.Duration.between(incident.createdAt(), resolutionDeadline).toNanos() * 3 / 4);
            if (incident.resolvedAt() == null && !now.isBefore(escalationAt)
                    && !records.existsByIncidentIdAndLevel(incident.id(), EscalationLevel.SYSTEM_ADMIN)) {
                escalate(incident.id(), EscalationLevel.SYSTEM_ADMIN,
                        "P1 incident reached 75% of its resolution SLA without resolution", now);
            }
        }
    }

    private void escalate(Long incidentId, EscalationLevel level, String reason, LocalDateTime now) {
        records.save(EscalationRecord.builder().incidentId(incidentId).level(level).escalatedAt(now).reason(reason).build());
        publisher.publishEvent(new EscalationEvent(incidentId, level, reason, now));
        if (jdbc != null && incidentEvents != null) {
            var incident = jdbc.queryForMap("SELECT tracking_number,title,status,reporter_id,assigned_technician_id FROM incidents WHERE id=?", incidentId);
            String recipientRole = level == EscalationLevel.TEAM_LEAD ? "ROLE_TEAM_LEAD" : "ROLE_ADMIN";
            jdbc.query("SELECT id,email FROM users WHERE role=? AND active=TRUE ORDER BY id LIMIT 1", rs -> {
                if (rs.next()) incidentEvents.publishEvent(IncidentEvent.builder()
                        .eventType("INCIDENT_ESCALATED").incidentId(incidentId)
                        .trackingNumber((String) incident.get("tracking_number"))
                        .actorName("SLA Monitor").actorRole("SYSTEM").action("INCIDENT_ESCALATED")
                        .previousState((String) incident.get("status")).newState((String) incident.get("status"))
                        .title((String) incident.get("title")).description(reason)
                        .recipientId(rs.getLong("id")).recipientEmail(rs.getString("email"))
                        .timestamp(now.toInstant(java.time.ZoneOffset.UTC)).build());
                return null;
            }, recipientRole);
        }
    }
}
