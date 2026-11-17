package com.iitsm.core.state;

import com.iitsm.core.exception.InvalidStateTransitionException;
import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public interface IncidentState {
    default void classify(Incident incident) {
        throw new InvalidStateTransitionException("Cannot classify from current state: " + getStatus());
    }
    default void assign(Incident incident) {
        throw new InvalidStateTransitionException("Cannot assign from current state: " + getStatus());
    }
    default void acknowledge(Incident incident) {
        throw new InvalidStateTransitionException("Cannot acknowledge from current state: " + getStatus());
    }
    default void startInvestigation(Incident incident) {
        throw new InvalidStateTransitionException("Cannot start investigation from current state: " + getStatus());
    }
    default void resolve(Incident incident, String resolutionNotes) {
        throw new InvalidStateTransitionException("Cannot resolve from current state: " + getStatus());
    }
    default void verify(Incident incident) {
        throw new InvalidStateTransitionException("Cannot verify from current state: " + getStatus());
    }
    default void close(Incident incident) {
        throw new InvalidStateTransitionException("Cannot close from current state: " + getStatus());
    }
    IncidentStatus getStatus();
}