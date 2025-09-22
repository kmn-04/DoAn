package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "partner_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(name = "image_type")
    private String imageType; // 'cover', 'gallery', 'logo'
    
    @Column(name = "display_order")
    private Integer displayOrder; // For ordering images
    
    @Column(name = "alt_text")
    private String altText; // SEO friendly alt text
    
    // Relationship with Partner (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;
    
    public PartnerImage(String imageUrl, Partner partner) {
        this.imageUrl = imageUrl;
        this.partner = partner;
        this.imageType = "gallery"; // default type
        this.displayOrder = 0;
    }
    
    public PartnerImage(String imageUrl, String imageType, Partner partner) {
        this.imageUrl = imageUrl;
        this.imageType = imageType;
        this.partner = partner;
        this.displayOrder = 0;
    }
    
    public PartnerImage(String imageUrl, String imageType, Integer displayOrder, Partner partner) {
        this.imageUrl = imageUrl;
        this.imageType = imageType;
        this.displayOrder = displayOrder;
        this.partner = partner;
    }
}
