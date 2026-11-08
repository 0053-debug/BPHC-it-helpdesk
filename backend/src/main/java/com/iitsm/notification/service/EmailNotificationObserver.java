package com.iitsm.notification.service;

import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Concrete GoF Observer for external SMTP Email notifications.
 * Dispatches asynchronously; catches mail errors gracefully without affecting primary transactions.
 */
@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationObserver implements IncidentObserver {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void onIncidentEvent(IncidentEvent event) {
        if (event.getRecipientEmail() == null || event.getRecipientEmail().isBlank()) {
            log.debug("No recipient email specified for event {}. Skipping email dispatch.", event.getEventType());
            return;
        }

        try {
            log.info("Preparing SMTP email notification for recipient: {} on Incident: {}", event.getRecipientEmail(), event.getIncidentId());

            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(event.getRecipientEmail());
            mailMessage.setSubject(String.format("[I-ITSM Alert] %s - Incident #%s", event.getEventType(), event.getIncidentId()));
            mailMessage.setText(String.format(
                    "Hello,\n\nAn update has occurred on IT Incident #%s (%s):\n\n" +
                    "Action: %s\n" +
                    "Status: %s -> %s\n" +
                    "Details: %s\n" +
                    "Actor: %s (%s)\n" +
                    "Time: %s\n\n" +
                    "Please log in to your I-ITSM dashboard to view details.\n\n" +
                    "--\nI-ITSM Automated System",
                    event.getIncidentId(),
                    event.getTitle() != null ? event.getTitle() : "Untitled",
                    event.getAction(),
                    event.getPreviousState(),
                    event.getNewState(),
                    event.getDescription(),
                    event.getActorName(),
                    event.getActorRole(),
                    event.getTimestamp()
            ));

            mailSender.send(mailMessage);
            log.info("Email successfully dispatched to {}", event.getRecipientEmail());
        } catch (Exception ex) {
            // Graceful degradation rule from AGENTS.md: Mail downtime must not fail the primary transaction
            log.warn("SMTP email dispatch failed for recipient {}: {}. Continuing without transaction rollback.",
                    event.getRecipientEmail(), ex.getMessage());
        }
    }
}
