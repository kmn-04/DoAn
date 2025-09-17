package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tours")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tour {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Tên tour không được để trống")
    @Size(max = 200, message = "Tên tour không được quá 200 ký tự")
    private String title;
    
    @Column(name = "short_description", length = 500)
    private String shortDescription;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "departure_location", length = 100)
    private String departureLocation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience")
    private TargetAudience targetAudience = TargetAudience.FAMILY;
    
    @Column(name = "duration_days", nullable = false)
    @NotNull(message = "Số ngày không được để trống")
    @Min(value = 1, message = "Số ngày phải lớn hơn 0")
    private Integer durationDays;
    
    @Column(name = "duration_nights", nullable = false)
    @NotNull(message = "Số đêm không được để trống")
    @Min(value = 0, message = "Số đêm không được âm")
    private Integer durationNights;
    
    @Column(nullable = false, precision = 12, scale = 2)
    @NotNull(message = "Giá tour không được để trống")
    @DecimalMin(value = "0.0", message = "Giá tour phải lớn hơn 0")
    private BigDecimal price;
    
    @Column(name = "discounted_price", precision = 12, scale = 2)
    private BigDecimal discountedPrice;
    
    @Column(name = "max_participants")
    @Min(value = 1, message = "Số người tối đa phải lớn hơn 0")
    private Integer maxParticipants = 50;
    
    @Column(name = "gallery_images", columnDefinition = "JSON")
    private String galleryImagesJson;
    
    @Column(name = "included_services", columnDefinition = "TEXT")
    private String includedServices;
    
    @Column(name = "excluded_services", columnDefinition = "TEXT")
    private String excludedServices;
    
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TourStatus status = TourStatus.DRAFT;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("dayNumber ASC")
    private List<TourItinerary> itinerary;
    
    public enum TourStatus {
        DRAFT("Nháp"),
        ACTIVE("Hoạt động"),
        INACTIVE("Không hoạt động");
        
        private final String displayName;
        
        TourStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum TargetAudience {
        FAMILY("Gia đình"),
        COUPLE("Cặp đôi"),
        SOLO("Solo"),
        FRIENDS("Nhóm bạn"),
        BUSINESS("Công ty");
        
        private final String displayName;
        
        TargetAudience(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    
    
    @JsonProperty("galleryImages")
    public List<String> getGalleryImages() {
        if (galleryImagesJson == null || galleryImagesJson.isEmpty()) {
            return List.of();
        }
        try {
            String cleaned = galleryImagesJson.replace("[", "").replace("]", "").replace("\"", "");
            if (cleaned.trim().isEmpty()) {
                return List.of();
            }
            return List.of(cleaned.split(","));
        } catch (Exception e) {
            return List.of();
        }
    }
    
    @JsonProperty("galleryImages")
    public void setGalleryImages(List<String> galleryImages) {
        if (galleryImages == null || galleryImages.isEmpty()) {
            this.galleryImagesJson = null;
        } else {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < galleryImages.size(); i++) {
                sb.append("\"").append(galleryImages.get(i).trim()).append("\"");
                if (i < galleryImages.size() - 1) {
                    sb.append(",");
                }
            }
            sb.append("]");
            this.galleryImagesJson = sb.toString();
        }
    }
}
