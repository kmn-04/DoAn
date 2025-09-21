package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "tours", indexes = {
    @Index(name = "idx_tours_category", columnList = "category_id"),
    @Index(name = "idx_tours_status", columnList = "status"),
    @Index(name = "idx_tours_featured", columnList = "is_featured"),
    @Index(name = "idx_tours_category_status", columnList = "category_id, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tour {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Column(unique = true, nullable = false, length = 150)
    private String slug;
    
    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    
    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;
    
    @Column(nullable = false)
    private Integer duration; // số ngày
    
    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TourStatus status = TourStatus.Active;
    
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Relationship with Category (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    // Relationship with TourItinerary (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TourItinerary> itineraries;
    
    // Relationship with TourImage (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TourImage> images;
    
    // Relationship with Booking (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings;
    
    // Relationship with Review (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Review> reviews;
    
    // Many-to-Many relationship with TargetAudience
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tour_target_audience",
        joinColumns = @JoinColumn(name = "tour_id"),
        inverseJoinColumns = @JoinColumn(name = "target_audience_id")
    )
    private Set<TargetAudience> targetAudiences;
    
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
        this.status = TourStatus.Inactive;
    }
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
    
    // Helper method to get effective price
    public BigDecimal getEffectivePrice() {
        return salePrice != null ? salePrice : price;
    }
    
    public enum TourStatus {
        Active, Inactive
    }
}
