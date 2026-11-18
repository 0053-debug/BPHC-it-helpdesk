package com.iitsm.incident.dto;

import java.time.Instant;

public record IncidentResponse(
        Long id, String trackingNumber, String title, String description,
        Long serviceId, String serviceName, String category, String urgency,
        String impact, String priority, java.math.BigDecimal priorityScore,
        java.math.BigDecimal criticalityFactor, Integer serviceWeight, String status, Long reporterId,
        String reporterName, Long technicianId, String technicianName,
        Long primaryIncidentId, boolean potentialDuplicate, boolean slaBreached,
        Instant responseDeadline, Instant resolutionDeadline, Instant assignedAt,
        Instant acknowledgedAt, Instant resolvedAt, Instant closedAt, Instant createdAt,
        Instant updatedAt, String resolutionNotes, String rootCause) {}
