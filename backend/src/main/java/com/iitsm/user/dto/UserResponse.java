package com.iitsm.user.dto;

import com.iitsm.core.enums.UserRole;
import com.iitsm.core.model.User;

public record UserResponse(Long id, String fullName, String email, UserRole role, String phoneNumber) {
    public UserResponse(Long id, String fullName, String email, UserRole role) {
        this(id, fullName, email, role, null);
    }
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getPhoneNumber());
    }
}
