package com.iitsm.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BottleneckInsightDTO {
    private String id;
    private String type;          // SERVICE_SLA_BREACH, SERVICE_MTTR_INFLATION, RECURRING_CATEGORY_SPIKE, TECHNICIAN_SATURATION
    private String severity;      // CRITICAL, HIGH, MEDIUM, LOW
    private String title;
    private String description;
    private String affectedResource;
    private String metricLabel;
    private String metricValue;
    private String thresholdLabel;
    private String recommendation;
    private Instant detectedAt;
}
