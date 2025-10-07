package backend.service.impl;

import backend.entity.Notification;
import backend.entity.User;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    @Override
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
    
    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUnreadNotifications(Pageable pageable) {
        return notificationRepository.findByIsReadFalse(pageable);
    }
    
    @Override
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }
    
    @Override
    public Notification createNotificationForUser(Long userId, String title, String message, 
                                                 Notification.NotificationType type, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        notification.setIsRead(false);
        
        return notificationRepository.save(notification);
    }
    
    @Override
    public void createNotificationForAllUsers(String title, String message, Notification.NotificationType type) {
        List<User> allUsers = userRepository.findAll();
        
        for (User user : allUsers) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setIsRead(false);
            
            notificationRepository.save(notification);
        }
        
        log.info("Created {} notifications for all users", allUsers.size());
    }
    
    @Override
    public void createNotificationForAdmins(String title, String message, Notification.NotificationType type, String link) {
        List<User> admins = userRepository.findByRoleName("ROLE_ADMIN");
        
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setLink(link);
            notification.setIsRead(false);
            
            notificationRepository.save(notification);
        }
        
        log.info("Created {} notifications for admins", admins.size());
    }
    
    @Override
    public void createNotificationForUsers(String title, String message, Notification.NotificationType type, String link) {
        List<User> users = userRepository.findByRoleName("ROLE_USER");
        
        for (User user : users) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setLink(link);
            notification.setIsRead(false);
            
            notificationRepository.save(notification);
        }
        
        log.info("Created {} notifications for users", users.size());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }
    
    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getTotalNotifications() {
        return notificationRepository.count();
    }
}

