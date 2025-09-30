package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sessions", indexes = {
    @Index(name = "idx_user_sessions_user_id", columnList = "user_id"),
    @Index(name = "idx_user_sessions_session_id", columnList = "session_id"),
    @Index(name = "idx_user_sessions_active", columnList = "is_active"),
    @Index(name = "idx_user_sessions_last_activity", columnList = "last_activity"),
    @Index(name = "idx_user_sessions_expires_at", columnList = "expires_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "session_id", nullable = false, unique = true, length = 255)
    private String sessionId;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "last_activity")
    private LocalDateTime lastActivity;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Device and location info (optional)
    @Column(name = "device_type", length = 50)
    private String deviceType; // DESKTOP, MOBILE, TABLET
    
    @Column(name = "browser_name", length = 100)
    private String browserName;
    
    @Column(name = "browser_version", length = 50)
    private String browserVersion;
    
    @Column(name = "os_name", length = 100)
    private String osName;
    
    @Column(name = "os_version", length = 50)
    private String osVersion;
    
    @Column(name = "country_code", length = 2)
    private String countryCode;
    
    @Column(name = "city", length = 100)
    private String city;
    
    // Session metadata
    @Column(name = "login_method", length = 50)
    private String loginMethod; // EMAIL, GOOGLE, FACEBOOK, etc.
    
    @Column(name = "remember_me")
    private Boolean rememberMe = false;
    
    @Column(name = "logout_reason", length = 100)
    private String logoutReason; // USER_LOGOUT, TIMEOUT, ADMIN_FORCE, SECURITY
    
    @Column(name = "logged_out_at")
    private LocalDateTime loggedOutAt;
    
    @Column(name = "login_at")
    private LocalDateTime loginAt;
    
    @Column(name = "browser", length = 100)
    private String browser;
    
    @Column(name = "os", length = 100)
    private String os;
    
    @Column(name = "country", length = 100)
    private String country;
    
    // Constructors
    public UserSession(User user, String sessionId, String ipAddress, String userAgent) {
        this.user = user;
        this.sessionId = sessionId;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.lastActivity = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24); // Default 24 hours
    }
    
    public UserSession(User user, String sessionId, String ipAddress, String userAgent, boolean rememberMe) {
        this(user, sessionId, ipAddress, userAgent);
        this.rememberMe = rememberMe;
        if (rememberMe) {
            this.expiresAt = LocalDateTime.now().plusDays(30); // 30 days for remember me
        }
    }
    
    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return isActive && !isExpired();
    }
    
    public void updateLastActivity() {
        this.lastActivity = LocalDateTime.now();
    }
    
    public void logout(String reason) {
        this.isActive = false;
        this.logoutReason = reason;
        this.loggedOutAt = LocalDateTime.now();
    }
    
    public void extendSession(int hours) {
        if (this.expiresAt != null) {
            this.expiresAt = this.expiresAt.plusHours(hours);
        }
    }
    
    public long getSessionDurationMinutes() {
        if (loggedOutAt != null) {
            return java.time.Duration.between(createdAt, loggedOutAt).toMinutes();
        } else if (lastActivity != null) {
            return java.time.Duration.between(createdAt, lastActivity).toMinutes();
        }
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toMinutes();
    }
    
    // Device type constants
    public static class DeviceType {
        public static final String DESKTOP = "DESKTOP";
        public static final String MOBILE = "MOBILE";
        public static final String TABLET = "TABLET";
        public static final String UNKNOWN = "UNKNOWN";
    }
    
    // Login method constants
    public static class LoginMethod {
        public static final String EMAIL = "EMAIL";
        public static final String GOOGLE = "GOOGLE";
        public static final String FACEBOOK = "FACEBOOK";
        public static final String ADMIN = "ADMIN";
    }
    
    // Logout reason constants
    public static class LogoutReason {
        public static final String USER_LOGOUT = "USER_LOGOUT";
        public static final String TIMEOUT = "TIMEOUT";
        public static final String ADMIN_FORCE = "ADMIN_FORCE";
        public static final String SECURITY = "SECURITY";
        public static final String SESSION_EXPIRED = "SESSION_EXPIRED";
    }
}
