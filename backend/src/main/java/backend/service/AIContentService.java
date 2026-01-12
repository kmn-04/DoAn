package backend.service;

import backend.dto.response.AIContentGenerateResponse;

import java.util.Map;

/**
 * Service interface for AI Content Generation
 */
public interface AIContentService {
    
    /**
     * Generate content based on type and data
     * 
     * @param type Content type: "tour_description", "email_template", "seo_meta", "promotion_copy"
     * @param data Data for content generation
     * @param model Optional model override
     * @param maxTokens Optional max tokens override
     * @param temperature Optional temperature override
     * @return Generated content response
     * @throws Exception if generation fails
     */
    AIContentGenerateResponse generateContent(
            String type,
            Map<String, Object> data,
            String model,
            Integer maxTokens,
            Double temperature
    ) throws Exception;
}
