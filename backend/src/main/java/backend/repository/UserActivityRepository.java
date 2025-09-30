package backend.repository;

import backend.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long>, JpaSpecificationExecutor<UserActivity> {
    
    // Find activities by user
    List<UserActivity> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    Page<UserActivity> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find activities by type
    List<UserActivity> findByActivityTypeOrderByCreatedAtDesc(String activityType);
    
    Page<UserActivity> findByActivityTypeOrderByCreatedAtDesc(String activityType, Pageable pageable);
    
    // Find activities by user and type
    List<UserActivity> findByUser_IdAndActivityTypeOrderByCreatedAtDesc(Long userId, String activityType);
    
    // Find recent activities
    List<UserActivity> findTop10ByOrderByCreatedAtDesc();
    
    List<UserActivity> findTop100ByOrderByCreatedAtDesc();
    
    // Find activities within date range
    @Query("SELECT ua FROM UserActivity ua WHERE ua.createdAt BETWEEN :startDate AND :endDate ORDER BY ua.createdAt DESC")
    List<UserActivity> findActivitiesBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.createdAt BETWEEN :startDate AND :endDate ORDER BY ua.createdAt DESC")
    Page<UserActivity> findActivitiesBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate, 
                                                  Pageable pageable);
    
    // Count activities by type
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.activityType = :activityType")
    Long countByActivityType(@Param("activityType") String activityType);
    
    // Count activities by user
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    // Count activities by user and type
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = :activityType")
    Long countByUserIdAndActivityType(@Param("userId") Long userId, @Param("activityType") String activityType);
    
    // Statistics queries
    @Query("SELECT ua.activityType, COUNT(ua) FROM UserActivity ua GROUP BY ua.activityType ORDER BY COUNT(ua) DESC")
    List<Object[]> getActivityTypeStatistics();
    
    @Query("SELECT DATE(ua.createdAt), COUNT(ua) FROM UserActivity ua WHERE ua.createdAt >= :startDate GROUP BY DATE(ua.createdAt) ORDER BY DATE(ua.createdAt)")
    List<Object[]> getDailyActivityCounts(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT HOUR(ua.createdAt), COUNT(ua) FROM UserActivity ua WHERE ua.createdAt >= :startDate GROUP BY HOUR(ua.createdAt) ORDER BY HOUR(ua.createdAt)")
    List<Object[]> getHourlyActivityCounts(@Param("startDate") LocalDateTime startDate);
    
    // User engagement queries
    @Query("SELECT ua.user.id, COUNT(ua) as activityCount FROM UserActivity ua WHERE ua.createdAt >= :startDate GROUP BY ua.user.id ORDER BY activityCount DESC")
    List<Object[]> getMostActiveUsers(@Param("startDate") LocalDateTime startDate, Pageable pageable);
    
    @Query("SELECT COUNT(DISTINCT ua.user.id) FROM UserActivity ua WHERE ua.createdAt >= :startDate")
    Long countActiveUsers(@Param("startDate") LocalDateTime startDate);
    
    // Session-based queries
    List<UserActivity> findBySessionIdOrderByCreatedAtDesc(String sessionId);
    
    @Query("SELECT COUNT(DISTINCT ua.sessionId) FROM UserActivity ua WHERE ua.createdAt >= :startDate")
    Long countUniqueSessions(@Param("startDate") LocalDateTime startDate);
    
    // IP-based queries for security
    List<UserActivity> findByIpAddressOrderByCreatedAtDesc(String ipAddress);
    
    @Query("SELECT ua.ipAddress, COUNT(ua) FROM UserActivity ua WHERE ua.createdAt >= :startDate GROUP BY ua.ipAddress ORDER BY COUNT(ua) DESC")
    List<Object[]> getTopIpAddresses(@Param("startDate") LocalDateTime startDate, Pageable pageable);
    
    // Page view analysis
    @Query("SELECT ua.pageUrl, COUNT(ua) FROM UserActivity ua WHERE ua.activityType = 'PAGE_VIEW' AND ua.createdAt >= :startDate GROUP BY ua.pageUrl ORDER BY COUNT(ua) DESC")
    List<Object[]> getTopPages(@Param("startDate") LocalDateTime startDate, Pageable pageable);
    
    // Delete old activities (for data retention)
    @Query("DELETE FROM UserActivity ua WHERE ua.createdAt < :cutoffDate")
    void deleteActivitiesOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Additional methods needed by UserActivityServiceImpl
    List<UserActivity> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    List<UserActivity> findByUser_IdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    Long countByUser_Id(Long userId);
    
    Long countByUser_IdAndActivityType(Long userId, String activityType);
    
    Long countByActivityTypeAndCreatedAtBetween(String activityType, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT ua.user.id, ua.user.name, COUNT(ua) as activityCount FROM UserActivity ua GROUP BY ua.user.id, ua.user.name ORDER BY activityCount DESC")
    List<Object[]> findMostActiveUsers(int limit);
    
    Long countByCreatedAtGreaterThanEqual(LocalDateTime date);
    
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.activityType LIKE :prefix%")
    Long countByActivityTypeStartingWith(@Param("prefix") String prefix);
    
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType LIKE :prefix%")
    Long countByUser_IdAndActivityTypeStartingWith(@Param("userId") Long userId, @Param("prefix") String prefix);
    
    @Query("SELECT MIN(ua.createdAt) FROM UserActivity ua WHERE ua.user.id = :userId")
    LocalDateTime findFirstActivityDateByUserId(@Param("userId") Long userId);
    
    @Query("SELECT MAX(ua.createdAt) FROM UserActivity ua WHERE ua.user.id = :userId")
    LocalDateTime findLastActivityDateByUserId(@Param("userId") Long userId);
    
    @Query("SELECT ua.activityType FROM UserActivity ua WHERE ua.user.id = :userId GROUP BY ua.activityType ORDER BY COUNT(ua) DESC LIMIT 1")
    String findMostCommonActivityTypeByUserId(@Param("userId") Long userId);
    
    int deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
