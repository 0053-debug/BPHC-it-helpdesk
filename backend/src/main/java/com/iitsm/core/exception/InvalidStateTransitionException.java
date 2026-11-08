package com.iitsm.core.exception;

public class InvalidStateTransitionException extends IitsmException {
    public InvalidStateTransitionException(String currentState, String attemptedState) {
        super(String.format("Invalid state transition attempted: %s -> %s is not permitted.", currentState, attemptedState));
    }
}
