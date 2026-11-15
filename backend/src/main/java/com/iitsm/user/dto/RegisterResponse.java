package com.iitsm.user.dto;

public record RegisterResponse(String accessToken, String tokenType, UserResponse user) {}
