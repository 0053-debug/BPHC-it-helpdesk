package com.iitsm.audit.service;

import com.iitsm.audit.model.AuditLog;
import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Concrete GoF Observer for persisting audit history synchronously with domain events.
 */
@Component
@Order(1) // Execute first to guarantee audit records are committed
@RequiredArgsConstructor
@Slf4j
public class AuditLogObserver implements IncidentObserver {

    private final AuditLogService auditLogService;

    @Override
    @Transactional(propagation = Propagation.MANDATORY) // Part of the caller's transaction
    public void onIncidentEvent(IncidentEvent event) {
        log.info("AuditLogObserver processing event: {} for incident ID: {}", event.getEventType(), event.getIncidentId());

        AuditLog logEntry = AuditLog.builder()
                .incidentId(event.getIncidentId())
                .actorId(event.getActorId())
                .actorName(event.getActorName() != null ? event.getActorName() : "SYSTEM")
                .actorRole(event.getActorRole() != null ? event.getActorRole() : "SYSTEM")
                .action(event.getAction() != null ? event.getAction() : event.getEventType())
                .previousState(event.getPreviousState())
                .newState(event.getNewState())
                .description(event.getDescription() != null ? event.getDescription() : event.getTitle())
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : Instant.now())
                .build();

        auditLogService.record(logEntry);
    }
}
