package backend.service;

import backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface NotificationService {
    
    // User methods
    Page<Notification> getUserNotifications(Long userId, Pageable pageable);
    List<Notification> getUnreadNotifications(Long userId);
    long getUnreadCount(Long userId);
    Notification markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    
    // Admin methods
    Page<Notification> getAllNotifications(Pageable pageable);
    Page<Notification> getUnreadNotifications(Pageable pageable);
    Notification createNotification(Notification notification);
    Notification createNotificationForUser(Long userId, String title, String message, Notification.NotificationType type, String link);
    void createNotificationForAllUsers(String title, String message, Notification.NotificationType type);
    Optional<Notification> getNotificationById(Long id);
    void deleteNotification(Long id);
    long getTotalNotifications();
}

