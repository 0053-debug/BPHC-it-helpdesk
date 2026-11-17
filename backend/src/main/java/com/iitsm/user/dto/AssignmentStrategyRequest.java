package com.iitsm.user.dto;

import com.iitsm.user.assignment.AssignmentStrategyType;
import jakarta.validation.constraints.NotNull;

public record AssignmentStrategyRequest(@NotNull AssignmentStrategyType strategy) {}
