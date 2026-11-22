package com.iitsm.notification.service;

import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Concrete GoF Observer for SMS Notifications (e.g. Twilio, AWS SNS, or Campus Telecom SMS Gateway).
 * Demonstrates open-closed extensibility by allowing new notification channels
 * to plug in without modifying core domain entities or state transition logic.
 */
@Component
@Order(5)
@Slf4j
public class SmsNotificationObserver implements IncidentObserver {

    @Override
    @Async
    public void onIncidentEvent(IncidentEvent event) {
        String recipient = event.getRecipientEmail() != null ? event.getRecipientEmail() : "campus-broadcast";
        String message = String.format("[I-ITSM SMS Alert] %s on Incident #%s. New state: %s. Description: %s",
                event.getEventType(),
                event.getIncidentId(),
                event.getNewState() != null ? event.getNewState() : "UPDATED",
                event.getDescription() != null ? event.getDescription() : "Action performed");

        log.info("[SIMULATED SMS GATEWAY] Outbound SMS dispatched to recipient '{}' -> {}", recipient, message);
    }
}
