package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EscalationServiceTest {

    private final SlaIncidentSource source = mock(SlaIncidentSource.class);
    private final SLAPolicyResolver resolver = mock(SLAPolicyResolver.class);
    private final EscalationRecordRepository records = mock(EscalationRecordRepository.class);
    private final ApplicationEventPublisher publisher = mock(ApplicationEventPublisher.class);

    private EscalationService service;

    private final LocalDateTime created = LocalDateTime.of(2026, 11, 15, 10, 0);

    private final SLAPolicy p1 = SLAPolicy.builder()
            .priority(Priority.P1_CRITICAL).responseTargetMinutes(5).resolutionTargetMinutes(30).build();

    @BeforeEach
    void setUp() {
        service = new EscalationService(source, resolver, new SLAService(), records, publisher, 10);
        when(resolver.resolve(Priority.P1_CRITICAL)).thenReturn(p1);
    }

    private SlaTrackedIncident p1Incident(LocalDateTime acknowledgedAt) {
        return new SlaTrackedIncident(1L, Priority.P1_CRITICAL, created, acknowledgedAt, null);
    }

    private EscalationRecord record(EscalationLevel level, LocalDateTime at) {
        return EscalationRecord.builder().incidentId(1L).level(level).escalatedAt(at).build();
    }

    @Test
    void noEscalationBeforeTheResponseDeadline() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(null)));

        service.check(created.plusMinutes(4));

        verify(records, never()).save(any());
    }

    @Test
    void firstEscalationGoesToTeamLead() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(null)));
        when(records.findTopByIncidentIdOrderByEscalatedAtDesc(1L)).thenReturn(Optional.empty());

        service.check(created.plusMinutes(6));

        ArgumentCaptor<EscalationRecord> saved = ArgumentCaptor.forClass(EscalationRecord.class);
        verify(records).save(saved.capture());
        assertEquals(EscalationLevel.TEAM_LEAD, saved.getValue().getLevel());

        ArgumentCaptor<EscalationEvent> event = ArgumentCaptor.forClass(EscalationEvent.class);
        verify(publisher).publishEvent(event.capture());
        assertEquals(EscalationLevel.TEAM_LEAD, event.getValue().level());
    }

    @Test
    void noSecondEscalationInsideTheInterval() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(null)));
        when(records.findTopByIncidentIdOrderByEscalatedAtDesc(1L)).thenReturn(
                Optional.of(record(EscalationLevel.TEAM_LEAD, created.plusMinutes(6))));

        service.check(created.plusMinutes(10));

        verify(records, never()).save(any());
    }

    @Test
    void escalatesOneLevelHigherAfterTheInterval() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(null)));
        when(records.findTopByIncidentIdOrderByEscalatedAtDesc(1L)).thenReturn(
                Optional.of(record(EscalationLevel.TEAM_LEAD, created.plusMinutes(6))));

        service.check(created.plusMinutes(17));

        ArgumentCaptor<EscalationRecord> saved = ArgumentCaptor.forClass(EscalationRecord.class);
        verify(records).save(saved.capture());
        assertEquals(EscalationLevel.SYSTEM_ADMIN, saved.getValue().getLevel());
    }

    @Test
    void stopsAtTheTopOfTheChain() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(null)));
        when(records.findTopByIncidentIdOrderByEscalatedAtDesc(1L)).thenReturn(
                Optional.of(record(EscalationLevel.IT_MANAGER, created.plusMinutes(6))));

        service.check(created.plusMinutes(60));

        verify(records, never()).save(any());
    }

    @Test
    void acknowledgedIncidentIsNotEscalated() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(created.plusMinutes(2))));

        service.check(created.plusMinutes(30));

        verify(records, never()).save(any());
    }

    @Test
    void lowPriorityIncidentIsNotEscalated() {
        SlaTrackedIncident low = new SlaTrackedIncident(2L, Priority.P4_LOW, created, null, null);
        when(source.findOpenIncidents()).thenReturn(List.of(low));

        service.check(created.plusHours(10));

        verify(records, never()).save(any());
    }
}
