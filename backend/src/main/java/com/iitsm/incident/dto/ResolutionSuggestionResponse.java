package com.iitsm.incident.dto;

public record ResolutionSuggestionResponse(
        String category, String priority, String resolution, String rootCause, double similarity) {}
