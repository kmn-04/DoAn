package backend.dto;

import backend.model.Tour.TourStatus;
import backend.model.Tour.TargetAudience;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TourDto {
    private Long id;
    private String title;
    private String shortDescription;
    private String description;
    private String departureLocation;
    private CategoryDto category;
    private TargetAudience targetAudience;
    private Integer durationDays;
    private Integer durationNights;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer maxParticipants;
    private List<String> galleryImages;
    private String includedServices;
    private String excludedServices;
    private TourStatus status;
    private Boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TourItineraryDto> itinerary;
}
