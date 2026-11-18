package com.iitsm.duplicate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DuplicateCheckRequest(@NotBlank String title, @NotBlank String description,
                                    @NotNull @Positive Long serviceId) {}
