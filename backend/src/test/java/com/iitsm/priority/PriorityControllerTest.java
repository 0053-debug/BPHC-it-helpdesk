package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Urgency;
import com.iitsm.core.exception.IitsmException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PriorityControllerTest {

    private PriorityController controller;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        controller = new PriorityController(new PriorityService(new WeightedScorePriorityStrategy()));
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void calculatesCriticalPriorityForTheWorstCase() throws Exception {
        String body = "{\"impact\":\"ORGANIZATION_WIDE\",\"urgency\":\"CRITICAL\",\"businessCriticality\":5}";

        mvc.perform(post("/api/priority/calculate")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value("P1_CRITICAL"));
    }

    @Test
    void calculatesLowPriorityForTheLeastSevereCase() throws Exception {
        String body = "{\"impact\":\"INDIVIDUAL\",\"urgency\":\"LOW\",\"businessCriticality\":1}";

        mvc.perform(post("/api/priority/calculate")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value("P4_LOW"));
    }

    @Test
    void criticalityOutOfRangeIsRejectedAsABadRequest() {
        assertThrows(IitsmException.class, () -> controller.calculate(
                new PriorityController.PriorityRequest(Impact.INDIVIDUAL, Urgency.LOW, 9)));
    }
}
