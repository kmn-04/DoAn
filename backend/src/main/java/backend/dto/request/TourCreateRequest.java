package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourCreateRequest {
    
    @NotBlank(message = "Tour name is required")
    @Size(min = 5, max = 150, message = "Tour name must be between 5 and 150 characters")
    private String name;
    
    @Size(max = 150, message = "Slug must not exceed 150 characters")
    private String slug;
    
    @Size(max = 500, message = "Short description must not exceed 500 characters")
    private String shortDescription;
    
    @NotBlank(message = "Description is required")
    @Size(min = 50, message = "Description must be at least 50 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Sale price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Sale price format is invalid")
    private BigDecimal salePrice;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 365, message = "Duration must not exceed 365 days")
    private Integer duration;
    
    @NotNull(message = "Max people is required")
    @Min(value = 1, message = "Max people must be at least 1")
    @Max(value = 1000, message = "Max people must not exceed 1000")
    private Integer maxPeople;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    private Boolean isFeatured = false;
    
    private List<String> targetAudienceIds;
    
    private List<TourItineraryRequest> itineraries;
    
    private List<String> imageUrls;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourItineraryRequest {
        @NotNull(message = "Day number is required")
        @Min(value = 1, message = "Day number must be at least 1")
        private Integer dayNumber;
        
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        private String description;
        
        private Long partnerId;
    }
}
