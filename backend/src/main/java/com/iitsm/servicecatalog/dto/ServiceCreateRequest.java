package com.iitsm.servicecatalog.dto;

import com.iitsm.servicecatalog.model.ServiceStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCreateRequest {

    @NotBlank(message = "Service name is required")
    private String name;

    @NotBlank(message = "Service code is required (e.g. SRV-AUTH)")
    private String code;

    private String description;

    @NotNull(message = "Criticality factor is required")
    @DecimalMin(value = "1.00", message = "Criticality factor must be at least 1.00")
    @DecimalMax(value = "2.00", message = "Criticality factor cannot exceed 2.00")
    private BigDecimal criticalityFactor;

    @NotNull(message = "Base SLA weight is required")
    private Integer baseSlaWeight;

    @NotNull(message = "Service status is required")
    private ServiceStatus status;

    private Integer baselineMttrMinutes;

    private Set<Long> dependencyIds;
}
