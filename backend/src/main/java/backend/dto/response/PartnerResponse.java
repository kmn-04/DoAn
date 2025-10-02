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
    private String status;
    private String specialties;
    private List<PartnerImageResponse> images;
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
}
