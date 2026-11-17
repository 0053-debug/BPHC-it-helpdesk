package com.iitsm.core.service;

import com.iitsm.core.exception.InvalidStateTransitionException;
import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentCategory;
import com.iitsm.core.model.IncidentStatus;
import com.iitsm.core.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class IncidentServiceTest {

    private IncidentRepository repository;
    private IncidentService service;
    private Incident sampleIncident;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(IncidentRepository.class);
        service = new IncidentService(repository);

        sampleIncident = new Incident();
        sampleIncident.setId(1L);
        sampleIncident.setTitle("VPN Outage");
        sampleIncident.setDescription("Cannot connect to corporate VPN");
        sampleIncident.setCategory(IncidentCategory.NETWORK);

        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncident));
        when(repository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testFullLifecycleProgression() {
        service.classifyIncident(1L);
        assertEquals(IncidentStatus.CLASSIFIED, sampleIncident.getStatus());

        service.assignIncident(1L);
        assertEquals(IncidentStatus.ASSIGNED, sampleIncident.getStatus());

        service.acknowledgeIncident(1L);
        assertEquals(IncidentStatus.ACKNOWLEDGED, sampleIncident.getStatus());
        assertNotNull(sampleIncident.getAcknowledgedAt());

        service.investigateIncident(1L);
        assertEquals(IncidentStatus.IN_PROGRESS, sampleIncident.getStatus());

        service.resolveIncident(1L, "Restarted VPN gateway concentrator.");
        assertEquals(IncidentStatus.RESOLVED, sampleIncident.getStatus());
        assertNotNull(sampleIncident.getResolvedAt());

        service.verifyIncident(1L);
        assertEquals(IncidentStatus.VERIFIED, sampleIncident.getStatus());

        Incident closed = service.closeIncident(1L, true);
        assertEquals(IncidentStatus.CLOSED, closed.getStatus());
    }

    @Test
    void testInvalidSkipTransitionRejection() {
        assertThrows(InvalidStateTransitionException.class, () -> service.closeIncident(1L));
    }

    @Test
    void testResolutionNotesValidation() {
        service.classifyIncident(1L);
        service.assignIncident(1L);
        service.acknowledgeIncident(1L);
        service.investigateIncident(1L);

        assertThrows(IllegalArgumentException.class, () -> service.resolveIncident(1L, ""));
        assertThrows(IllegalArgumentException.class, () -> service.resolveIncident(1L, null));
    }

    @Test
    void testUnauthorizedClosureAttempt() {
        service.classifyIncident(1L);
        service.assignIncident(1L);
        service.acknowledgeIncident(1L);
        service.investigateIncident(1L);
        service.resolveIncident(1L, "Applied firewall patch.");
        service.verifyIncident(1L);

        assertThrows(SecurityException.class, () -> service.closeIncident(1L, false));
    }
}