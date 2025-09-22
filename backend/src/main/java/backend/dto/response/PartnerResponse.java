package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
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
    private List<String> specialties;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<PartnerImageResponse> images;
    private Integer totalTours; // Calculated field
    private Integer totalBookings; // Calculated field
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerImageResponse {
        private Long id;
        private String imageUrl;
        private String imageType;
        private Integer displayOrder;
        private String altText;
    }
}
