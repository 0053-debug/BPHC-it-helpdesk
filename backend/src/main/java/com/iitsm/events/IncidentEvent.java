package com.iitsm.events;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;

@Value
@Builder
public class IncidentEvent {
    String eventType;          // e.g. "INCIDENT_CREATED", "INCIDENT_ASSIGNED", "SLA_WARNING", "INCIDENT_RESOLVED"
    Long incidentId;
    String trackingNumber;
    Long actorId;
    String actorName;
    String actorRole;
    String action;
    String previousState;
    String newState;
    String title;
    String description;
    Long recipientId;          // Target user for notification (e.g. assigned technician or employee)
    String recipientEmail;
    Instant timestamp;
    Map<String, Object> metadata;
}
