package com.iitsm.notification.service;

import com.iitsm.events.IncidentEvent;
import com.iitsm.events.IncidentObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Concrete GoF Observer for Automated WhatsApp Notifications via Green-API.
 * Dispatches asynchronously in the background like email without blocking domain transactions.
 */
@Component
@Order(6)
@RequiredArgsConstructor
@Slf4j
public class WhatsAppNotificationObserver implements IncidentObserver {

    private final GreenApiWhatsAppClient whatsAppClient;

    @Override
    @Async
    public void onIncidentEvent(IncidentEvent event) {
        String phone = null;
        if (event.getMetadata() != null && event.getMetadata().containsKey("phoneNumber")) {
            phone = (String) event.getMetadata().get("phoneNumber");
        }

        String eventType = event.getEventType() != null ? event.getEventType() : "INCIDENT_UPDATE";
        String message = buildWhatsAppMessage(event);

        log.info("[WHATSAPP OBSERVER] Dispatched background WhatsApp notification for event {} on incident #{}",
                eventType, event.getIncidentId());

        whatsAppClient.sendMessage(phone, message);
    }

    private String buildWhatsAppMessage(IncidentEvent event) {
        String eventType = event.getEventType() != null ? event.getEventType() : "UPDATE";
        String tracking = event.getTrackingNumber() != null ? event.getTrackingNumber() : String.valueOf(event.getIncidentId());
        String title = event.getTitle() != null ? event.getTitle() : "Support Incident";
        String newState = event.getNewState() != null ? event.getNewState() : "UPDATED";
        String desc = event.getDescription() != null ? event.getDescription() : "Action performed";

        StringBuilder sb = new StringBuilder();
        if (eventType.contains("BREACH") || eventType.contains("WARNING")) {
            sb.append("🚨 *URGENT: I-ITSM SLA Alert*\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━\n");
            sb.append("• *Ticket ID:* #").append(tracking).append("\n");
            sb.append("• *Subject:* ").append(title).append("\n");
            sb.append("• *Event:* ").append(eventType).append("\n");
            sb.append("• *Details:* ").append(desc).append("\n");
            sb.append("• *Portal:* https://bphc-it-helpdesk.web.app\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━");
        } else if ("INCIDENT_CREATED".equals(eventType)) {
            sb.append("🎫 *I-ITSM Incident Logged*\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━\n");
            sb.append("• *Ticket ID:* #").append(tracking).append("\n");
            sb.append("• *Subject:* ").append(title).append("\n");
            sb.append("• *Status:* ").append(newState).append("\n");
            sb.append("• *Assigned Specialist:* Campus IT Pool\n");
            sb.append("• *Portal:* https://bphc-it-helpdesk.web.app\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━\n");
            sb.append("Your request has been logged. You will receive updates here.");
        } else if ("INCIDENT_RESOLVED".equals(eventType)) {
            sb.append("✅ *I-ITSM Incident Resolved*\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━\n");
            sb.append("• *Ticket ID:* #").append(tracking).append("\n");
            sb.append("• *Subject:* ").append(title).append("\n");
            sb.append("• *Status:* RESOLVED\n");
            sb.append("• *Resolution Details:* ").append(desc).append("\n");
            sb.append("• *Portal:* https://bphc-it-helpdesk.web.app\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━\n");
            sb.append("Please log in to confirm the fix.");
        } else {
            sb.append("🔄 *I-ITSM Ticket Update*\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━\n");
            sb.append("• *Ticket ID:* #").append(tracking).append("\n");
            sb.append("• *Subject:* ").append(title).append("\n");
            sb.append("• *State Transition:* ").append(event.getPreviousState() != null ? event.getPreviousState() : "—")
              .append(" ➔ *").append(newState).append("*\n");
            sb.append("• *Action:* ").append(event.getAction() != null ? event.getAction() : eventType).append("\n");
            sb.append("• *Portal:* https://bphc-it-helpdesk.web.app\n");
            sb.append("━━━━━━━━━━━━━━━━━━━━━");
        }
        return sb.toString();
    }
}
