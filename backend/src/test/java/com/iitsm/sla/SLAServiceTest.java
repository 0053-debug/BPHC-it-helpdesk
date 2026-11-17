package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SLAServiceTest {

    private final SLAService service = new SLAService();

    private final SLAPolicy p1 = SLAPolicy.builder()
            .priority(Priority.P1_CRITICAL)
            .responseTargetMinutes(5)
            .resolutionTargetMinutes(30)
            .build();

    private final LocalDateTime created = LocalDateTime.of(2026, 11, 15, 10, 0);

    @Test
    void responseDeadlineIsCreatedPlusResponseMinutes() {
        assertEquals(created.plusMinutes(5), service.responseDeadline(created, p1));
    }

    @Test
    void resolutionDeadlineIsCreatedPlusResolutionMinutes() {
        assertEquals(created.plusMinutes(30), service.resolutionDeadline(created, p1));
    }

    @Test
    void resolvedExactlyAtDeadlineIsNotViolation() {
        assertFalse(service.isResolutionViolated(
                created, created.plusMinutes(30), created.plusHours(5), p1));
    }

    @Test
    void resolvedOneMinuteLateIsViolation() {
        assertTrue(service.isResolutionViolated(
                created, created.plusMinutes(31), created.plusHours(5), p1));
    }

    @Test
    void openIncidentPastDeadlineIsViolation() {
        assertTrue(service.isResolutionViolated(created, null, created.plusMinutes(45), p1));
    }

    @Test
    void openIncidentBeforeDeadlineIsNotViolation() {
        assertFalse(service.isResolutionViolated(created, null, created.plusMinutes(10), p1));
    }
}