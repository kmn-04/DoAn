package backend.repository;

import backend.model.ActivityLog;
import backend.model.ActionType;
import backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    // Find all logs for a specific user
    Page<ActivityLog> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find logs by user ID
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find logs by user and action type
    Page<ActivityLog> findByUserAndActionTypeOrderByCreatedAtDesc(User user, ActionType actionType, Pageable pageable);
    
    // Find logs by user and date range
    @Query("SELECT al FROM ActivityLog al WHERE al.user = :user AND " +
           "(:fromDate IS NULL OR al.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR al.createdAt <= :toDate) " +
           "ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByUserAndDateRange(
            @Param("user") User user,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);
    
    // Find logs with all filters
    @Query("SELECT al FROM ActivityLog al WHERE al.user = :user AND " +
           "(:actionType IS NULL OR al.actionType = :actionType) AND " +
           "(:fromDate IS NULL OR al.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR al.createdAt <= :toDate) " +
           "ORDER BY al.createdAt DESC")
    Page<ActivityLog> findByUserWithFilters(
            @Param("user") User user,
            @Param("actionType") ActionType actionType,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);
    
    // Find recent login logs for a user
    @Query("SELECT al FROM ActivityLog al WHERE al.user = :user AND " +
           "al.actionType = 'LOGIN' ORDER BY al.createdAt DESC")
    List<ActivityLog> findRecentLoginsByUser(@Param("user") User user, Pageable pageable);
    
    // Count total logs for a user
    long countByUser(User user);
    
    // Count logs by user and action type
    long countByUserAndActionType(User user, ActionType actionType);
    
    // Find logs by action type (for admin)
    Page<ActivityLog> findByActionTypeOrderByCreatedAtDesc(ActionType actionType, Pageable pageable);
    
    // Find all logs with date range (for admin)
    @Query("SELECT al FROM ActivityLog al WHERE " +
           "(:fromDate IS NULL OR al.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR al.createdAt <= :toDate) " +
           "ORDER BY al.createdAt DESC")
    Page<ActivityLog> findAllWithDateRange(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);
}
