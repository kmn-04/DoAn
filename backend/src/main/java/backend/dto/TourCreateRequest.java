package backend.dto;

import backend.model.Tour.TourStatus;
import backend.model.Tour.TargetAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TourCreateRequest {
    @NotBlank(message = "Tên tour không được để trống")
    private String title;
    
    private String shortDescription;
    private String description;
    private String departureLocation;
    private Long categoryId;
    private TargetAudience targetAudience = TargetAudience.FAMILY;
    
    @NotNull(message = "Số ngày không được để trống")
    @Min(value = 1, message = "Số ngày phải lớn hơn 0")
    private Integer durationDays;
    
    @NotNull(message = "Số đêm không được để trống")
    @Min(value = 0, message = "Số đêm không được âm")
    private Integer durationNights;
    
    @NotNull(message = "Giá tour không được để trống")
    @DecimalMin(value = "0.0", message = "Giá tour phải lớn hơn 0")
    private BigDecimal price;
    
    private BigDecimal discountedPrice;
    private Integer maxParticipants = 50;
    private List<String> galleryImages;
    private String includedServices;
    private String excludedServices;
    private TourStatus status = TourStatus.DRAFT;
    private Boolean isFeatured = false;
    private List<TourItineraryCreateRequest> itinerary;
}
