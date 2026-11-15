package com.iitsm.notification.service;

import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Concrete GoF Observer for external SMTP Email notifications.
 * Sends beautifully styled HTML email templates.
 * Dispatches asynchronously; catches mail errors gracefully without affecting primary transactions.
 */
@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationObserver implements IncidentObserver {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:alerts@bphc-iitsm.internal}")
    private String fromEmail;

    @Override
    @Async
    public void onIncidentEvent(IncidentEvent event) {
        if (event.getRecipientEmail() == null || event.getRecipientEmail().isBlank()) {
            log.debug("No recipient email specified for event {}. Skipping email dispatch.", event.getEventType());
            return;
        }

        try {
            log.info("Preparing SMTP HTML email notification for recipient: {} on Incident: {}",
                    event.getRecipientEmail(), event.getIncidentId());

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String sender = (fromEmail != null && !fromEmail.isBlank() && fromEmail.contains("@")) 
                    ? fromEmail 
                    : "alerts@bphc-iitsm.internal";

            helper.setFrom(sender);
            helper.setTo(event.getRecipientEmail());
            helper.setSubject(String.format("[I-ITSM Alert] %s: Incident #%s",
                    event.getEventType(), event.getIncidentId()));

            String htmlContent = buildHtmlEmailTemplate(event);
            helper.setText(htmlContent, true); // true = HTML format

            mailSender.send(mimeMessage);
            log.info("HTML email successfully dispatched to {} via SMTP", event.getRecipientEmail());
        } catch (Exception ex) {
            // Graceful degradation rule from AGENTS.md: Mail downtime must not fail the primary transaction
            log.warn("SMTP email dispatch failed for recipient {}: {}. Continuing without transaction rollback.",
                    event.getRecipientEmail(), ex.getMessage());
        }
    }

    private String buildHtmlEmailTemplate(IncidentEvent event) {
        String eventType = event.getEventType() != null ? event.getEventType() : "INCIDENT_UPDATE";
        String trackingId = event.getTrackingNumber() != null ? event.getTrackingNumber() : "INC-" + event.getIncidentId();
        String title = event.getTitle() != null ? event.getTitle() : "Untitled Incident";
        String prev = event.getPreviousState() != null ? event.getPreviousState() : "INITIAL";
        String curr = event.getNewState() != null ? event.getNewState() : "UPDATED";
        String desc = event.getDescription() != null ? event.getDescription() : "Status updated by IT Operations.";
        String actor = event.getActorName() != null ? event.getActorName() : "System Automation";
        String role = event.getActorRole() != null ? event.getActorRole() : "SYSTEM";
        String time = event.getTimestamp() != null ? event.getTimestamp().toString() : java.time.Instant.now().toString();

        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'></head>" +
                "<body style='margin:0;padding:20px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#1e293b;'>" +
                "<table width='100%' border='0' cellspacing='0' cellpadding='0'>" +
                "<tr><td align='center'>" +
                "<table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>" +
                "<tr><td style='background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:24px 32px;color:#ffffff;'>" +
                "<table width='100%'><tr>" +
                "<td><h1 style='margin:0;font-size:20px;font-weight:800;letter-spacing:-0.5px;'>BPHC I-ITSM</h1><p style='margin:4px 0 0;font-size:12px;color:#bfdbfe;'>Campus IT Service Management & Resolution</p></td>" +
                "<td align='right'><span style='background:#1d4ed8;color:#ffffff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase;'>" + eventType + "</span></td>" +
                "</tr></table>" +
                "</td></tr>" +
                "<tr><td style='padding:32px;'>" +
                "<h2 style='margin:0 0 8px;font-size:16px;color:#0f172a;'>Notification on Ticket: <span style='color:#2563eb;'>" + trackingId + "</span></h2>" +
                "<p style='margin:0 0 20px;font-size:14px;color:#475569;font-weight:600;'>" + title + "</p>" +
                "<div style='background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:24px;border-left:4px solid #3b82f6;'>" +
                "<p style='margin:0 0 8px;font-size:13px;color:#334155;'><strong>Status Transition:</strong></p>" +
                "<div style='font-size:14px;font-weight:bold;'>" +
                "<span style='background:#e2e8f0;padding:3px 8px;border-radius:4px;color:#475569;'>" + prev + "</span>" +
                " <span style='color:#94a3b8;'>&rarr;</span> " +
                "<span style='background:#dbeafe;padding:3px 8px;border-radius:4px;color:#1d4ed8;'>" + curr + "</span>" +
                "</div>" +
                "</div>" +
                "<table width='100%' style='font-size:13px;border-collapse:collapse;margin-bottom:24px;'>" +
                "<tr><td style='padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;' width='30%'>Details:</td><td style='padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;'>" + desc + "</td></tr>" +
                "<tr><td style='padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;'>Updated By:</td><td style='padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;'>" + actor + " (" + role + ")</td></tr>" +
                "<tr><td style='padding:8px 0;color:#64748b;'>Timestamp (UTC):</td><td style='padding:8px 0;color:#1e293b;font-family:monospace;'>" + time + "</td></tr>" +
                "</table>" +
                "<div style='text-align:center;margin-top:28px;'>" +
                "<a href='http://localhost:5173/' style='background:#2563eb;color:#ffffff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;display:inline-block;'>Open Ticket in I-ITSM Console</a>" +
                "</div>" +
                "</td></tr>" +
                "<tr><td style='background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;'>" +
                "This is an automated notification from the BPHC I-ITSM Notification Subsystem (Observer Pattern). Please do not reply directly to this email." +
                "</td></tr>" +
                "</table>" +
                "</td></tr>" +
                "</table>" +
                "</body></html>";
    }
}
