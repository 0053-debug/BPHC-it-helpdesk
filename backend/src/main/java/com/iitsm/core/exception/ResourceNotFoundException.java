package com.iitsm.core.exception;

public class ResourceNotFoundException extends IitsmException {
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s not found with identifier: %s", resourceName, identifier));
    }
}
