package com.iitsm.servicecatalog.exception;

import com.iitsm.core.exception.IitsmException;

public class CircularDependencyException extends IitsmException {

    public CircularDependencyException(String message) {
        super(message);
    }
}