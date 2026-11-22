package com.iitsm.user.service;

import com.iitsm.core.model.User;
import com.iitsm.user.dto.AuthResponse;
import com.iitsm.user.dto.LoginRequest;
import com.iitsm.user.dto.RegisterRequest;
import com.iitsm.user.dto.RegisterResponse;
import com.iitsm.user.dto.UserResponse;
import com.iitsm.user.exception.InvalidCredentialsException;
import com.iitsm.user.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserService userService,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public RegisterResponse register(RegisterRequest request) {
        User user = userService.register(request);
        return new RegisterResponse(tokenProvider.issueToken(user), "Bearer", UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new InvalidCredentialsException();
        }
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        if (userService.findByEmail(email).isEmpty()) {
            throw new InvalidCredentialsException("No account registered with email '" + email + "'. Please create an account to get started.");
        }
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    email, request.password()));
        } catch (AuthenticationException exception) {
            if (exception instanceof InternalAuthenticationServiceException) {
                throw exception;
            }
            throw new InvalidCredentialsException("Incorrect password for '" + email + "'. Please check your password or use 'Forgot password'.");
        }
        User user = userService.requireByEmail(email);
        return new AuthResponse(tokenProvider.issueToken(user), "Bearer", UserResponse.from(user));
    }
}
