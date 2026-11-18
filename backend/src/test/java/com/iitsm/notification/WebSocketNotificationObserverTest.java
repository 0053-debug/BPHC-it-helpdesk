package com.iitsm.notification;

import com.iitsm.events.IncidentEvent;
import com.iitsm.notification.model.Notification;
import com.iitsm.notification.service.NotificationService;
import com.iitsm.notification.service.WebSocketNotificationObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketNotificationObserverTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private WebSocketNotificationObserver observer;

    private IncidentEvent event;

    @BeforeEach
    void setUp() {
        event = IncidentEvent.builder()
                .eventType("SLA_WARNING")
                .incidentId(202L)
                .recipientId(3L) // Alex Tech
                .recipientEmail("alex.tech@bphc.edu")
                .title("75% SLA Threshold Warning")
                .description("Incident #202 has reached 75% elapsed SLA window.")
                .timestamp(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Test 6: Persists notification to database for in-app client polling")
    void shouldPersistNotificationOnEvent() {
        when(notificationService.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        observer.onIncidentEvent(event);

        verify(notificationService, times(1)).save(any(Notification.class));
    }
}
