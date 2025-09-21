package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnerType type;
    
    private String address;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    // Relationship with TourItinerary (One-to-Many)
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TourItinerary> tourItineraries;
    
    public enum PartnerType {
        Hotel, Restaurant, Transport
    }
}
