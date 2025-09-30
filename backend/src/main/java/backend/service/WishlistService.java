package backend.service;

import backend.dto.response.WishlistResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WishlistService {
    
    // Add tour to wishlist
    WishlistResponse addToWishlist(Long userId, Long tourId);
    
    // Remove tour from wishlist
    void removeFromWishlist(Long userId, Long tourId);
    
    // Get user's wishlist
    List<WishlistResponse> getUserWishlist(Long userId);
    
    // Get user's wishlist with pagination
    Page<WishlistResponse> getUserWishlistPaginated(Long userId, Pageable pageable);
    
    // Check if tour is in user's wishlist
    boolean isTourInWishlist(Long userId, Long tourId);
    
    // Count user's wishlist items
    Long countUserWishlist(Long userId);
    
    // Clear user's wishlist
    void clearUserWishlist(Long userId);
}