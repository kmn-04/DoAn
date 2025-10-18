package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_points", indexes = {
    @Index(name = "idx_loyalty_level", columnList = "level"),
    @Index(name = "idx_loyalty_points_balance", columnList = "points_balance")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LoyaltyPoints {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;
    
    @Column(name = "points_balance", nullable = false)
    private Integer pointsBalance = 0;
    
    @Column(name = "total_earned", nullable = false)
    private Integer totalEarned = 0;
    
    @Column(name = "total_redeemed", nullable = false)
    private Integer totalRedeemed = 0;
    
    @Column(name = "total_expired", nullable = false)
    private Integer totalExpired = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoyaltyLevel level = LoyaltyLevel.BRONZE;
    
    @Column(name = "level_updated_at")
    private LocalDateTime levelUpdatedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum LoyaltyLevel {
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND
    }
}

