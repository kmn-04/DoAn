package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Partner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Column(unique = true, nullable = false, length = 150)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnerType type;
    
    private String address;
    
    @Column(length = 20)
    private String phone;
    
    private String email;
    
    private String website;
    
    @Column(name = "established_year")
    private Integer establishedYear;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "rating")
    private Double rating = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PartnerStatus status = PartnerStatus.Active;
    
    @Column(name = "specialties", columnDefinition = "TEXT")
    private String specialties; // JSON string of specialties array
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship with TourItinerary (One-to-Many)
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TourItinerary> tourItineraries;
    
    // Relationship with PartnerImage (One-to-Many)
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PartnerImage> images;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PartnerType {
        Hotel("Khách sạn"),
        Restaurant("Nhà hàng");
        
        private final String displayName;
        
        PartnerType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum PartnerStatus {
        Active("Đang hoạt động"),
        Inactive("Tạm ngưng"),
        Suspended("Đình chỉ");
        
        private final String displayName;
        
        PartnerStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
