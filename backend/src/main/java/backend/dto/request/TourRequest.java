package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourRequest {
    
    @NotBlank(message = "Tour name is required")
    @Size(max = 255, message = "Tour name must not exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Short description is required")
    @Size(max = 500, message = "Short description must not exceed 500 characters")
    private String shortDescription;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    // Pricing
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    private BigDecimal salePrice;
    
    private BigDecimal childPrice;
    
    private BigDecimal infantPrice;
    
    // Basic info
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer duration;
    
    @NotNull(message = "Max people is required")
    @Min(value = 1, message = "Max people must be at least 1")
    private Integer maxPeople;
    
    @NotNull(message = "Min people is required")
    @Min(value = 1, message = "Min people must be at least 1")
    private Integer minPeople;
    
    @Pattern(regexp = "^(Active|Inactive|Draft)$", message = "Status must be Active, Inactive, or Draft")
    private String status;
    
    private Boolean isFeatured;
    
    private String mainImage;
    
    // Location and destination
    @NotBlank(message = "Tour type is required")
    @Pattern(regexp = "^(DOMESTIC|INTERNATIONAL)$", message = "Tour type must be DOMESTIC or INTERNATIONAL")
    private String tourType;
    
    @NotBlank(message = "Departure location is required")
    private String departureLocation;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    private List<String> destinations;
    
    private String region;
    
    private String countryCode;
    
    // Transportation and accommodation
    private String transportation;
    
    private String accommodation;
    
    private String mealsIncluded;
    
    // Services
    private List<String> includedServices;
    
    private List<String> excludedServices;
    
    private String note;
    
    private String cancellationPolicy;
    
    // Highlights and suitability
    private List<String> highlights;
    
    private String suitableFor;
    
    // Visa and flight
    private Boolean visaRequired;
    
    private String visaInfo;
    
    private Boolean flightIncluded;
    
    // Category
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    // Related data (optional for create/update)
    private List<TourImageRequest> images;
    
    private List<TourItineraryRequest> itineraries;
    
    private List<Long> targetAudienceIds;
    
    private List<TourScheduleRequest> schedules;
    
    private List<TourFaqRequest> faqs;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourImageRequest {
        @NotBlank(message = "Image URL is required")
        private String imageUrl;
        
        private String caption;
        
        private Boolean isPrimary;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourItineraryRequest {
        @NotNull(message = "Day number is required")
        @Min(value = 1, message = "Day number must be at least 1")
        private Integer dayNumber;
        
        @NotBlank(message = "Title is required")
        private String title;
        
        @NotBlank(message = "Description is required")
        private String description;
        
        private String location;
        
        private List<String> activities;
        
        private String meals;
        
        private String accommodation;
        
        private List<String> images;
        
        private Long partnerId;
        
        private Long accommodationPartnerId;
        
        private Long mealsPartnerId;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourScheduleRequest {
        @NotBlank(message = "Departure date is required")
        private String departureDate;
        
        @NotBlank(message = "Return date is required")
        private String returnDate;
        
        @NotNull(message = "Available seats is required")
        @Min(value = 1, message = "Available seats must be at least 1")
        private Integer availableSeats;
        
        private BigDecimal adultPrice;
        
        private BigDecimal childPrice;
        
        private BigDecimal infantPrice;
        
        @Pattern(regexp = "^(Available|Full|Cancelled)$", message = "Status must be Available, Full, or Cancelled")
        private String status;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourFaqRequest {
        @NotBlank(message = "Question is required")
        private String question;
        
        @NotBlank(message = "Answer is required")
        private String answer;
        
        private Integer displayOrder;
    }
}

