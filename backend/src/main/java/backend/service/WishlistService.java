package backend.service;

import backend.entity.Wishlist;
import backend.entity.User;
import backend.entity.Tour;

import java.util.List;
import java.util.Optional;

public interface WishlistService {
    
    /**
     * Add tour to user's wishlist
     */
    Wishlist addToWishlist(Long userId, Long tourId);
    
    /**
     * Remove tour from user's wishlist
     */
    void removeFromWishlist(Long userId, Long tourId);
    
    /**
     * Get user's wishlist
     */
    List<Wishlist> getUserWishlist(Long userId);
    
    /**
     * Check if tour is in user's wishlist
     */
    boolean isInWishlist(Long userId, Long tourId);
    
    /**
     * Get wishlist count for user
     */
    long getWishlistCount(Long userId);
    
    /**
     * Get most wishlisted tours
     */
    List<Tour> getMostWishlistedTours(int limit);
    
    /**
     * Clear user's entire wishlist
     */
    void clearUserWishlist(Long userId);
    
    /**
     * Get wishlist statistics
     */
    WishlistStatistics getWishlistStatistics();
    
    // Statistics DTO
    class WishlistStatistics {
        private final long totalWishlists;
        private final long uniqueUsers;
        private final long uniqueTours;
        private final double averageWishlistSize;
        
        public WishlistStatistics(long totalWishlists, long uniqueUsers, long uniqueTours, double averageWishlistSize) {
            this.totalWishlists = totalWishlists;
            this.uniqueUsers = uniqueUsers;
            this.uniqueTours = uniqueTours;
            this.averageWishlistSize = averageWishlistSize;
        }
        
        // Getters
        public long getTotalWishlists() { return totalWishlists; }
        public long getUniqueUsers() { return uniqueUsers; }
        public long getUniqueTours() { return uniqueTours; }
        public double getAverageWishlistSize() { return averageWishlistSize; }
    }
}
