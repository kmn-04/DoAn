package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_config", indexes = {
    @Index(name = "idx_config_type", columnList = "config_type"),
    @Index(name = "idx_config_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LoyaltyConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(name = "config_key", unique = true, nullable = false, length = 100)
    private String configKey;
    
    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "config_type", nullable = false, length = 30)
    private ConfigType configType;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
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
    
    public enum ConfigType {
        EARNING_RATE,      // Tỷ lệ tích điểm
        LEVEL_THRESHOLD,   // Ngưỡng level
        REDEMPTION_RATE,   // Tỷ lệ đổi điểm
        BONUS_RULE,        // Quy tắc thưởng
        EXPIRY_RULE,       // Quy tắc hết hạn
        GENERAL            // Cấu hình chung
    }
}

