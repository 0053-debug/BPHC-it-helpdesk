package com.iitsm.user.config;

import com.iitsm.core.enums.AvailabilityStatus;
import com.iitsm.core.enums.UserRole;
import com.iitsm.core.model.Technician;
import com.iitsm.core.model.User;
import com.iitsm.core.model.Employee;
import com.iitsm.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(DemoAccountConfig.class);

    @Bean
    @ConditionalOnProperty(name = "app.demo-accounts.enabled", havingValue = "true")
    public ApplicationRunner demoAccountInitializer(
            Environment environment,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                saveUser(environment, userRepository, passwordEncoder, "DEMO_ADMIN", UserRole.ROLE_ADMIN,
                        "admin@bphc.ac.in", "Admin#BPHC!2026", "Campus Administrator", null);
                saveUser(environment, userRepository, passwordEncoder, "DEMO_TEAM_LEAD", UserRole.ROLE_TEAM_LEAD,
                        "lead@bphc.ac.in", "Lead#BPHC!2026", "IT Operations Lead", null);
                saveUser(environment, userRepository, passwordEncoder, "DEMO_TECHNICIAN", UserRole.ROLE_TECHNICIAN,
                        "tech@bphc.ac.in", "Tech#BPHC!2026", "Network Technician", "Networking, Hardware, Wi-Fi");
                saveUser(environment, userRepository, passwordEncoder, "DEMO_EMPLOYEE", UserRole.ROLE_EMPLOYEE,
                        "student@bphc.ac.in", "Student#BITS!2026", "BITS Student", null);
                if (environment.containsProperty("DEMO_TECHNICIAN_2_EMAIL")) {
                    saveUser(environment, userRepository, passwordEncoder, "DEMO_TECHNICIAN_2", UserRole.ROLE_TECHNICIAN,
                            "tech2@bphc.ac.in", "Tech#BPHC!2026", "Hardware Technician", "Hardware, Printers, Desktops");
                }
                if (environment.containsProperty("DEMO_TECHNICIAN_3_EMAIL")) {
                    saveUser(environment, userRepository, passwordEncoder, "DEMO_TECHNICIAN_3", UserRole.ROLE_TECHNICIAN,
                            "tech3@bphc.ac.in", "Tech#BPHC!2026", "Software Technician", "ERP, Linux, Windows, Accounts");
                }
            } catch (Exception exception) {
                log.warn("Non-fatal issue during demo account seeding: {}", exception.getMessage());
            }
        };
    }

    private void saveUser(
            Environment environment,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String prefix,
            UserRole role,
            String defaultEmail,
            String defaultPassword,
            String defaultName,
            String defaultSkills) {
        try {
            String email = getPropertyOrDefault(environment, prefix + "_EMAIL", defaultEmail).toLowerCase(Locale.ROOT);
            String password = getPropertyOrDefault(environment, prefix + "_PASSWORD", defaultPassword);
            if (password.getBytes(StandardCharsets.UTF_8).length < 8
                    || password.getBytes(StandardCharsets.UTF_8).length > 72) {
                password = defaultPassword;
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
                log.info("Synchronized credentials for demo account: {}", email);
                return;
            }

            String fullName = getPropertyOrDefault(environment, prefix + "_NAME", defaultName);
            if (role == UserRole.ROLE_TECHNICIAN) {
                String skills = getPropertyOrDefault(environment, prefix + "_SKILLS", defaultSkills != null ? defaultSkills : "General IT");
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
            log.info("Initialized demo account: {}", email);
        } catch (Exception exception) {
            log.warn("Could not save demo user for {}: {}", prefix, exception.getMessage());
        }
    }

    private String getPropertyOrDefault(Environment environment, String name, String defaultValue) {
        String value = environment.getProperty(name);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value.trim();
    }
}
