package com.iitsm.analytics.dto;

import com.iitsm.servicecatalog.model.ServiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceHealthDTO {
    private Long serviceId;
    private String serviceName;
    private String serviceCode;
    private ServiceStatus status;
    private BigDecimal criticality;
    private long activeIncidentsCount;
    private long totalIncidentsCount;
    private long slaBreachesCount;
    private double slaBreachRatePercentage;
    private long baselineMttrMinutes;
    private long actualAvgMttrMinutes;
    private boolean isDegraded;
}
