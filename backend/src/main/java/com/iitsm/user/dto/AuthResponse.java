package com.iitsm.user.dto;

public record AuthResponse(String accessToken, String tokenType, UserResponse user) {}
