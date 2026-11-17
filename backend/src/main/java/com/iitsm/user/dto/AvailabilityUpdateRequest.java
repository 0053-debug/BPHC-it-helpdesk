package com.iitsm.user.dto;

import com.iitsm.core.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;

public record AvailabilityUpdateRequest(@NotNull AvailabilityStatus availability) {}
