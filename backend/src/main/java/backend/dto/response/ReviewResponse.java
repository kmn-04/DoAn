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
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String status;
    private Integer helpfulCount;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Admin reply fields
    private String adminReply;
    private LocalDateTime repliedAt;
    private Long repliedBy;
    
    // Moderation fields
    private Boolean isSuspicious;
    private Boolean isSpam;
    private String aiAnalysis;
    private String tags;
    
    private UserSummary user;
    private TourSummary tour;
    private Long bookingId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String avatarUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourSummary {
        private Long id;
        private String name;
        private String slug;
        private String mainImage;
    }
}
