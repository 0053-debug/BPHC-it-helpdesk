package com.iitsm.core.exception;

public class IitsmException extends RuntimeException {
    public IitsmException(String message) {
        super(message);
    }

    public IitsmException(String message, Throwable cause) {
        super(message, cause);
    }
}
