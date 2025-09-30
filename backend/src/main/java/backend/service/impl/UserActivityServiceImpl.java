package backend.service.impl;

import backend.entity.User;
import backend.entity.UserActivity;
import backend.repository.UserActivityRepository;
import backend.repository.UserRepository;
import backend.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserActivityServiceImpl implements UserActivityService {
    
    private final UserActivityRepository userActivityRepository;
    private final UserRepository userRepository;
    
    @Override
    public UserActivity logActivity(Long userId, String activityType, String activityData) {
        return logActivity(userId, activityType, activityData, null, null, null, null, null, 0);
    }
    
    @Override
    public UserActivity logActivity(Long userId, String activityType, String activityData,
                                  String ipAddress, String userAgent, String sessionId,
                                  String pageUrl, String refererUrl, Integer durationSeconds) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                log.warn("User not found with ID: {}", userId);
                return null;
            }
            
            User user = userOpt.get();
            
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setActivityType(activityType);
            activity.setActivityData(activityData);
            activity.setIpAddress(ipAddress);
            activity.setUserAgent(userAgent);
            activity.setSessionId(sessionId);
            activity.setPageUrl(pageUrl);
            activity.setRefererUrl(refererUrl);
            activity.setDurationSeconds(durationSeconds != null ? durationSeconds : 0);
            activity.setCreatedAt(LocalDateTime.now());
            
            UserActivity saved = userActivityRepository.save(activity);
            
            // Update user's last activity
            user.updateLastActivity();
            userRepository.save(user);
            
            log.debug("Logged activity: {} for user: {}", activityType, userId);
            return saved;
            
        } catch (Exception e) {
            log.error("Error logging activity for user {}: {}", userId, e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserActivity> getActivityById(Long id) {
        return userActivityRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserActivity> getActivitiesByUserId(Long userId) {
        return userActivityRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserActivity> getActivitiesByUserId(Long userId, Pageable pageable) {
        return userActivityRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserActivity> getActivitiesByType(String activityType) {
        return userActivityRepository.findByActivityTypeOrderByCreatedAtDesc(activityType);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserActivity> getActivitiesByType(String activityType, Pageable pageable) {
        return userActivityRepository.findByActivityTypeOrderByCreatedAtDesc(activityType, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserActivity> getActivitiesByUserIdAndType(Long userId, String activityType) {
        return userActivityRepository.findByUser_IdAndActivityTypeOrderByCreatedAtDesc(userId, activityType);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserActivity> getActivitiesInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return userActivityRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserActivity> getActivitiesByUserInDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return userActivityRepository.findByUser_IdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startDate, endDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserActivity> getActivitiesWithSpec(Specification<UserActivity> spec, Pageable pageable) {
        return userActivityRepository.findAll(spec, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countActivitiesByUserAndType(Long userId, String activityType) {
        return userActivityRepository.countByUser_IdAndActivityType(userId, activityType);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countActivitiesByTypeInDateRange(String activityType, LocalDateTime startDate, LocalDateTime endDate) {
        return userActivityRepository.countByActivityTypeAndCreatedAtBetween(activityType, startDate, endDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getMostActiveUsers(int limit) {
        return userActivityRepository.findMostActiveUsers(limit);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ActivityStatistics getActivityStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);
        
        Long totalActivities = userActivityRepository.count();
        Long todayActivities = userActivityRepository.countByCreatedAtGreaterThanEqual(startOfDay);
        Long weekActivities = userActivityRepository.countByCreatedAtGreaterThanEqual(startOfWeek);
        Long monthActivities = userActivityRepository.countByCreatedAtGreaterThanEqual(startOfMonth);
        
        Long loginCount = userActivityRepository.countByActivityType(UserActivity.ActivityType.LOGIN);
        Long pageViewCount = userActivityRepository.countByActivityType(UserActivity.ActivityType.PAGE_VIEW);
        Long bookingCount = userActivityRepository.countByActivityTypeStartingWith("BOOKING_");
        Long searchCount = userActivityRepository.countByActivityType(UserActivity.ActivityType.SEARCH);
        
        return new ActivityStatistics(totalActivities, todayActivities, weekActivities, monthActivities,
                                    loginCount, pageViewCount, bookingCount, searchCount);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserActivityStatistics getUserActivityStatistics(Long userId) {
        Long totalActivities = userActivityRepository.countByUser_Id(userId);
        Long loginCount = userActivityRepository.countByUser_IdAndActivityType(userId, UserActivity.ActivityType.LOGIN);
        Long pageViews = userActivityRepository.countByUser_IdAndActivityType(userId, UserActivity.ActivityType.PAGE_VIEW);
        Long bookingCount = userActivityRepository.countByUser_IdAndActivityTypeStartingWith(userId, "BOOKING_");
        Long searchCount = userActivityRepository.countByUser_IdAndActivityType(userId, UserActivity.ActivityType.SEARCH);
        
        LocalDateTime firstActivity = userActivityRepository.findFirstActivityDateByUserId(userId);
        LocalDateTime lastActivity = userActivityRepository.findLastActivityDateByUserId(userId);
        String mostCommonActivity = userActivityRepository.findMostCommonActivityTypeByUserId(userId);
        
        return new UserActivityStatistics(totalActivities, loginCount, pageViews, bookingCount, searchCount,
                                        firstActivity, lastActivity, mostCommonActivity);
    }
    
    @Override
    public int deleteOldActivities(LocalDateTime cutoffDate) {
        log.info("Deleting activities older than: {}", cutoffDate);
        int deletedCount = userActivityRepository.deleteByCreatedAtBefore(cutoffDate);
        log.info("Deleted {} old activities", deletedCount);
        return deletedCount;
    }
}