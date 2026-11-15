package com.iitsm.user;

import com.iitsm.core.enums.UserRole;
import com.iitsm.core.model.User;
import com.iitsm.user.dto.AuthResponse;
import com.iitsm.user.dto.LoginRequest;
import com.iitsm.user.exception.InvalidCredentialsException;
import com.iitsm.user.security.JwtTokenProvider;
import com.iitsm.user.service.AuthService;
import com.iitsm.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginNormalizesEmailAndReturnsTokenForSafeUserSummary() {
        User user = User.builder()
                .id(2L)
                .fullName("Employee")
                .email("person@example.edu")
                .passwordHash("$2a$10$hash")
                .role(UserRole.ROLE_EMPLOYEE)
                .build();
        when(userService.requireByEmail("person@example.edu")).thenReturn(user);
        when(tokenProvider.issueToken(user)).thenReturn("signed-jwt");

        AuthResponse response = authService.login(new LoginRequest("PERSON@Example.edu", "passphrase"));

        ArgumentCaptor<UsernamePasswordAuthenticationToken> credentials =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(credentials.capture());
        assertEquals("person@example.edu", credentials.getValue().getPrincipal());
        assertEquals("passphrase", credentials.getValue().getCredentials());
        assertEquals("signed-jwt", response.accessToken());
        assertEquals(UserRole.ROLE_EMPLOYEE, response.user().role());
    }

    @Test
    void incorrectCredentialsProduceUnauthorizedDomainError() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("wrong password"));

        assertThrows(InvalidCredentialsException.class,
                () -> authService.login(new LoginRequest("person@example.edu", "wrong-pass")));
    }
}
