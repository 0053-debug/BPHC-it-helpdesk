package com.iitsm.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentCommentRequest(@NotBlank @Size(max = 4000) String message) {}
