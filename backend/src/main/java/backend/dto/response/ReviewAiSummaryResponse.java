package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI-generated summary of reviews for a tour
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAiSummaryResponse {
    
    /**
     * Positive highlights from reviews
     */
    private String positive;
    
    /**
     * Negative points from reviews
     */
    private String negative;
    
    /**
     * Overall summary
     */
    private String summary;
    
    /**
     * Total number of reviews analyzed
     */
    private Integer totalReviews;
    
    /**
     * Average rating
     */
    private Double averageRating;
    
    /**
     * Whether this result was cached
     */
    private Boolean cached;
    
    /**
     * Timestamp of summary generation
     */
    private String generatedAt;
}

