package com.iitsm.incident.dto;

import java.time.Instant;

public record IncidentCommentResponse(Long id, Long incidentId, Long authorId,
                                      String authorName, String message, Instant createdAt) {}
