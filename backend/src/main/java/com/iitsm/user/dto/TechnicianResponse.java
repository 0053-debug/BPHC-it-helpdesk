package com.iitsm.user.dto;

import com.iitsm.core.enums.AvailabilityStatus;

import java.util.List;

public record TechnicianResponse(
        Long id,
        String fullName,
        String email,
        List<String> skills,
        AvailabilityStatus availability,
        int activeWorkload,
        int capacity) {}
