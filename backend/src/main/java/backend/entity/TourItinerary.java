package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tour_itineraries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourItinerary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String location; // Địa điểm trong ngày
    
    @Column(columnDefinition = "JSON")
    private String activities; // Danh sách hoạt động (JSON array)
    
    @Column(length = 100)
    private String meals; // Bữa ăn (Sáng, Trưa, Tối)
    
    @Column(length = 150)
    private String accommodation; // Khách sạn/Nơi ở
    
    @Column(columnDefinition = "JSON")
    private String images; // Hình ảnh cho ngày (JSON array)
    
    // Relationship with Tour (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;
    
    // Relationship with Partner (Many-to-One) - Optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner;
    
    // Relationship with Accommodation Partner (Many-to-One) - Optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accommodation_partner_id")
    private Partner accommodationPartner;
    
    // Relationship with Meals Partner (Many-to-One) - Optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meals_partner_id")
    private Partner mealsPartner;
}
