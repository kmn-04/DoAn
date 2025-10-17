package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_role", columnList = "role_id"),
    @Index(name = "idx_users_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Column(unique = true, nullable = false, length = 150)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(length = 20)
    private String phone;
    
    private String address;
    
    @Column(name = "dob")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;
    
    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Statistics fields for admin dashboard
    @Column(name = "login_count", nullable = false)
    private Integer loginCount = 0;
    
    @Column(name = "total_bookings", nullable = false)
    private Integer totalBookings = 0;
    
    @Column(name = "total_tour_views", nullable = false)
    private Integer totalTourViews = 0;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;
    
    // Relationship with Role (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
    
    // Relationship with Booking (One-to-Many)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Booking> bookings;
    
    // Relationship with Review (One-to-Many)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Review> reviews;
    
    // Relationship with Notification (One-to-Many)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Notification> notifications;
    
    // Relationship with Log (One-to-Many)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Log> logs;
    
    // Relationship with UserActivity (One-to-Many)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<UserActivity> activities;
    
    // Relationship with UserSession (One-to-Many)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<UserSession> sessions;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method for soft delete
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.status = UserStatus.INACTIVE;
    }
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
    
    // Statistics helper methods
    public void incrementLoginCount() {
        this.loginCount = (this.loginCount == null ? 0 : this.loginCount) + 1;
        this.lastLoginAt = LocalDateTime.now();
        this.lastActivityAt = LocalDateTime.now();
    }
    
    public void incrementTotalBookings() {
        this.totalBookings = (this.totalBookings == null ? 0 : this.totalBookings) + 1;
        this.lastActivityAt = LocalDateTime.now();
    }
    
    public void incrementTourViews() {
        this.totalTourViews = (this.totalTourViews == null ? 0 : this.totalTourViews) + 1;
        this.lastActivityAt = LocalDateTime.now();
    }
    
    public void updateLastActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }
    
    public boolean isOnline() {
        return lastActivityAt != null && 
               lastActivityAt.isAfter(LocalDateTime.now().minusMinutes(5));
    }
    
    public enum UserStatus {
        PENDING,    // Email not verified yet
        ACTIVE,     // Email verified and account active
        INACTIVE,   // Account temporarily inactive
        BANNED      // Account banned by admin
    }
    
    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
}
