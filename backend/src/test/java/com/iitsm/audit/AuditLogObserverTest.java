package com.iitsm.audit;

import com.iitsm.audit.model.AuditLog;
import com.iitsm.audit.service.AuditLogObserver;
import com.iitsm.audit.service.AuditLogService;
import com.iitsm.events.IncidentEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogObserverTest {

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuditLogObserver auditLogObserver;

    private IncidentEvent sampleEvent;

    @BeforeEach
    void setUp() {
        sampleEvent = IncidentEvent.builder()
                .eventType("INCIDENT_ASSIGNED")
                .incidentId(101L)
                .trackingNumber("INC-20261108-0001")
                .actorId(2L)
                .actorName("Team Lead")
                .actorRole("ROLE_TEAM_LEAD")
                .action("ASSIGN")
                .previousState("CLASSIFIED")
                .newState("ASSIGNED")
                .title("Network Outage in Lab 3")
                .description("Assigned to Alex Network Tech")
                .timestamp(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Test 1: AuditLogObserver synchronously creates immutable audit record on IncidentEvent")
    void shouldCreateAuditLogOnIncidentEvent() {
        // When
        auditLogObserver.onIncidentEvent(sampleEvent);

        // Then
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogService, times(1)).record(captor.capture());

        AuditLog captured = captor.getValue();
        assertNotNull(captured);
        assertEquals(101L, captured.getIncidentId());
        assertEquals(2L, captured.getActorId());
        assertEquals("ASSIGN", captured.getAction());
        assertEquals("CLASSIFIED", captured.getPreviousState());
        assertEquals("ASSIGNED", captured.getNewState());
        assertEquals("Assigned to Alex Network Tech", captured.getDescription());
    }
}
