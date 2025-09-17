package backend.dto;

import backend.model.Tour.TourStatus;
import backend.model.Tour.TargetAudience;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TourUpdateRequest {
    private String title;
    private String shortDescription;
    private String description;
    private String departureLocation;
    private Long categoryId;
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
    private List<TourItineraryCreateRequest> itinerary;
}
