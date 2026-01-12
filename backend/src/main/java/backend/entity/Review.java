package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(nullable = false)
    private Integer rating; // 1-5 stars
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(columnDefinition = "JSON")
    private String images; // Array of image URLs (JSON)
    
    @Column(name = "helpful_count")
    private Integer helpfulCount = 0; // Số lượt "hữu ích"
    
    @Column(columnDefinition = "TEXT")
    private String helpfulUserIds; // Comma-separated list of user IDs who voted (e.g., "1,5,12")
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status = ReviewStatus.PENDING;
    
    @Column(name = "admin_reply", columnDefinition = "TEXT")
    private String adminReply; // Phản hồi từ admin
    
    @Column(name = "replied_at")
    private LocalDateTime repliedAt; // Thời điểm phản hồi
    
    @Column(name = "replied_by")
    private Long repliedBy; // Admin ID who replied
    
    @Column(name = "is_suspicious")
    private Boolean isSuspicious = false; // Tag as suspicious (AI detected or admin flagged)
    
    @Column(name = "is_spam")
    private Boolean isSpam = false; // Tag as spam
    
    @Column(name = "ai_analysis", columnDefinition = "TEXT")
    private String aiAnalysis; // AI analysis result (negative keywords, sentiment, etc.)
    
    @Column(name = "tags", columnDefinition = "VARCHAR(500)")
    private String tags; // Comma-separated tags for additional categorization
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship with User (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Relationship with Tour (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;
    
    // Relationship with Booking (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @PrePersist
    protected void onCreate() {
        validateRating();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        validateRating();
        updatedAt = LocalDateTime.now();
    }
    
    // Validation for rating - helper method (not a callback)
    private void validateRating() {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
    
    public enum ReviewStatus {
        PENDING, APPROVED, REJECTED
    }
}
