package backend.service;

public interface PartnerFavoriteService {
    
    /**
     * Add partner to favorites
     */
    void addToFavorites(Long userId, Long partnerId);
    
    /**
     * Remove partner from favorites
     */
    void removeFromFavorites(Long userId, Long partnerId);
    
    /**
     * Check if partner is in user's favorites
     */
    boolean isPartnerInFavorites(Long userId, Long partnerId);
    
    /**
     * Get all partner IDs favorited by user
     */
    java.util.List<Long> getUserFavoritePartnerIds(Long userId);
    
    /**
     * Count user's favorite partners
     */
    Long countUserFavorites(Long userId);
}

