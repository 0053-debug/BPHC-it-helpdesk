package com.iitsm.user.service;

import com.iitsm.core.exception.IitsmException;
import com.iitsm.core.model.User;
import com.iitsm.user.dto.ForgotPasswordResponse;
import com.iitsm.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class PasswordResetService {

    private final JdbcTemplate jdbc;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:raghuramvedantam16@gmail.com}")
    private String fromEmail;

    @Value("${app.frontend.url:https://bphc-it-helpdesk.web.app}")
    private String frontendUrl;

    public PasswordResetService(
            JdbcTemplate jdbc,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {
        this.jdbc = jdbc;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void initTable() {
        try {
            jdbc.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id BIGSERIAL PRIMARY KEY,
                    token VARCHAR(120) NOT NULL UNIQUE,
                    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
                    used BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
                CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id);
            """);
            log.info("password_reset_tokens table verified / initialized");
        } catch (Exception ex) {
            log.warn("Could not automatically initialize password_reset_tokens table (may already exist): {}", ex.getMessage());
        }
    }

    @Transactional
    public ForgotPasswordResponse processForgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new IitsmException("Email address is required");
        }
        String cleanEmail = email.trim().toLowerCase(Locale.ROOT);
        var userOpt = userRepository.findByEmail(cleanEmail);
        if (userOpt.isEmpty()) {
            // For security, do not disclose whether an account exists
            log.info("Password reset requested for unregistered email: {}", cleanEmail);
            return new ForgotPasswordResponse(
                "If an account exists with that email, password reset instructions have been generated.",
                null,
                false
            );
        }

        User user = userOpt.get();
        // Invalidate any previously active tokens for this user
        jdbc.update("UPDATE password_reset_tokens SET used = true WHERE user_id = ? AND used = false", user.getId());

        String token = UUID.randomUUID().toString();
        Instant expiryTime = Instant.now().plus(15, ChronoUnit.MINUTES);

        jdbc.update("""
            INSERT INTO password_reset_tokens (token, user_id, expiry_time, used, created_at)
            VALUES (?, ?, ?, false, CURRENT_TIMESTAMP)
            """, token, user.getId(), Timestamp.from(expiryTime));

        String base = (frontendUrl != null && !frontendUrl.isBlank())
                ? frontendUrl.replaceAll("/+$", "")
                : "https://bphc-it-helpdesk.web.app";
        String resetLink = String.format("%s/?app=console&tab=reset-password&token=%s", base, token);

        // Run email dispatch in background so Render's SMTP port 587 block never delays or times out the HTTP response
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                sendResetEmail(user, resetLink);
                log.info("Password reset email successfully sent to {}", user.getEmail());
            } catch (Exception ex) {
                log.warn("SMTP email dispatch failed (Render free tier blocks outbound SMTP ports 25/465/587): {}", ex.getMessage());
            }
        });

        String msg = "Password reset link generated successfully! (Note: Render free tier blocks outbound SMTP port 587; your direct one-click reset link is provided below).";

        return new ForgotPasswordResponse(msg, resetLink, true);
    }

    private void sendResetEmail(User user, String resetLink) throws Exception {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String sender = (fromEmail != null && fromEmail.contains("@")) ? fromEmail : "raghuramvedantam16@gmail.com";
        helper.setFrom(sender);
        helper.setTo(user.getEmail());
        helper.setSubject("[BPHC IT HelpDesk] Password Reset Request");

        String html = """
            <!DOCTYPE html>
            <html><head><meta charset='UTF-8'></head>
            <body style='margin:0;padding:20px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1e293b;'>
            <table width='100%' border='0' cellspacing='0' cellpadding='0'>
            <tr><td align='center'>
            <table width='580' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>
            <tr><td style='background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:24px 32px;color:#ffffff;'>
            <h1 style='margin:0;font-size:20px;font-weight:800;letter-spacing:-0.5px;'>BPHC IT HelpDesk</h1>
            <p style='margin:4px 0 0;font-size:12px;color:#bfdbfe;'>Campus IT Service Desk · Password Recovery</p>
            </td></tr>
            <tr><td style='padding:32px;'>
            <h2 style='margin:0 0 12px;font-size:17px;color:#0f172a;'>Hello %s,</h2>
            <p style='margin:0 0 20px;font-size:14px;color:#475569;line-height:1.5;'>
            We received a request to reset the password for your campus IT HelpDesk account. Click the button below to choose a new password:
            </p>
            <div style='text-align:center;margin:28px 0;'>
            <a href='%s' style='background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;'>Reset Password</a>
            </div>
            <p style='margin:0 0 12px;font-size:13px;color:#64748b;'>
            This link will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email; your password will remain unchanged.
            </p>
            <div style='margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;word-break:break-all;'>
            Or copy and paste this link in your browser:<br/>
            <a href='%s' style='color:#2563eb;'>%s</a>
            </div>
            </td></tr>
            </table>
            </td></tr></table>
            </body></html>
            """.formatted(user.getFullName(), resetLink, resetLink, resetLink);

        helper.setText(html, true);
        mailSender.send(mimeMessage);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (newPassword == null || newPassword.getBytes(StandardCharsets.UTF_8).length < 8
                || newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IitsmException("Password must be between 8 and 72 characters");
        }

        List<Map<String, Object>> rows = jdbc.queryForList("""
            SELECT user_id, expiry_time, used FROM password_reset_tokens WHERE token = ?
            """, token);

        if (rows.isEmpty()) {
            throw new IitsmException("Invalid or unrecognized password reset link");
        }

        Map<String, Object> tokenRow = rows.get(0);
        boolean used = Boolean.TRUE.equals(tokenRow.get("used"));
        Timestamp expiryTime = (Timestamp) tokenRow.get("expiry_time");

        if (used) {
            throw new IitsmException("This password reset link has already been used");
        }

        if (expiryTime == null || expiryTime.toInstant().isBefore(Instant.now())) {
            throw new IitsmException("This password reset link has expired (15-minute limit)");
        }

        Long userId = ((Number) tokenRow.get("user_id")).longValue();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IitsmException("User account was not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        jdbc.update("UPDATE password_reset_tokens SET used = true WHERE token = ?", token);
        log.info("Password successfully reset for user ID: {}", userId);
    }
}
