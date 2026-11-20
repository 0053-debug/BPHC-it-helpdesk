package com.iitsm.duplicate;

import com.iitsm.core.exception.IitsmException;

public class EmbeddingUnavailableException extends IitsmException {

    public EmbeddingUnavailableException(String message) {
        super(message);
    }

    public EmbeddingUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
