package com.iitsm.user;

import com.iitsm.core.enums.UserRole;
import com.iitsm.core.exception.GlobalExceptionHandler;
import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.config.SecurityConfig;
import com.iitsm.user.dto.AuthResponse;
import com.iitsm.user.dto.AssignmentStrategyResponse;
import com.iitsm.user.dto.RegisterResponse;
import com.iitsm.user.dto.UserResponse;
import com.iitsm.user.exception.InvalidCredentialsException;
import com.iitsm.user.assignment.AssignmentStrategyType;
import com.iitsm.user.security.JwtAuthenticationFilter;
import com.iitsm.user.security.JwtTokenProvider;
import com.iitsm.user.security.RestAccessDeniedHandler;
import com.iitsm.user.security.RestAuthenticationEntryPoint;
import com.iitsm.user.controller.AssignmentStrategyController;
import com.iitsm.user.controller.AuthController;
import com.iitsm.user.service.AuthService;
import com.iitsm.user.service.TechnicianAssignmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.http.MediaType.APPLICATION_JSON;

@WebMvcTest(controllers = {AuthController.class, AssignmentStrategyController.class})
@AutoConfigureMockMvc
@Import({
        SecurityConfig.class,
        GlobalExceptionHandler.class,
        JwtAuthenticationFilter.class,
        JwtTokenProvider.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class
})
@TestPropertySource(properties = {
        "app.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "app.cors.allowed-origins=http://localhost:5173"
})
class AuthAndSecurityApiTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private AuthService authService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private TechnicianAssignmentService assignmentService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private UserDetailsService userDetailsService;

    @Test
    void registrationReturnsSafeEmployeeResponseAndRejectsDuplicateEmail() throws Exception {
        RegisterResponse response = new RegisterResponse(
                "test-token", "Bearer",
                new UserResponse(8L, "New Employee", "employee@example.edu", UserRole.ROLE_EMPLOYEE));
        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                        {"fullName":"New Employee","email":"employee@example.edu","password":"good-pass-8","role":"ROLE_ADMIN"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("ROLE_EMPLOYEE"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());

        when(authService.register(any())).thenThrow(new IitsmException("Email is already registered"));
        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"fullName":"New Employee","email":"employee@example.edu","password":"good-pass-8"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void registrationRejectsInvalidPasswordBeforeServiceCall() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"fullName":"New Employee","email":"employee@example.edu","password":"short"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginReturnsTokenAndWrongCredentialsReturnUnauthorized() throws Exception {
        when(authService.login(any())).thenReturn(new AuthResponse(
                "test-token", "Bearer",
                new UserResponse(8L, "New Employee", "employee@example.edu", UserRole.ROLE_EMPLOYEE)));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"email":"employee@example.edu","password":"good-pass-8"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("test-token"))
                .andExpect(jsonPath("$.user.role").value("ROLE_EMPLOYEE"));

        when(authService.login(any())).thenThrow(new InvalidCredentialsException());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"email":"employee@example.edu","password":"wrong-pass"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void employeeIsForbiddenFromAdminAssignmentStrategyEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/assignment-strategy"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/assignment-strategy")
                        .with(user("employee@example.edu").roles("EMPLOYEE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void administratorCanSelectPriorityAwareStrategyThroughApi() throws Exception {
        when(assignmentService.setActiveStrategy(AssignmentStrategyType.PRIORITY_AWARE))
                .thenReturn(new AssignmentStrategyResponse(AssignmentStrategyType.PRIORITY_AWARE));

        mockMvc.perform(post("/api/admin/assignment-strategy")
                        .with(user("admin@example.edu").roles("ADMIN"))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"strategy":"PRIORITY_AWARE"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.strategy").value("PRIORITY_AWARE"));
        verify(assignmentService).setActiveStrategy(AssignmentStrategyType.PRIORITY_AWARE);
    }
}
