package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SlaMonitorServiceTest {

    private final SlaIncidentSource source = mock(SlaIncidentSource.class);
    private final SLAPolicyResolver resolver = mock(SLAPolicyResolver.class);
    private final SlaViolationRepository violations = mock(SlaViolationRepository.class);
    private final ApplicationEventPublisher publisher = mock(ApplicationEventPublisher.class);

    private SlaMonitorService monitor;

    private final LocalDateTime created = LocalDateTime.of(2026, 11, 15, 10, 0);

    private final SLAPolicy p1 = SLAPolicy.builder()
            .priority(Priority.P1_CRITICAL).responseTargetMinutes(5).resolutionTargetMinutes(30).build();

    @BeforeEach
    void setUp() {
        monitor = new SlaMonitorService(source, resolver, new SLAService(), violations, publisher);
        when(resolver.resolve(Priority.P1_CRITICAL)).thenReturn(p1);
    }

    private SlaTrackedIncident p1Incident(Long id, LocalDateTime acknowledgedAt) {
        return new SlaTrackedIncident(id, Priority.P1_CRITICAL, created, acknowledgedAt, null);
    }

    @Test
    void noAlertWhileWellInsideTheDeadline() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(1L, created.plusMinutes(1))));

        monitor.check(created.plusMinutes(10));

        verify(violations, never()).save(any());
        verify(publisher, never()).publishEvent(any(SlaAlertEvent.class));
    }

    @Test
    void warningIsRaisedOnceAtEightyPercent() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(1L, created.plusMinutes(1))));

        monitor.check(created.plusMinutes(25));
        monitor.check(created.plusMinutes(26));

        ArgumentCaptor<SlaAlertEvent> captor = ArgumentCaptor.forClass(SlaAlertEvent.class);
        verify(publisher, times(1)).publishEvent(captor.capture());
        assertEquals(AlertKind.WARNING, captor.getValue().kind());
        assertEquals(ViolationType.RESOLUTION, captor.getValue().type());
    }

    @Test
    void resolutionViolationIsRecordedAndAnnounced() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(1L, created.plusMinutes(1))));

        monitor.check(created.plusMinutes(31));

        ArgumentCaptor<SlaViolation> saved = ArgumentCaptor.forClass(SlaViolation.class);
        verify(violations).save(saved.capture());
        assertEquals(ViolationType.RESOLUTION, saved.getValue().getViolationType());
        assertEquals(created.plusMinutes(30), saved.getValue().getDeadline());

        ArgumentCaptor<SlaAlertEvent> event = ArgumentCaptor.forClass(SlaAlertEvent.class);
        verify(publisher).publishEvent(event.capture());
        assertEquals(AlertKind.VIOLATED, event.getValue().kind());
    }

    @Test
    void existingViolationIsNotRecordedTwice() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(1L, created.plusMinutes(1))));
        when(violations.existsByIncidentIdAndViolationType(1L, ViolationType.RESOLUTION)).thenReturn(true);

        monitor.check(created.plusMinutes(31));

        verify(violations, never()).save(any());
    }

    @Test
    void unacknowledgedIncidentPastResponseTargetIsAResponseViolation() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(1L, null)));

        monitor.check(created.plusMinutes(6));

        ArgumentCaptor<SlaViolation> saved = ArgumentCaptor.forClass(SlaViolation.class);
        verify(violations, times(1)).save(saved.capture());
        assertEquals(ViolationType.RESPONSE, saved.getValue().getViolationType());
    }

    @Test
    void incidentAcknowledgedOnTimeHasNoResponseViolation() {
        when(source.findOpenIncidents()).thenReturn(List.of(p1Incident(1L, created.plusMinutes(2))));

        monitor.check(created.plusMinutes(10));

        verify(violations, never()).save(any());
    }

    @Test
    void missingPolicyForOneIncidentDoesNotStopTheOthers() {
        SlaTrackedIncident noPolicy = new SlaTrackedIncident(2L, Priority.P4_LOW, created, null, null);
        when(resolver.resolve(Priority.P4_LOW)).thenThrow(new SlaNotConfiguredException("none"));
        when(source.findOpenIncidents()).thenReturn(
                List.of(noPolicy, p1Incident(1L, created.plusMinutes(1))));

        monitor.check(created.plusMinutes(31));

        verify(violations, times(1)).save(any());
    }
}
