package com.iitsm.user.dto;

public record ForgotPasswordResponse(
    String message,
    String resetLink,
    boolean emailDispatched
) {}
