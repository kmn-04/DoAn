package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tour_itinerary")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourItinerary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    @NotNull(message = "Tour không được để trống")
    private Tour tour;
    
    @Column(name = "day_number", nullable = false)
    @NotNull(message = "Số ngày không được để trống")
    @Min(value = 1, message = "Số ngày phải lớn hơn 0")
    private Integer dayNumber;
    
    @Column(nullable = false)
    @NotBlank(message = "Tiêu đề ngày không được để trống")
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One-to-many relationship with partners for this day
    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TourItineraryPartner> partners;
}
