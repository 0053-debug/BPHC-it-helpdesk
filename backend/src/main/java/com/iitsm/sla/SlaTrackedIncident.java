package com.iitsm.sla;

import com.iitsm.core.enums.Priority;

import java.time.LocalDateTime;

public record SlaTrackedIncident(Long id,
                                 Priority priority,
                                 LocalDateTime createdAt,
                                 LocalDateTime acknowledgedAt,
                                 LocalDateTime resolvedAt,
                                 LocalDateTime assignedAt) {
    public SlaTrackedIncident(Long id, Priority priority, LocalDateTime createdAt,
                              LocalDateTime acknowledgedAt, LocalDateTime resolvedAt) {
        this(id, priority, createdAt, acknowledgedAt, resolvedAt, null);
    }
}
