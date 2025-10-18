package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_level_history", indexes = {
    @Index(name = "idx_level_history_user", columnList = "user_id"),
    @Index(name = "idx_level_history_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LoyaltyLevelHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "old_level", length = 20)
    private LoyaltyPoints.LoyaltyLevel oldLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "new_level", nullable = false, length = 20)
    private LoyaltyPoints.LoyaltyLevel newLevel;
    
    @Column(name = "points_at_change", nullable = false)
    private Integer pointsAtChange;
    
    @Column(length = 255)
    private String reason;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

