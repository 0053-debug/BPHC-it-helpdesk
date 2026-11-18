package com.iitsm.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentResolutionRequest(@NotBlank @Size(max=4000) String resolutionNotes,
                                        @NotBlank @Size(max=4000) String rootCause) {}
