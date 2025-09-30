package backend.repository;

import backend.entity.UserSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long>, JpaSpecificationExecutor<UserSession> {
    
    // Find session by session ID
    Optional<UserSession> findBySessionId(String sessionId);
    
    // Find active session by session ID
    Optional<UserSession> findBySessionIdAndIsActiveTrue(String sessionId);
    
    // Find sessions by user
    List<UserSession> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    Page<UserSession> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find active sessions by user
    List<UserSession> findByUser_IdAndIsActiveTrueOrderByLastActivityDesc(Long userId);
    
    // Find all active sessions
    List<UserSession> findByIsActiveTrueOrderByLastActivityDesc();
    
    Page<UserSession> findByIsActiveTrueOrderByLastActivityDesc(Pageable pageable);
    
    // Find sessions by IP address
    List<UserSession> findByIpAddressOrderByCreatedAtDesc(String ipAddress);
    
    // Find expired sessions
    @Query("SELECT us FROM UserSession us WHERE us.expiresAt < :currentTime AND us.isActive = true")
    List<UserSession> findExpiredActiveSessions(@Param("currentTime") LocalDateTime currentTime);
    
    // Find inactive sessions older than specified time
    @Query("SELECT us FROM UserSession us WHERE us.lastActivity < :cutoffTime AND us.isActive = true")
    List<UserSession> findInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Count active sessions
    Long countByIsActiveTrue();
    
    // Count sessions by user
    Long countByUser_Id(Long userId);
    
    // Count active sessions by user
    Long countByUser_IdAndIsActiveTrue(Long userId);
    
    // Statistics queries
    @Query("SELECT COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate")
    Long countSessionsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(DISTINCT us.user.id) FROM UserSession us WHERE us.createdAt >= :startDate")
    Long countUniqueUsersSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DATE(us.createdAt), COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY DATE(us.createdAt) ORDER BY DATE(us.createdAt)")
    List<Object[]> getDailySessionCounts(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT HOUR(us.createdAt), COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY HOUR(us.createdAt) ORDER BY HOUR(us.createdAt)")
    List<Object[]> getHourlySessionCounts(@Param("startDate") LocalDateTime startDate);
    
    // Device and browser statistics
    @Query("SELECT us.deviceType, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY us.deviceType ORDER BY COUNT(us) DESC")
    List<Object[]> getDeviceTypeStatistics(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT us.browserName, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY us.browserName ORDER BY COUNT(us) DESC")
    List<Object[]> getBrowserStatistics(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT us.osName, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY us.osName ORDER BY COUNT(us) DESC")
    List<Object[]> getOperatingSystemStatistics(@Param("startDate") LocalDateTime startDate);
    
    // Geographic statistics
    @Query("SELECT us.countryCode, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate AND us.countryCode IS NOT NULL GROUP BY us.countryCode ORDER BY COUNT(us) DESC")
    List<Object[]> getCountryStatistics(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT us.city, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate AND us.city IS NOT NULL GROUP BY us.city ORDER BY COUNT(us) DESC")
    List<Object[]> getCityStatistics(@Param("startDate") LocalDateTime startDate, Pageable pageable);
    
    // Security-related queries
    @Query("SELECT us.ipAddress, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY us.ipAddress ORDER BY COUNT(us) DESC")
    List<Object[]> getTopIpAddresses(@Param("startDate") LocalDateTime startDate, Pageable pageable);
    
    @Query("SELECT us FROM UserSession us WHERE us.user.id = :userId AND us.ipAddress = :ipAddress AND us.createdAt >= :startDate ORDER BY us.createdAt DESC")
    List<UserSession> findSuspiciousUserSessions(@Param("userId") Long userId, 
                                                  @Param("ipAddress") String ipAddress, 
                                                  @Param("startDate") LocalDateTime startDate);
    
    // Session duration analysis
    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, us.createdAt, COALESCE(us.loggedOutAt, us.lastActivity))) FROM UserSession us WHERE us.createdAt >= :startDate")
    Double getAverageSessionDurationMinutes(@Param("startDate") LocalDateTime startDate);
    
    // Login method statistics
    @Query("SELECT us.loginMethod, COUNT(us) FROM UserSession us WHERE us.createdAt >= :startDate GROUP BY us.loginMethod ORDER BY COUNT(us) DESC")
    List<Object[]> getLoginMethodStatistics(@Param("startDate") LocalDateTime startDate);
    
    // Batch operations
    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false, us.logoutReason = :reason, us.loggedOutAt = :loggedOutAt WHERE us.id IN :sessionIds")
    void deactivateSessions(@Param("sessionIds") List<Long> sessionIds, 
                           @Param("reason") String reason, 
                           @Param("loggedOutAt") LocalDateTime loggedOutAt);
    
    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false, us.logoutReason = 'SESSION_EXPIRED', us.loggedOutAt = :loggedOutAt WHERE us.expiresAt < :currentTime AND us.isActive = true")
    int deactivateExpiredSessions(@Param("currentTime") LocalDateTime currentTime, 
                                  @Param("loggedOutAt") LocalDateTime loggedOutAt);
    
    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false, us.logoutReason = 'TIMEOUT', us.loggedOutAt = :loggedOutAt WHERE us.lastActivity < :cutoffTime AND us.isActive = true")
    int deactivateInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime, 
                                   @Param("loggedOutAt") LocalDateTime loggedOutAt);
    
    // Force logout all user sessions
    @Modifying
    @Query("UPDATE UserSession us SET us.isActive = false, us.logoutReason = :reason, us.loggedOutAt = :loggedOutAt WHERE us.user.id = :userId AND us.isActive = true")
    int forceLogoutUserSessions(@Param("userId") Long userId, 
                               @Param("reason") String reason, 
                               @Param("loggedOutAt") LocalDateTime loggedOutAt);
    
    // Cleanup old sessions
    @Modifying
    @Query("DELETE FROM UserSession us WHERE us.createdAt < :cutoffDate")
    void deleteSessionsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Additional methods needed by UserSessionServiceImpl
    List<UserSession> findByUser_IdAndIsActiveOrderByLastActivityDesc(Long userId, boolean isActive);
    
    List<UserSession> findByIsActiveOrderByLastActivityDesc(boolean isActive);
    
    Page<UserSession> findByIsActiveOrderByLastActivityDesc(boolean isActive, Pageable pageable);
    
    List<UserSession> findByLoginAtBetweenOrderByLoginAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    Long countByIsActive(boolean isActive);
    
    Long countByUser_IdAndIsActive(Long userId, boolean isActive);
    
    Long countByLoginAtGreaterThanEqual(LocalDateTime date);
    
    @Query("SELECT COUNT(DISTINCT us.user.id) FROM UserSession us WHERE us.loginAt >= :date")
    Long countDistinctUsersByLoginAtGreaterThanEqual(@Param("date") LocalDateTime date);
    
    Long countByDeviceType(String deviceType);
    
    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, us.loginAt, COALESCE(us.loggedOutAt, us.lastActivity))) FROM UserSession us")
    Double calculateAverageSessionDuration();
    
    @Query("SELECT MIN(us.loginAt) FROM UserSession us WHERE us.user.id = :userId")
    LocalDateTime findFirstSessionDateByUserId(@Param("userId") Long userId);
    
    @Query("SELECT MAX(us.loginAt) FROM UserSession us WHERE us.user.id = :userId")
    LocalDateTime findLastSessionDateByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, us.loginAt, COALESCE(us.loggedOutAt, us.lastActivity))) FROM UserSession us WHERE us.user.id = :userId")
    Double calculateAverageSessionDurationByUserId(@Param("userId") Long userId);
    
    @Query("SELECT us.deviceType FROM UserSession us WHERE us.user.id = :userId GROUP BY us.deviceType ORDER BY COUNT(us) DESC LIMIT 1")
    String findMostUsedDeviceByUserId(@Param("userId") Long userId);
    
    @Query("SELECT us.browser FROM UserSession us WHERE us.user.id = :userId GROUP BY us.browser ORDER BY COUNT(us) DESC LIMIT 1")
    String findMostUsedBrowserByUserId(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT CONCAT(us.city, ', ', us.country) FROM UserSession us WHERE us.user.id = :userId AND us.city IS NOT NULL AND us.country IS NOT NULL")
    List<String> findLoginLocationsByUserId(@Param("userId") Long userId);
    
    int deleteByLastActivityBeforeAndIsActive(LocalDateTime cutoffDate, boolean isActive);
    
    List<UserSession> findByIpAddressOrderByLoginAtDesc(String ipAddress);
    
    List<UserSession> findByDeviceTypeOrderByLoginAtDesc(String deviceType);
    
    List<UserSession> findByCountryOrderByLoginAtDesc(String country);
}
