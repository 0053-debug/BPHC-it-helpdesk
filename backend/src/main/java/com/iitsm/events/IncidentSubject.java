package com.iitsm.events;

/**
 * GoF Subject Interface for the Observer Pattern.
 * Enforces decoupling between domain lifecycle actions and event consumers.
 */
public interface IncidentSubject {
    void registerObserver(IncidentObserver observer);
    void removeObserver(IncidentObserver observer);
    void notifyObservers(IncidentEvent event);
}
