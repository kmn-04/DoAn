package backend.service.impl;

import backend.dto.response.WishlistResponse;
import backend.entity.Tour;
import backend.entity.User;
import backend.entity.Wishlist;
import backend.mapper.EntityMapper;
import backend.repository.TourRepository;
import backend.repository.UserRepository;
import backend.repository.WishlistRepository;
import backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final EntityMapper entityMapper;
    
    @Override
    @Transactional
    public WishlistResponse addToWishlist(Long userId, Long tourId) {
        // Check if already exists
        if (wishlistRepository.existsByUserIdAndTourId(userId, tourId)) {
            throw new RuntimeException("Tour already in wishlist");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Tour tour = tourRepository.findById(tourId)
            .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setTour(tour);
        
        Wishlist saved = wishlistRepository.save(wishlist);
        return entityMapper.toWishlistResponse(saved);
    }
    
    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long tourId) {
        wishlistRepository.deleteByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    public List<WishlistResponse> getUserWishlist(Long userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserIdWithActiveTours(userId);
        return entityMapper.toWishlistResponseList(wishlists);
    }
    
    @Override
    public Page<WishlistResponse> getUserWishlistPaginated(Long userId, Pageable pageable) {
        Page<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return wishlists.map(entityMapper::toWishlistResponse);
    }
    
    @Override
    public boolean isTourInWishlist(Long userId, Long tourId) {
        return wishlistRepository.existsByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    public Long countUserWishlist(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }
    
    @Override
    @Transactional
    public void clearUserWishlist(Long userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        wishlistRepository.deleteAll(wishlists);
    }
}