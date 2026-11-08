package com.iitsm.notification.service;

import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import com.iitsm.notification.model.Notification;
import com.iitsm.notification.model.NotificationChannel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Concrete GoF Observer for Real-Time In-App WebSocket notifications.
 * Broadcasts via STOMP broker to connected React clients.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationObserver implements IncidentObserver {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void onIncidentEvent(IncidentEvent event) {
        if (event.getRecipientId() == null) {
            log.debug("No specific recipient for event {}, broadcasting only to admin topic.", event.getEventType());
        } else {
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

            // 2. Broadcast via STOMP WebSocket topic for this specific recipient
            String userTopic = "/topic/notifications/" + event.getRecipientId();
            try {
                messagingTemplate.convertAndSend(userTopic, saved);
                log.info("Dispatched WebSocket notification to user topic: {}", userTopic);
            } catch (Exception e) {
                log.warn("Could not dispatch WebSocket message to {}: {}", userTopic, e.getMessage());
            }
        }

        // 3. Global notification for admins/team leads
        try {
            messagingTemplate.convertAndSend("/topic/admin-alerts", event);
        } catch (Exception e) {
            log.warn("Could not dispatch WebSocket message to /topic/admin-alerts: {}", e.getMessage());
        }
    }
}
