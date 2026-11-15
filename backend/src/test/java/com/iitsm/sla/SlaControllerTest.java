package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SlaControllerTest {

    private final SLAPolicyRepository policies = mock(SLAPolicyRepository.class);
    private final SlaViolationRepository violations = mock(SlaViolationRepository.class);
    private final EscalationRecordRepository escalations = mock(EscalationRecordRepository.class);

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new SlaController(policies, violations, escalations)).build();
    }

    private SLAPolicy policy(Priority priority, int response, int resolution) {
        return SLAPolicy.builder().priority(priority)
                .responseTargetMinutes(response).resolutionTargetMinutes(resolution).build();
    }

    @Test
    void policiesAreListedFromP1DownToP4() throws Exception {
        when(policies.findAll()).thenReturn(List.of(
                policy(Priority.P3_MEDIUM, 60, 480),
                policy(Priority.P1_CRITICAL, 5, 30)));

        mvc.perform(get("/api/sla/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].priority").value("P1_CRITICAL"))
                .andExpect(jsonPath("$[0].resolutionTargetMinutes").value(30))
                .andExpect(jsonPath("$[1].priority").value("P3_MEDIUM"));
    }

    @Test
    void violationsEndpointReturnsTheRecordedViolations() throws Exception {
        SlaViolation violation = SlaViolation.builder()
                .incidentId(7L).violationType(ViolationType.RESOLUTION).build();
        when(violations.findAllByOrderByRecordedAtDesc()).thenReturn(List.of(violation));

        mvc.perform(get("/api/sla/violations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].incidentId").value(7))
                .andExpect(jsonPath("$[0].violationType").value("RESOLUTION"));
    }

    @Test
    void escalationsEndpointReturnsTheHistoryOfOneIncident() throws Exception {
        EscalationRecord record = EscalationRecord.builder()
                .incidentId(7L).level(EscalationLevel.TEAM_LEAD).build();
        when(escalations.findByIncidentIdOrderByEscalatedAtAsc(7L)).thenReturn(List.of(record));

        mvc.perform(get("/api/sla/escalations/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].level").value("TEAM_LEAD"));
    }
}
