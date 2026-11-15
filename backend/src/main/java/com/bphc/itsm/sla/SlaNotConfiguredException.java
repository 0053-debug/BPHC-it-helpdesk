package com.bphc.itsm.sla;

public class SlaNotConfiguredException extends RuntimeException {
    public SlaNotConfiguredException(String message) {
        super(message);
    }
}