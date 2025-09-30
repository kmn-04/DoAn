package backend.service;

import backend.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserActivityService {
    
    /**
     * Log user activity
     */
    UserActivity logActivity(Long userId, String activityType, String activityData);
    
    /**
     * Log user activity with additional details
     */
    UserActivity logActivity(Long userId, String activityType, String activityData, 
                           String ipAddress, String userAgent, String sessionId, 
                           String pageUrl, String refererUrl, Integer durationSeconds);
    
    /**
     * Get activity by ID
     */
    Optional<UserActivity> getActivityById(Long id);
    
    /**
     * Get activities by user ID
     */
    List<UserActivity> getActivitiesByUserId(Long userId);
    
    /**
     * Get activities by user ID with pagination
     */
    Page<UserActivity> getActivitiesByUserId(Long userId, Pageable pageable);
    
    /**
     * Get activities by type
     */
    List<UserActivity> getActivitiesByType(String activityType);
    
    /**
     * Get activities by type with pagination
     */
    Page<UserActivity> getActivitiesByType(String activityType, Pageable pageable);
    
    /**
     * Get activities by user and type
     */
    List<UserActivity> getActivitiesByUserIdAndType(Long userId, String activityType);
    
    /**
     * Get activities in date range
     */
    List<UserActivity> getActivitiesInDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get activities by user in date range
     */
    List<UserActivity> getActivitiesByUserInDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get activities with specification (for complex queries)
     */
    Page<UserActivity> getActivitiesWithSpec(Specification<UserActivity> spec, Pageable pageable);
    
    /**
     * Count activities by user and type
     */
    Long countActivitiesByUserAndType(Long userId, String activityType);
    
    /**
     * Count activities by type in date range
     */
    Long countActivitiesByTypeInDateRange(String activityType, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get most active users
     */
    List<Object[]> getMostActiveUsers(int limit);
    
    /**
     * Get activity statistics for dashboard
     */
    ActivityStatistics getActivityStatistics();
    
    /**
     * Get activity statistics for user
     */
    UserActivityStatistics getUserActivityStatistics(Long userId);
    
    /**
     * Delete old activities (cleanup)
     */
    int deleteOldActivities(LocalDateTime cutoffDate);
    
    /**
     * Activity Statistics DTO
     */
    class ActivityStatistics {
        private Long totalActivities;
        private Long todayActivities;
        private Long weekActivities;
        private Long monthActivities;
        private Long loginCount;
        private Long pageViewCount;
        private Long bookingCount;
        private Long searchCount;
        
        // Constructors, getters, setters
        public ActivityStatistics() {}
        
        public ActivityStatistics(Long totalActivities, Long todayActivities, Long weekActivities, 
                                Long monthActivities, Long loginCount, Long pageViewCount, 
                                Long bookingCount, Long searchCount) {
            this.totalActivities = totalActivities;
            this.todayActivities = todayActivities;
            this.weekActivities = weekActivities;
            this.monthActivities = monthActivities;
            this.loginCount = loginCount;
            this.pageViewCount = pageViewCount;
            this.bookingCount = bookingCount;
            this.searchCount = searchCount;
        }
        
        // Getters and setters
        public Long getTotalActivities() { return totalActivities; }
        public void setTotalActivities(Long totalActivities) { this.totalActivities = totalActivities; }
        
        public Long getTodayActivities() { return todayActivities; }
        public void setTodayActivities(Long todayActivities) { this.todayActivities = todayActivities; }
        
        public Long getWeekActivities() { return weekActivities; }
        public void setWeekActivities(Long weekActivities) { this.weekActivities = weekActivities; }
        
        public Long getMonthActivities() { return monthActivities; }
        public void setMonthActivities(Long monthActivities) { this.monthActivities = monthActivities; }
        
        public Long getLoginCount() { return loginCount; }
        public void setLoginCount(Long loginCount) { this.loginCount = loginCount; }
        
        public Long getPageViewCount() { return pageViewCount; }
        public void setPageViewCount(Long pageViewCount) { this.pageViewCount = pageViewCount; }
        
        public Long getBookingCount() { return bookingCount; }
        public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }
        
        public Long getSearchCount() { return searchCount; }
        public void setSearchCount(Long searchCount) { this.searchCount = searchCount; }
    }
    
    /**
     * User Activity Statistics DTO
     */
    class UserActivityStatistics {
        private Long totalActivities;
        private Long loginCount;
        private Long pageViews;
        private Long bookingCount;
        private Long searchCount;
        private LocalDateTime firstActivity;
        private LocalDateTime lastActivity;
        private String mostCommonActivity;
        
        // Constructors, getters, setters
        public UserActivityStatistics() {}
        
        public UserActivityStatistics(Long totalActivities, Long loginCount, Long pageViews, 
                                    Long bookingCount, Long searchCount, LocalDateTime firstActivity, 
                                    LocalDateTime lastActivity, String mostCommonActivity) {
            this.totalActivities = totalActivities;
            this.loginCount = loginCount;
            this.pageViews = pageViews;
            this.bookingCount = bookingCount;
            this.searchCount = searchCount;
            this.firstActivity = firstActivity;
            this.lastActivity = lastActivity;
            this.mostCommonActivity = mostCommonActivity;
        }
        
        // Getters and setters
        public Long getTotalActivities() { return totalActivities; }
        public void setTotalActivities(Long totalActivities) { this.totalActivities = totalActivities; }
        
        public Long getLoginCount() { return loginCount; }
        public void setLoginCount(Long loginCount) { this.loginCount = loginCount; }
        
        public Long getPageViews() { return pageViews; }
        public void setPageViews(Long pageViews) { this.pageViews = pageViews; }
        
        public Long getBookingCount() { return bookingCount; }
        public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }
        
        public Long getSearchCount() { return searchCount; }
        public void setSearchCount(Long searchCount) { this.searchCount = searchCount; }
        
        public LocalDateTime getFirstActivity() { return firstActivity; }
        public void setFirstActivity(LocalDateTime firstActivity) { this.firstActivity = firstActivity; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        
        public String getMostCommonActivity() { return mostCommonActivity; }
        public void setMostCommonActivity(String mostCommonActivity) { this.mostCommonActivity = mostCommonActivity; }
    }
}
