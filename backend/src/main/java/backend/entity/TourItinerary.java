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
    
    // Relationship with Tour (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;
    
    // Relationship with Partner (Many-to-One) - Optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner;
}
