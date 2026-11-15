package com.iitsm.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDTO {
    private long totalIncidents;
    private long openIncidents;
    private long criticalIncidents; // P1
    private long resolvedIncidents;
    private long slaBreaches;
    private double slaCompliancePercentage;
    private long averageMttrMinutes;
}
