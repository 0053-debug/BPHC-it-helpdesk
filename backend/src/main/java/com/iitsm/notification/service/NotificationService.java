package com.iitsm.notification.service;

import com.iitsm.core.exception.ResourceNotFoundException;
import com.iitsm.notification.model.Notification;
import com.iitsm.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsForUser(Long userId, int page, int size) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }
}
