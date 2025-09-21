package backend.repository;

import backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find notifications by user ID, ordered by created date
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find unread notifications by user ID
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find read notifications by user ID
     */
    List<Notification> findByUserIdAndIsReadTrueOrderByCreatedAtDesc(Long userId);
    
    /**
     * Count unread notifications by user
     */
    long countByUserIdAndIsReadFalse(Long userId);
    
    /**
     * Find notifications in date range
     */
    List<Notification> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * Find notifications by user with pagination
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Search notifications by message content
     */
    @Query("SELECT n FROM Notification n WHERE " +
           "n.user.id = :userId AND " +
           "LOWER(n.message) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> searchUserNotifications(@Param("userId") Long userId, 
                                              @Param("keyword") String keyword);
    
    /**
     * Mark all notifications as read for user
     */
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
    
    /**
     * Delete old notifications (older than specified date)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * Find recent notifications for all users
     */
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(Pageable pageable);
}
