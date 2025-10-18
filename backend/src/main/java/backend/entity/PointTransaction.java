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

@Entity
@Table(name = "point_transactions", indexes = {
    @Index(name = "idx_point_trans_user", columnList = "user_id"),
    @Index(name = "idx_point_trans_type", columnList = "transaction_type"),
    @Index(name = "idx_point_trans_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PointTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @Column(nullable = false)
    private Integer points;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private SourceType sourceType;
    
    @Column(name = "source_id")
    private Long sourceId;
    
    @Column(nullable = false, length = 500)
    private String description;
    
    @Column(name = "balance_before", nullable = false)
    private Integer balanceBefore;
    
    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;
    
    @Column(name = "expires_at")
    private LocalDate expiresAt;
    
    @Column(name = "is_expired", nullable = false)
    private Boolean isExpired = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum TransactionType {
        EARNED,     // Tích điểm
        REDEEMED,   // Đổi điểm
        EXPIRED,    // Hết hạn
        ADJUSTED,   // Điều chỉnh
        BONUS,      // Thưởng
        PENALTY     // Phạt
    }
    
    public enum SourceType {
        BOOKING,        // Từ đặt tour
        REVIEW,         // Từ đánh giá
        REFERRAL,       // Từ giới thiệu
        BIRTHDAY,       // Quà sinh nhật
        PROMOTION,      // Khuyến mãi
        SOCIAL_SHARE,   // Chia sẻ mạng xã hội
        FIRST_BOOKING,  // Booking đầu tiên
        ADMIN           // Admin thêm
    }
}

