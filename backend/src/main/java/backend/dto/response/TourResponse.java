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
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer duration;
    private Integer maxPeople;
    private String status;
    private Boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private CategoryResponse category;
    private List<TourImageResponse> images;
    private List<TourItineraryResponse> itineraries;
    private List<TargetAudienceResponse> targetAudiences;
    private TourStatistics statistics;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String slug;
        private String imageUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourImageResponse {
        private Long id;
        private String imageUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourItineraryResponse {
        private Long id;
        private Integer dayNumber;
        private String title;
        private String description;
        private PartnerResponse partner;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerResponse {
        private Long id;
        private String name;
        private String type;
        private String address;
        private String phone;
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
    public static class TourStatistics {
        private Double averageRating;
        private Integer totalReviews;
        private Integer totalBookings;
        private Integer availableSpots;
    }
}
