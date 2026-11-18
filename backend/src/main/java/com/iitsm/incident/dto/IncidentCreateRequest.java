package com.iitsm.incident.dto;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.IncidentCategory;
import com.iitsm.core.enums.Urgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public record IncidentCreateRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 10000) String description,
        @NotNull @Positive Long serviceId,
        @NotNull IncidentCategory category,
        @NotNull Urgency urgency,
        @NotNull Impact impact) {}
