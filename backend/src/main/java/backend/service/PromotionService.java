package backend.service;

import backend.dto.request.PromotionRequest;
import backend.dto.response.PromotionResponse;
import backend.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PromotionService {
    
    /**
     * Create a new promotion
     */
    Promotion createPromotion(PromotionRequest request);
    
    /**
     * Update an existing promotion
     */
    Promotion updatePromotion(Long id, PromotionRequest request);
    
    /**
     * Delete a promotion
     */
    void deletePromotion(Long id);
    
    /**
     * Get promotion by ID
     */
    Optional<Promotion> getPromotionById(Long id);
    
    /**
     * Get promotion by code
     */
    Optional<Promotion> getPromotionByCode(String code);
    
    /**
     * Get all promotions with pagination
     */
    Page<Promotion> getAllPromotions(Pageable pageable);
    
    /**
     * Get active promotions
     */
    List<Promotion> getActivePromotions();
    
    /**
     * Get valid promotions (active and within date range)
     */
    List<Promotion> getValidPromotions();
    
    /**
     * Validate promotion code
     * Returns the promotion if valid, empty if invalid
     */
    Optional<Promotion> validatePromotionCode(String code);
    
    /**
     * Check if promotion is valid
     */
    boolean isPromotionValid(Promotion promotion);
    
    /**
     * Get promotion usage count
     */
    long getPromotionUsageCount(Long promotionId);
    
    /**
     * Mark expired promotions
     */
    void markExpiredPromotions();
    
    /**
     * Get total promotions count
     */
    long getTotalPromotions();
    
    /**
     * Convert Promotion entity to PromotionResponse DTO
     */
    PromotionResponse toResponse(Promotion promotion);
    
    /**
     * Search promotions by code or name
     */
    Page<Promotion> searchPromotions(String keyword, Pageable pageable);
}

