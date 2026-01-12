package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for AI Content Generation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIContentGenerateResponse {
    
    private String type;
    private String content;
    private Map<String, Object> metadata; // Additional metadata (e.g., title, description, keywords for SEO)
    private String model;
    private Integer tokensUsed;
    private Long processingTimeMs;
}
