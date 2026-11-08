package com.iitsm.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushNotification;
import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Concrete GoF Observer for Google Firebase Cloud Messaging (FCM) Mobile Push Notifications.
 * Runs in live FCM mode if credentials exist, or structured simulation mode if running locally.
 */
@Component
@Order(4)
@Slf4j
public class FcmPushNotificationObserver implements IncidentObserver {

    private final FirebaseMessaging firebaseMessaging;

    @Autowired
    public FcmPushNotificationObserver(@Autowired(required = false) FirebaseMessaging firebaseMessaging) {
        this.firebaseMessaging = firebaseMessaging;
    }

    @Override
    @Async
    public void onIncidentEvent(IncidentEvent event) {
        String title = String.format("[%s] Incident #%s", event.getEventType(), event.getIncidentId());
        String body = event.getDescription() != null ? event.getDescription() : "Status updated: " + event.getNewState();

        // Check if metadata contains an explicit target device token
        String targetToken = null;
        if (event.getMetadata() != null && event.getMetadata().containsKey("fcmToken")) {
            targetToken = (String) event.getMetadata().get("fcmToken");
        }

        if (firebaseMessaging == null) {
            // Simulated Push Notification Mode
            log.info("[SIMULATED FCM PUSH] Title: '{}' | Body: '{}' | Target Device: '{}' | Incident ID: {}",
                    title, body, targetToken != null ? targetToken : "ALL_REGISTERED_DEVICES", event.getIncidentId());
            return;
        }

        if (targetToken == null || targetToken.isBlank()) {
            log.debug("No FCM device token provided for recipient {}. Skipping live push.", event.getRecipientId());
            return;
        }

        try {
            Message message = Message.builder()
                    .setToken(targetToken)
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setWebpushConfig(WebpushConfig.builder()
                            .setNotification(WebpushNotification.builder()
                                    .setIcon("/vite.svg")
                                    .setBadge("/vite.svg")
                                    .build())
                            .build())
                    .putData("incidentId", String.valueOf(event.getIncidentId()))
                    .putData("eventType", event.getEventType())
                    .build();

            String response = firebaseMessaging.send(message);
            log.info("Live FCM push message successfully dispatched. FCM Response ID: {}", response);
        } catch (Exception e) {
            log.warn("Failed to dispatch FCM push notification: {}. Falling back to simulation.", e.getMessage());
        }
    }
}
