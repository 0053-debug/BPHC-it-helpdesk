package com.iitsm.user.service;

import com.iitsm.core.enums.UserRole;
import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.model.Employee;
import com.iitsm.core.model.User;
import com.iitsm.user.dto.RegisterRequest;
import com.iitsm.user.repository.UserRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;
import java.nio.charset.StandardCharsets;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email));
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        int passwordBytes = request.password().getBytes(StandardCharsets.UTF_8).length;
        if (passwordBytes < 8 || passwordBytes > 72) {
            throw new IitsmException("Password must be 8 to 72 UTF-8 bytes");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IitsmException("Email is already registered");
        }

        Employee employee = Employee.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phoneNumber() != null ? request.phoneNumber().trim() : null)
                .role(UserRole.ROLE_EMPLOYEE)
                .build();

        try {
            return userRepository.save(employee);
        } catch (DataIntegrityViolationException exception) {
            throw new IitsmException("Email is already registered", exception);
        }
    }

    @Transactional
    public void updatePhoneNumber(String email, String phoneNumber) {
        User user = requireByEmail(email);
        user.setPhoneNumber(phoneNumber != null ? phoneNumber.trim() : null);
        userRepository.save(user);
    }

    public User requireByEmail(String email) {
        return findByEmail(email).orElseThrow(() -> new IitsmException("Authenticated account was not found"));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}