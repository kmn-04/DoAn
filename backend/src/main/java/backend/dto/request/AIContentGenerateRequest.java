package backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for AI Content Generation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIContentGenerateRequest {
    
    @NotBlank(message = "Content type is required")
    private String type; // "tour_description", "email_template", "seo_meta", "promotion_copy"
    
    @NotNull(message = "Data is required")
    private Map<String, Object> data;
    
    // Optional: Override default model settings
    private String model;
    private Integer maxTokens;
    private Double temperature;
}
