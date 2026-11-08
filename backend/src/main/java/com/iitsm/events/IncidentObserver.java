package com.iitsm.events;

/**
 * GoF Observer Interface for the Observer Pattern.
 * Implemented by downstream consumers (AuditLog, WebSocket, Email, FCM Push).
 */
public interface IncidentObserver {
    void onIncidentEvent(IncidentEvent event);
}
