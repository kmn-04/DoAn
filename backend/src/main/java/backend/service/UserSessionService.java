package backend.service;

import backend.entity.UserSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSessionService {
    
    /**
     * Create new user session
     */
    UserSession createSession(Long userId, String sessionId, String ipAddress, String userAgent,
                            String deviceType, String browser, String os, String country, String city);
    
    /**
     * Update session activity
     */
    UserSession updateSessionActivity(String sessionId);
    
    /**
     * End session (logout)
     */
    UserSession endSession(String sessionId, String logoutReason);
    
    /**
     * Force logout user (end all sessions)
     */
    int forceLogoutUser(Long userId, String reason);
    
    /**
     * Get session by ID
     */
    Optional<UserSession> getSessionById(Long id);
    
    /**
     * Get session by session ID
     */
    Optional<UserSession> getSessionBySessionId(String sessionId);
    
    /**
     * Get sessions by user ID
     */
    List<UserSession> getSessionsByUserId(Long userId);
    
    /**
     * Get sessions by user ID with pagination
     */
    Page<UserSession> getSessionsByUserId(Long userId, Pageable pageable);
    
    /**
     * Get active sessions by user ID
     */
    List<UserSession> getActiveSessionsByUserId(Long userId);
    
    /**
     * Get active sessions
     */
    List<UserSession> getActiveSessions();
    
    /**
     * Get active sessions with pagination
     */
    Page<UserSession> getActiveSessions(Pageable pageable);
    
    /**
     * Get sessions in date range
     */
    List<UserSession> getSessionsInDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get sessions with specification (for complex queries)
     */
    Page<UserSession> getSessionsWithSpec(Specification<UserSession> spec, Pageable pageable);
    
    /**
     * Count active sessions
     */
    Long countActiveSessions();
    
    /**
     * Count sessions by user
     */
    Long countSessionsByUser(Long userId);
    
    /**
     * Count active sessions by user
     */
    Long countActiveSessionsByUser(Long userId);
    
    /**
     * Get session statistics for dashboard
     */
    SessionStatistics getSessionStatistics();
    
    /**
     * Get user session statistics
     */
    UserSessionStatistics getUserSessionStatistics(Long userId);
    
    /**
     * Cleanup expired sessions
     */
    int cleanupExpiredSessions(LocalDateTime cutoffDate);
    
    /**
     * Get sessions by IP address
     */
    List<UserSession> getSessionsByIpAddress(String ipAddress);
    
    /**
     * Get sessions by device type
     */
    List<UserSession> getSessionsByDeviceType(String deviceType);
    
    /**
     * Get sessions by country
     */
    List<UserSession> getSessionsByCountry(String country);
    
    /**
     * Session Statistics DTO
     */
    class SessionStatistics {
        private Long totalSessions;
        private Long activeSessions;
        private Long todaySessions;
        private Long weekSessions;
        private Long monthSessions;
        private Long uniqueUsers;
        private Long desktopSessions;
        private Long mobileSessions;
        private Long tabletSessions;
        private Double averageSessionDuration;
        
        // Constructors, getters, setters
        public SessionStatistics() {}
        
        public SessionStatistics(Long totalSessions, Long activeSessions, Long todaySessions,
                               Long weekSessions, Long monthSessions, Long uniqueUsers,
                               Long desktopSessions, Long mobileSessions, Long tabletSessions,
                               Double averageSessionDuration) {
            this.totalSessions = totalSessions;
            this.activeSessions = activeSessions;
            this.todaySessions = todaySessions;
            this.weekSessions = weekSessions;
            this.monthSessions = monthSessions;
            this.uniqueUsers = uniqueUsers;
            this.desktopSessions = desktopSessions;
            this.mobileSessions = mobileSessions;
            this.tabletSessions = tabletSessions;
            this.averageSessionDuration = averageSessionDuration;
        }
        
        // Getters and setters
        public Long getTotalSessions() { return totalSessions; }
        public void setTotalSessions(Long totalSessions) { this.totalSessions = totalSessions; }
        
        public Long getActiveSessions() { return activeSessions; }
        public void setActiveSessions(Long activeSessions) { this.activeSessions = activeSessions; }
        
        public Long getTodaySessions() { return todaySessions; }
        public void setTodaySessions(Long todaySessions) { this.todaySessions = todaySessions; }
        
        public Long getWeekSessions() { return weekSessions; }
        public void setWeekSessions(Long weekSessions) { this.weekSessions = weekSessions; }
        
        public Long getMonthSessions() { return monthSessions; }
        public void setMonthSessions(Long monthSessions) { this.monthSessions = monthSessions; }
        
        public Long getUniqueUsers() { return uniqueUsers; }
        public void setUniqueUsers(Long uniqueUsers) { this.uniqueUsers = uniqueUsers; }
        
        public Long getDesktopSessions() { return desktopSessions; }
        public void setDesktopSessions(Long desktopSessions) { this.desktopSessions = desktopSessions; }
        
        public Long getMobileSessions() { return mobileSessions; }
        public void setMobileSessions(Long mobileSessions) { this.mobileSessions = mobileSessions; }
        
        public Long getTabletSessions() { return tabletSessions; }
        public void setTabletSessions(Long tabletSessions) { this.tabletSessions = tabletSessions; }
        
        public Double getAverageSessionDuration() { return averageSessionDuration; }
        public void setAverageSessionDuration(Double averageSessionDuration) { this.averageSessionDuration = averageSessionDuration; }
    }
    
    /**
     * User Session Statistics DTO
     */
    class UserSessionStatistics {
        private Long totalSessions;
        private Long activeSessions;
        private LocalDateTime firstSession;
        private LocalDateTime lastSession;
        private Double averageSessionDuration;
        private String mostUsedDevice;
        private String mostUsedBrowser;
        private List<String> loginLocations;
        
        // Constructors, getters, setters
        public UserSessionStatistics() {}
        
        public UserSessionStatistics(Long totalSessions, Long activeSessions, LocalDateTime firstSession,
                                   LocalDateTime lastSession, Double averageSessionDuration,
                                   String mostUsedDevice, String mostUsedBrowser, List<String> loginLocations) {
            this.totalSessions = totalSessions;
            this.activeSessions = activeSessions;
            this.firstSession = firstSession;
            this.lastSession = lastSession;
            this.averageSessionDuration = averageSessionDuration;
            this.mostUsedDevice = mostUsedDevice;
            this.mostUsedBrowser = mostUsedBrowser;
            this.loginLocations = loginLocations;
        }
        
        // Getters and setters
        public Long getTotalSessions() { return totalSessions; }
        public void setTotalSessions(Long totalSessions) { this.totalSessions = totalSessions; }
        
        public Long getActiveSessions() { return activeSessions; }
        public void setActiveSessions(Long activeSessions) { this.activeSessions = activeSessions; }
        
        public LocalDateTime getFirstSession() { return firstSession; }
        public void setFirstSession(LocalDateTime firstSession) { this.firstSession = firstSession; }
        
        public LocalDateTime getLastSession() { return lastSession; }
        public void setLastSession(LocalDateTime lastSession) { this.lastSession = lastSession; }
        
        public Double getAverageSessionDuration() { return averageSessionDuration; }
        public void setAverageSessionDuration(Double averageSessionDuration) { this.averageSessionDuration = averageSessionDuration; }
        
        public String getMostUsedDevice() { return mostUsedDevice; }
        public void setMostUsedDevice(String mostUsedDevice) { this.mostUsedDevice = mostUsedDevice; }
        
        public String getMostUsedBrowser() { return mostUsedBrowser; }
        public void setMostUsedBrowser(String mostUsedBrowser) { this.mostUsedBrowser = mostUsedBrowser; }
        
        public List<String> getLoginLocations() { return loginLocations; }
        public void setLoginLocations(List<String> loginLocations) { this.loginLocations = loginLocations; }
    }
}
