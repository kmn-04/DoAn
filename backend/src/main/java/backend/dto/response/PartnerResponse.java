package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String type;
    private String address;
    private String phone;
    private String email;
    private String website;
    private Integer establishedYear;
    private String avatarUrl;
    private Double rating;
    private Integer totalReviews;
    private Integer totalTours;
    private Integer totalBookings;
    private String status;
    private List<String> specialties;
    private List<PartnerImageResponse> images;
    private List<PartnerTourResponse> tours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerImageResponse {
        private Long id;
        private String imageUrl;
        private String imageType;
        private String altText;
        private Integer displayOrder;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerTourResponse {
        private Long id;
        private String title;
        private String slug;
        private String description;
        private java.math.BigDecimal price;
        private java.math.BigDecimal salePrice;
        private Integer duration;
        private String location;
        private List<String> images;
        private Double rating;
        private Integer totalReviews;
        private Integer maxGroupSize;
        private String difficulty;
        private CategoryResponse category;
        private List<String> highlights;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String slug;
    }
}
