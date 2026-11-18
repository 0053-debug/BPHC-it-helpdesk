package com.iitsm.notification.service;

import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import com.iitsm.notification.model.Notification;
import com.iitsm.notification.model.NotificationChannel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Concrete GoF Observer for In-App Incident notifications.
 * Persists notifications directly to PostgreSQL database for client retrieval and periodic polling.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationObserver implements IncidentObserver {

    private final NotificationService notificationService;

    @Override
    @Transactional
    public void onIncidentEvent(IncidentEvent event) {
        if (event.getRecipientId() == null) {
            log.debug("No specific recipient for event {}, skipping direct user notification.", event.getEventType());
            return;
        }

        String title = String.format("[%s] Incident #%s", event.getEventType(), event.getIncidentId());
        String message = event.getDescription() != null ? event.getDescription() :
                String.format("Incident state changed: %s -> %s", event.getPreviousState(), event.getNewState());

        // 1. Persist notification in database
        Notification notification = Notification.builder()
                .recipientId(event.getRecipientId())
                .recipientEmail(event.getRecipientEmail())
                .title(title)
                .message(message)
                .channel(NotificationChannel.IN_APP_WS)
                .referenceId(event.getIncidentId())
                .isRead(false)
                .build();

        Notification saved = notificationService.save(notification);
        log.info("Persisted in-app notification #{} for user {}", saved.getId(), event.getRecipientId());
    }
}
