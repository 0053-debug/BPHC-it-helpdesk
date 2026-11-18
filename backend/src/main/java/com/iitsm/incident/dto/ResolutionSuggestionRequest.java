package com.iitsm.incident.dto;

import com.iitsm.core.enums.IncidentCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ResolutionSuggestionRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 10000) String description,
        @NotNull @Positive Long serviceId,
        @NotNull IncidentCategory category) {}
