package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_activities", indexes = {
    @Index(name = "idx_user_activities_user_id", columnList = "user_id"),
    @Index(name = "idx_user_activities_type", columnList = "activity_type"),
    @Index(name = "idx_user_activities_created_at", columnList = "created_at"),
    @Index(name = "idx_user_activities_session", columnList = "session_id")
})
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType;
    
    @Column(name = "activity_data", columnDefinition = "JSON")
    private String activityData; // Store as JSON string
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "session_id", length = 255)
    private String sessionId;
    
    @Column(name = "page_url", length = 500)
    private String pageUrl;
    
    @Column(name = "referer_url", length = 500)
    private String refererUrl;
    
    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Activity types constants
    public static class ActivityType {
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String VIEW_TOUR = "VIEW_TOUR";
        public static final String VIEW_TOUR_LIST = "VIEW_TOUR_LIST";
        public static final String SEARCH = "SEARCH";
        public static final String BOOKING_CREATE = "BOOKING_CREATE";
        public static final String BOOKING_VIEW = "BOOKING_VIEW";
        public static final String BOOKING_MODIFY = "BOOKING_MODIFY";
        public static final String BOOKING_CANCEL = "BOOKING_CANCEL";
        public static final String BOOKING_STATUS_UPDATED = "BOOKING_STATUS_UPDATED";
        public static final String BOOKING_CONFIRMED = "BOOKING_CONFIRMED";
        public static final String BOOKING_CANCELLED = "BOOKING_CANCELLED";
        public static final String BOOKING_COMPLETED = "BOOKING_COMPLETED";
        public static final String BOOKING_UPDATED = "BOOKING_UPDATED";
        public static final String BOOKING_DELETED = "BOOKING_DELETED";
        public static final String REVIEW_CREATE = "REVIEW_CREATE";
        public static final String WISHLIST_ADD = "WISHLIST_ADD";
        public static final String WISHLIST_REMOVE = "WISHLIST_REMOVE";
        public static final String PROFILE_UPDATE = "PROFILE_UPDATE";
        public static final String PAGE_VIEW = "PAGE_VIEW";
        public static final String PAYMENT_PROCESS = "PAYMENT_PROCESS";
        public static final String NOTIFICATION_READ = "NOTIFICATION_READ";
        public static final String PARTNER_VIEW = "PARTNER_VIEW";
        public static final String CATEGORY_VIEW = "CATEGORY_VIEW";
        public static final String ADMIN_LOGIN = "ADMIN_LOGIN";
        public static final String ADMIN_ACTION = "ADMIN_ACTION";
    }
    
    // Constructors for common use cases
    public UserActivity(User user, String activityType) {
        this.user = user;
        this.activityType = activityType;
    }
    
    public UserActivity(User user, String activityType, String activityData) {
        this.user = user;
        this.activityType = activityType;
        this.activityData = activityData;
    }
    
    public UserActivity(User user, String activityType, String activityData, String ipAddress, String userAgent) {
        this.user = user;
        this.activityType = activityType;
        this.activityData = activityData;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
    
    // Helper methods
    public boolean isLoginActivity() {
        return ActivityType.LOGIN.equals(this.activityType) || ActivityType.ADMIN_LOGIN.equals(this.activityType);
    }
    
    public boolean isBookingActivity() {
        return this.activityType != null && this.activityType.startsWith("BOOKING_");
    }
    
    public boolean isViewActivity() {
        return this.activityType != null && (
            this.activityType.contains("VIEW") || 
            ActivityType.PAGE_VIEW.equals(this.activityType)
        );
    }
    
    public boolean isAdminActivity() {
        return this.activityType != null && this.activityType.startsWith("ADMIN_");
    }
}
