package com.iitsm.analytics;

import com.iitsm.analytics.dto.BottleneckInsightDTO;
import com.iitsm.analytics.dto.ServiceHealthDTO;
import com.iitsm.analytics.dto.TechnicianWorkloadDTO;
import com.iitsm.analytics.service.BottleneckDetectionEngine;
import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.servicecatalog.model.ServiceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class BottleneckDetectionEngineTest {

    private BottleneckDetectionEngine engine;

    @BeforeEach
    void setUp() {
        engine = new BottleneckDetectionEngine();
    }

    @Test
    @DisplayName("Test 2: Detects Service SLA breach bottleneck when breach rate exceeds 25%")
    void shouldDetectServiceSlaBreachBottleneck() {
        ServiceHealthDTO service = ServiceHealthDTO.builder()
                .serviceId(1L)
                .serviceName("Central Authentication")
                .status(ServiceStatus.OPERATIONAL)
                .criticality(BigDecimal.valueOf(2.00))
                .totalIncidentsCount(10)
                .activeIncidentsCount(4)
                .slaBreachesCount(4)
                .slaBreachRatePercentage(40.0) // 40% > 25% threshold
                .baselineMttrMinutes(30)
                .actualAvgMttrMinutes(35)
                .build();

        List<BottleneckInsightDTO> insights = engine.analyzeServices(List.of(service));

        assertFalse(insights.isEmpty());
        assertEquals(1, insights.size());
        assertEquals("SERVICE_SLA_BREACH", insights.get(0).getType());
        assertEquals("CRITICAL", insights.get(0).getSeverity());
        assertTrue(insights.get(0).getTitle().contains("Central Authentication"));
    }

    @Test
    @DisplayName("Test 3: Detects Technician capacity saturation when workload reaches >= 80%")
    void shouldDetectTechnicianSaturation() {
        TechnicianWorkloadDTO tech = TechnicianWorkloadDTO.builder()
                .technicianId(3L)
                .name("Alex Network Tech")
                .activeTickets(4)
                .maxWorkload(5)
                .capacityUtilizationPercentage(80.0) // 80% threshold
                .status(AvailabilityStatus.AVAILABLE)
                .build();

        List<BottleneckInsightDTO> insights = engine.analyzeTechnicians(List.of(tech));

        assertFalse(insights.isEmpty());
        assertEquals(1, insights.size());
        assertEquals("TECHNICIAN_SATURATION", insights.get(0).getType());
        assertTrue(insights.get(0).getTitle().contains("Alex Network Tech"));
    }

    @Test
    @DisplayName("Test 4: Detects recurring category spike when a category represents > 35% of active tickets")
    void shouldDetectRecurringCategorySpike() {
        Map<String, Long> categoryCounts = Map.of(
                "NETWORK", 6L, // 6/10 = 60% > 35%
                "DATABASE", 2L,
                "HARDWARE", 2L
        );

        List<BottleneckInsightDTO> insights = engine.analyzeCategorySpikes(categoryCounts, 10L);

        assertFalse(insights.isEmpty());
        assertEquals(1, insights.size());
        assertEquals("RECURRING_CATEGORY_SPIKE", insights.get(0).getType());
        assertTrue(insights.get(0).getTitle().contains("NETWORK"));
    }
}
