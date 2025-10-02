package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TourResponse {
    private Long id;
    private String name;
    private String slug;
    private String shortDescription;
    private String description;
    
    // Pricing
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private BigDecimal effectivePrice;
    
    // Basic info
    private Integer duration;
    private Integer maxPeople;
    private Integer minPeople;
    private String status;
    private Boolean isFeatured;
    private String mainImage;
    
    // Location and destination
    private String tourType; // DOMESTIC or INTERNATIONAL
    private String departureLocation;
    private String destination;
    private List<String> destinations; // Multiple destinations
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
    
    // Statistics
    private Integer viewCount;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Related data
    private CategoryResponse category;
    private List<TourImageResponse> images;
    private List<TourItineraryResponse> itineraries;
    private List<TargetAudienceResponse> targetAudiences;
    private List<TourScheduleResponse> schedules;
    private List<TourFaqResponse> faqs;
    private TourStatistics statistics;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String slug;
        private String imageUrl;
        private String icon;
        private Long parentId;
        private Boolean isFeatured;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourImageResponse {
        private Long id;
        private String imageUrl;
        private String caption;
        private Boolean isPrimary;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourItineraryResponse {
        private Long id;
        private Integer dayNumber;
        private String title;
        private String description;
        private String location;
        private List<String> activities;
        private String meals;
        private String accommodation;
        private List<String> images;
        private PartnerResponse partner;
        private PartnerResponse accommodationPartner;
        private PartnerResponse mealsPartner;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerResponse {
        private Long id;
        private String name;
        private String type;
        private String address;
        private Double rating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetAudienceResponse {
        private Long id;
        private String name;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourScheduleResponse {
        private Long id;
        private String departureDate;
        private String returnDate;
        private Integer availableSeats;
        private Integer bookedSeats;
        private BigDecimal adultPrice;
        private BigDecimal childPrice;
        private BigDecimal infantPrice;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourFaqResponse {
        private Long id;
        private String question;
        private String answer;
        private Integer displayOrder;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourStatistics {
        private Long totalBookings;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Integer totalViews;
    }
}