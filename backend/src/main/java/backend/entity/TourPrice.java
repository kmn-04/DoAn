package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tour_prices", indexes = {
    @Index(name = "idx_prices_tour", columnList = "tour_id"),
    @Index(name = "idx_prices_dates", columnList = "valid_from, valid_to")
})
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TourPrice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    @JsonIgnore
    private Tour tour;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "season", nullable = false, length = 20)
    private Season season;
    
    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;
    
    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;
    
    @Column(name = "adult_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal adultPrice;
    
    @Column(name = "child_price", precision = 12, scale = 2)
    private BigDecimal childPrice;
    
    @Column(name = "infant_price", precision = 12, scale = 2)
    private BigDecimal infantPrice;
    
    @Column(name = "single_supplement", precision = 12, scale = 2)
    private BigDecimal singleSupplement; // Phụ thu phòng đơn
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    
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
    
    // Helper method to check if price is valid for a date
    public boolean isValidForDate(LocalDate date) {
        return !date.isBefore(validFrom) && !date.isAfter(validTo);
    }
    
    public enum Season {
        LOW_SEASON("Thấp điểm"),
        NORMAL_SEASON("Bình thường"),
        HIGH_SEASON("Cao điểm"),
        PEAK_SEASON("Cực cao điểm");
        
        private final String displayName;
        
        Season(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
