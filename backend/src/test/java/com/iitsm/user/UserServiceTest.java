package com.iitsm.user;

import com.iitsm.core.enums.UserRole;
import com.iitsm.core.model.User;
import com.iitsm.user.dto.RegisterRequest;
import com.iitsm.user.repository.UserRepository;
import com.iitsm.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void registrationNormalizesEmailHashesPasswordAndAlwaysCreatesEmployee() {
        when(userRepository.findByEmail("employee@example.edu")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("good-pass-8")).thenReturn("$2a$10$test-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = userService.register(new RegisterRequest(
                "  New Employee  ", " Employee@Example.edu ", "good-pass-8"));

        assertEquals("New Employee", user.getFullName());
        assertEquals("employee@example.edu", user.getEmail());
        assertEquals(UserRole.ROLE_EMPLOYEE, user.getRole());
        assertNotEquals("good-pass-8", user.getPasswordHash());
        verify(passwordEncoder).encode("good-pass-8");
    }

    @Test
    void registrationRejectsDuplicateEmail() {
        when(userRepository.findByEmail("employee@example.edu"))
                .thenReturn(Optional.of(User.builder().email("employee@example.edu").build()));

        org.junit.jupiter.api.Assertions.assertThrows(
                com.iitsm.core.exception.IitsmException.class,
                () -> userService.register(new RegisterRequest(
                        "New Employee", "employee@example.edu", "good-pass-8")));
    }
}
