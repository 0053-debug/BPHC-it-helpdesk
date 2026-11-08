package com.iitsm.servicecatalog.dto;

import com.iitsm.servicecatalog.model.ServiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponseDTO {

    private Long id;
    private String name;
    private String code;
    private String description;
    private BigDecimal criticalityFactor;
    private Integer baseSlaWeight;
    private ServiceStatus status;
    private Integer baselineMttrMinutes;
    private Set<Long> dependencyIds;
    private Set<String> dependencyNames;
    private Instant createdAt;
    private Instant updatedAt;
}
