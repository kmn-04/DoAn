package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "referrals", indexes = {
    @Index(name = "idx_referral_referrer", columnList = "referrer_id"),
    @Index(name = "idx_referral_referee", columnList = "referee_id"),
    @Index(name = "idx_referral_code", columnList = "referral_code"),
    @Index(name = "idx_referral_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Referral {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false)
    private User referrer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", nullable = false)
    private User referee;
    
    @Column(name = "referral_code", nullable = false, length = 50)
    private String referralCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReferralStatus status = ReferralStatus.PENDING;
    
    @Column(name = "points_earned")
    private Integer pointsEarned = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_booking_id")
    private Booking firstBooking;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum ReferralStatus {
        PENDING,    // Chưa hoàn thành
        COMPLETED,  // Đã hoàn thành
        CANCELLED   // Đã hủy
    }
}

