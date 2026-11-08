package com.iitsm.analytics.service;

import com.iitsm.analytics.dto.BottleneckInsightDTO;
import com.iitsm.analytics.dto.ServiceHealthDTO;
import com.iitsm.analytics.dto.TechnicianWorkloadDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Intelligent Rule-Based Bottleneck and Anomaly Detection Engine (Person 4 Intelligent Feature).
 * Evaluates SLA breach rates, MTTR inflation, recurring category spikes, and technician saturation.
 */
@Component
@Slf4j
public class BottleneckDetectionEngine {

    private static final double SLA_BREACH_RATE_THRESHOLD = 25.0; // > 25% breach rate is a bottleneck
    private static final double MTTR_INFLATION_MULTIPLIER = 1.5;   // > 1.5x baseline MTTR is a bottleneck
    private static final double CATEGORY_DOMINANCE_THRESHOLD = 35.0; // > 35% of active complaints is a spike
    private static final double TECHNICIAN_SATURATION_THRESHOLD = 80.0; // >= 80% capacity is a bottleneck

    /**
     * Analyzes service health metrics and detects service-level operational bottlenecks.
     */
    public List<BottleneckInsightDTO> analyzeServices(List<ServiceHealthDTO> serviceHealthList) {
        List<BottleneckInsightDTO> insights = new ArrayList<>();

        for (ServiceHealthDTO service : serviceHealthList) {
            // Rule 1: High SLA Breach Rate (> 25%)
            if (service.getTotalIncidentsCount() >= 3 && service.getSlaBreachRatePercentage() > SLA_BREACH_RATE_THRESHOLD) {
                insights.add(BottleneckInsightDTO.builder()
                        .id("BN-SLA-" + service.getServiceId())
                        .type("SERVICE_SLA_BREACH")
                        .severity("CRITICAL")
                        .title("Excessive SLA Breaches on " + service.getServiceName())
                        .description(String.format("Service '%s' has an SLA breach rate of %.1f%%, exceeding the maximum 25%% threshold.",
                                service.getServiceName(), service.getSlaBreachRatePercentage()))
                        .affectedResource(service.getServiceName())
                        .metricLabel("SLA Breach Rate")
                        .metricValue(String.format("%.1f%%", service.getSlaBreachRatePercentage()))
                        .thresholdLabel("> 25.0%")
                        .recommendation("Increase priority tier or assign dedicated senior technicians to clear backlog.")
                        .detectedAt(Instant.now())
                        .build());
            }

            // Rule 2: MTTR Inflation (> 1.5x of baseline expected MTTR)
            if (service.getActualAvgMttrMinutes() > (service.getBaselineMttrMinutes() * MTTR_INFLATION_MULTIPLIER)) {
                insights.add(BottleneckInsightDTO.builder()
                        .id("BN-MTTR-" + service.getServiceId())
                        .type("SERVICE_MTTR_INFLATION")
                        .severity("HIGH")
                        .title("Resolution Time Degradation on " + service.getServiceName())
                        .description(String.format("Actual Mean Time to Resolution (%d mins) exceeds the expected baseline (%d mins) by over 50%%.",
                                service.getActualAvgMttrMinutes(), service.getBaselineMttrMinutes()))
                        .affectedResource(service.getServiceName())
                        .metricLabel("Actual MTTR")
                        .metricValue(service.getActualAvgMttrMinutes() + " mins")
                        .thresholdLabel(String.format("> %d mins", (long)(service.getBaselineMttrMinutes() * MTTR_INFLATION_MULTIPLIER)))
                        .recommendation("Review recurring root-causes or provide updated troubleshooting runbooks.")
                        .detectedAt(Instant.now())
                        .build());
            }
        }

        return insights;
    }

    /**
     * Analyzes technician workloads and flags engineer saturation bottlenecks.
     */
    public List<BottleneckInsightDTO> analyzeTechnicians(List<TechnicianWorkloadDTO> technicianList) {
        List<BottleneckInsightDTO> insights = new ArrayList<>();

        for (TechnicianWorkloadDTO tech : technicianList) {
            if (tech.getCapacityUtilizationPercentage() >= TECHNICIAN_SATURATION_THRESHOLD) {
                insights.add(BottleneckInsightDTO.builder()
                        .id("BN-TECH-" + tech.getTechnicianId())
                        .type("TECHNICIAN_SATURATION")
                        .severity(tech.getCapacityUtilizationPercentage() >= 100.0 ? "CRITICAL" : "HIGH")
                        .title("Technician Capacity Saturation: " + tech.getName())
                        .description(String.format("Technician %s is operating at %.0f%% capacity (%d/%d tickets assigned).",
                                tech.getName(), tech.getCapacityUtilizationPercentage(), tech.getActiveTickets(), tech.getMaxWorkload()))
                        .affectedResource(tech.getName())
                        .metricLabel("Workload Utilization")
                        .metricValue(String.format("%.0f%%", tech.getCapacityUtilizationPercentage()))
                        .thresholdLabel(">= 80%")
                        .recommendation("Rebalance ticket assignments using Load-Based strategy or reassign tickets.")
                        .detectedAt(Instant.now())
                        .build());
            }
        }

        return insights;
    }

    /**
     * Analyzes category distributions and detects recurring problem anomalies.
     */
    public List<BottleneckInsightDTO> analyzeCategorySpikes(Map<String, Long> categoryCounts, long totalActiveTickets) {
        List<BottleneckInsightDTO> insights = new ArrayList<>();
        if (totalActiveTickets == 0) return insights;

        for (Map.Entry<String, Long> entry : categoryCounts.entrySet()) {
            double proportion = ((double) entry.getValue() / totalActiveTickets) * 100.0;
            if (entry.getValue() >= 3 && proportion > CATEGORY_DOMINANCE_THRESHOLD) {
                insights.add(BottleneckInsightDTO.builder()
                        .id("BN-CAT-" + entry.getKey())
                        .type("RECURRING_CATEGORY_SPIKE")
                        .severity("HIGH")
                        .title("Spike in " + entry.getKey() + " Incidents")
                        .description(String.format("Category '%s' accounts for %.1f%% of all active tickets (%d tickets). Potential underlying infrastructure outage.",
                                entry.getKey(), proportion, entry.getValue()))
                        .affectedResource(entry.getKey())
                        .metricLabel("Category Proportion")
                        .metricValue(String.format("%.1f%%", proportion))
                        .thresholdLabel("> 35.0%")
                        .recommendation("Investigate common infrastructure root-cause; check for duplicate incident cluster.")
                        .detectedAt(Instant.now())
                        .build());
            }
        }

        return insights;
    }
}
