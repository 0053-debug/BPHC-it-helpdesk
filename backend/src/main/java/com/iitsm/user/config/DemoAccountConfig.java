package com.iitsm.user.config;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.UserRole;
import com.iitsm.core.model.Technician;
import com.iitsm.core.model.User;
import com.iitsm.core.model.Employee;
import com.iitsm.user.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Configuration
public class DemoAccountConfig {

    @Bean
    @ConditionalOnProperty(name = "app.demo-accounts.enabled", havingValue = "true")
    public ApplicationRunner demoAccountInitializer(
            Environment environment,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            saveUser(environment, userRepository, passwordEncoder, "DEMO_ADMIN", UserRole.ROLE_ADMIN);
            saveUser(environment, userRepository, passwordEncoder, "DEMO_TEAM_LEAD", UserRole.ROLE_TEAM_LEAD);
            saveUser(environment, userRepository, passwordEncoder, "DEMO_TECHNICIAN", UserRole.ROLE_TECHNICIAN);
            saveUser(environment, userRepository, passwordEncoder, "DEMO_EMPLOYEE", UserRole.ROLE_EMPLOYEE);
            if (environment.containsProperty("DEMO_TECHNICIAN_2_EMAIL")) {
                saveUser(environment, userRepository, passwordEncoder, "DEMO_TECHNICIAN_2", UserRole.ROLE_TECHNICIAN);
            }
            if (environment.containsProperty("DEMO_TECHNICIAN_3_EMAIL")) {
                saveUser(environment, userRepository, passwordEncoder, "DEMO_TECHNICIAN_3", UserRole.ROLE_TECHNICIAN);
            }
        };
    }

    private void saveUser(
            Environment environment,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String prefix,
            UserRole role) {
        String email = required(environment, prefix + "_EMAIL").toLowerCase(Locale.ROOT);
        String password = required(environment, prefix + "_PASSWORD");
        if (password.getBytes(StandardCharsets.UTF_8).length < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException(prefix + "_PASSWORD must be 8 to 72 UTF-8 bytes");
        }

        var existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setActive(true);
            if (user instanceof Technician tech && role == UserRole.ROLE_TECHNICIAN) {
                tech.setStatus(AvailabilityStatus.AVAILABLE);
            }
            userRepository.save(user);
            return;
        }

        String fullName = required(environment, prefix + "_NAME");
        if (role == UserRole.ROLE_TECHNICIAN) {
            String skills = required(environment, prefix + "_SKILLS");
            Technician technician = Technician.builder()
                    .fullName(fullName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .skills(skills)
                    .maxWorkload(5)
                    .status(AvailabilityStatus.AVAILABLE)
                    .build();
            userRepository.save(technician);
        } else if (role == UserRole.ROLE_EMPLOYEE) {
            Employee employee = Employee.builder()
                    .fullName(fullName).email(email).passwordHash(passwordEncoder.encode(password))
                    .role(role).build();
            userRepository.save(employee);
        } else {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .build();
            userRepository.save(user);
        }
    }

    private String required(Environment environment, String name) {
        String value = environment.getProperty(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is required when demo accounts are enabled");
        }
        return value.trim();
    }
}
