package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Banner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 500)
    private String subtitle;
    
    @Column(nullable = false)
    private String imageUrl;
    
    @Column(length = 500)
    private String linkUrl; // Link to tour, category, or page
    
    @Column(length = 100)
    private String buttonText; // e.g., "Khám phá ngay", "Xem chi tiết"
    
    @Column(nullable = false)
    private Integer displayOrder = 0; // Order for slider
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column
    private LocalDateTime startDate; // When to start showing
    
    @Column
    private LocalDateTime endDate; // When to stop showing
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
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
}

