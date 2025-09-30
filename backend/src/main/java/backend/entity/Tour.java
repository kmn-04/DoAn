package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @Index(name = "idx_tours_category_status", columnList = "category_id, status"),
    @Index(name = "idx_tours_tour_type", columnList = "tour_type"),
    @Index(name = "idx_tours_country_code", columnList = "country_code"),
    @Index(name = "idx_tours_price", columnList = "price")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    
    // Virtual column for sorting: effective price (salePrice if exists, otherwise price)
    @org.hibernate.annotations.Formula("COALESCE(sale_price, price)")
    private BigDecimal effectivePriceForSort;
    
    @Column(name = "child_price", precision = 12, scale = 2)
    private BigDecimal childPrice; // Giá trẻ em (5-11 tuổi)
    
    @Column(name = "infant_price", precision = 12, scale = 2)
    private BigDecimal infantPrice; // Giá trẻ nhỏ (2-4 tuổi)
    
    @Column(nullable = false)
    private Integer duration; // số ngày
    
    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;
    
    @Column(name = "min_people")
    private Integer minPeople; // Số người tối thiểu để khởi hành
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TourStatus status = TourStatus.Active;
    
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;
    
    @Column(name = "main_image", length = 255)
    private String mainImage;
    
    // International Tour Fields
    @Enumerated(EnumType.STRING)
    @Column(name = "tour_type", nullable = false)
    private TourType tourType = TourType.DOMESTIC;
    
    // Location and destination fields
    @Column(name = "departure_location", length = 100)
    private String departureLocation; // Nơi khởi hành (Hà Nội, TP.HCM...)
    
    @Column(name = "destination", length = 100)
    private String destination; // Điểm đến chính (Phú Quốc, Tokyo...)
    
    @Column(name = "destinations", columnDefinition = "JSON")
    private String destinations; // Danh sách các điểm đến trong tour (JSON array)
    
    @Column(name = "region", length = 50)
    private String region; // Vùng miền (Bắc, Trung, Nam, Đông Bắc Á...)
    
    @Column(name = "country_code", length = 3)
    private String countryCode; // Country code (VN, JP, FR...)
    
    // Transportation and accommodation
    @Column(name = "transportation", length = 100)
    private String transportation; // Phương tiện (Máy bay, Ô tô, Tàu hỏa...)
    
    @Column(name = "accommodation", length = 100)
    private String accommodation; // Khách sạn (3*, 4*, 5*, Resort...)
    
    @Column(name = "meals_included", length = 50)
    private String mealsIncluded; // Bữa ăn (Ăn sáng, Ăn trưa, Ăn tối)
    
    // Services
    @Column(name = "included_services", columnDefinition = "TEXT")
    private String includedServices; // Dịch vụ bao gồm
    
    @Column(name = "excluded_services", columnDefinition = "TEXT")
    private String excludedServices; // Dịch vụ không bao gồm
    
    @Column(name = "note", columnDefinition = "TEXT")
    private String note; // Ghi chú thêm
    
    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    private String cancellationPolicy; // Chính sách hủy tour
    
    // Highlights and suitability
    @Column(name = "highlights", columnDefinition = "JSON")
    private String highlights; // Điểm nổi bật của tour (JSON array)
    
    @Column(name = "suitable_for", length = 100)
    private String suitableFor; // Phù hợp với (Gia đình, Cặp đôi, Nhóm bạn...)
    
    // Visa and flight fields
    @Column(name = "visa_required", nullable = false)
    private Boolean visaRequired = false; // Visa required for international tours
    
    @Column(name = "visa_info", columnDefinition = "TEXT")
    private String visaInfo;
    
    @Column(name = "flight_included", nullable = false)
    private Boolean flightIncluded = false;
    
    // View count
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
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
    
    // Relationship with Country (Many-to-One) - for international tours
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country country;
    
    // Relationship with TourItinerary (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TourItinerary> itineraries;
    
    // Relationship with TourImage (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TourImage> images;
    
    // Relationship with Booking (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Booking> bookings;
    
    // Relationship with Review (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Review> reviews;
    
    // Many-to-Many relationship with TargetAudience
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tour_target_audience",
        joinColumns = @JoinColumn(name = "tour_id"),
        inverseJoinColumns = @JoinColumn(name = "target_audience_id")
    )
    @JsonIgnore
    private Set<TargetAudience> targetAudiences;
    
    // Relationship with TourSchedule (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TourSchedule> schedules;
    
    // Relationship with TourFaq (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TourFaq> faqs;
    
    // Relationship with TourPrice (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<TourPrice> prices;
    
    // Relationship with Wishlist (One-to-Many)
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Wishlist> wishlists;
    
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
    
    public enum TourType {
        DOMESTIC("Domestic"),
        INTERNATIONAL("International");
        
        private final String displayName;
        
        TourType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
