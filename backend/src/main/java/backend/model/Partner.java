package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Tên đối tác không được để trống")
    @Size(max = 200, message = "Tên đối tác không được quá 200 ký tự")
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnerType type;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @ElementCollection
    @CollectionTable(name = "partner_gallery", joinColumns = @JoinColumn(name = "partner_id"))
    @Column(name = "image_url")
    private List<String> galleryImages;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(length = 20)
    private String phone;
    
    @Email(message = "Email không hợp lệ")
    @Column(length = 100)
    private String email;
    
    @Column(length = 255)
    private String website;
    
    @ElementCollection
    @CollectionTable(name = "partner_amenities", joinColumns = @JoinColumn(name = "partner_id"))
    @Column(name = "amenity")
    private List<String> amenities;
    
    @Column(nullable = false)
    @Min(value = 1, message = "Rating phải từ 1 đến 5")
    @Max(value = 5, message = "Rating phải từ 1 đến 5")
    private Integer rating = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "price_range")
    private PriceRange priceRange;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PartnerType {
        HOTEL("Khách sạn"),
        RESTAURANT("Nhà hàng"),
        TRANSPORT("Vận chuyển");
        
        private final String displayName;
        
        PartnerType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum PriceRange {
        BUDGET("Bình dân"),
        MID_RANGE("Tầm trung"),
        LUXURY("Cao cấp");
        
        private final String displayName;
        
        PriceRange(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
