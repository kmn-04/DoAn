package backend.service.impl;

import backend.entity.Wishlist;
import backend.entity.User;
import backend.entity.Tour;
import backend.repository.WishlistRepository;
import backend.repository.UserRepository;
import backend.repository.TourRepository;
import backend.service.WishlistService;
import backend.exception.ResourceNotFoundException;
import backend.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WishlistServiceImpl implements WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    
    @Override
    public Wishlist addToWishlist(Long userId, Long tourId) {
        log.info("Adding tour {} to user {}'s wishlist", tourId, userId);
        
        // Check if user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check if tour exists
        Tour tour = tourRepository.findById(tourId)
            .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));
        
        // Check if already in wishlist
        if (wishlistRepository.existsByUserIdAndTourId(userId, tourId)) {
            throw new BadRequestException("Tour is already in wishlist");
        }
        
        // Create and save wishlist item
        Wishlist wishlist = new Wishlist(user, tour);
        return wishlistRepository.save(wishlist);
    }
    
    @Override
    public void removeFromWishlist(Long userId, Long tourId) {
        log.info("Removing tour {} from user {}'s wishlist", tourId, userId);
        
        if (!wishlistRepository.existsByUserIdAndTourId(userId, tourId)) {
            throw new ResourceNotFoundException("Wishlist item not found for user " + userId + " and tour " + tourId);
        }
        
        wishlistRepository.deleteByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Wishlist> getUserWishlist(Long userId) {
        log.info("Getting wishlist for user {}", userId);
        
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        return wishlistRepository.findByUserIdWithTourDetails(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long tourId) {
        return wishlistRepository.existsByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getWishlistCount(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getMostWishlistedTours(int limit) {
        log.info("Getting most wishlisted tours with limit {}", limit);
        
        List<Object[]> results = wishlistRepository.findMostWishlistedTours();
        
        return results.stream()
            .limit(limit)
            .map(result -> {
                Long tourId = (Long) result[0];
                return tourRepository.findById(tourId).orElse(null);
            })
            .filter(tour -> tour != null)
            .collect(Collectors.toList());
    }
    
    @Override
    public void clearUserWishlist(Long userId) {
        log.info("Clearing wishlist for user {}", userId);
        
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        List<Wishlist> userWishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        wishlistRepository.deleteAll(userWishlists);
        
        log.info("Cleared {} items from user {}'s wishlist", userWishlists.size(), userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public WishlistStatistics getWishlistStatistics() {
        log.info("Getting wishlist statistics");
        
        long totalWishlists = wishlistRepository.count();
        
        // Count unique users with wishlists
        long uniqueUsers = wishlistRepository.findAll().stream()
            .map(w -> w.getUser().getId())
            .distinct()
            .count();
        
        // Count unique tours in wishlists
        long uniqueTours = wishlistRepository.findAll().stream()
            .map(w -> w.getTour().getId())
            .distinct()
            .count();
        
        // Calculate average wishlist size
        double averageWishlistSize = uniqueUsers > 0 ? (double) totalWishlists / uniqueUsers : 0;
        
        return new WishlistStatistics(totalWishlists, uniqueUsers, uniqueTours, averageWishlistSize);
    }
}
