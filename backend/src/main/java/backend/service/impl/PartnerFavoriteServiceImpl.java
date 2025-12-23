package backend.service.impl;

import backend.entity.Partner;
import backend.entity.PartnerFavorite;
import backend.entity.User;
import backend.repository.PartnerFavoriteRepository;
import backend.repository.PartnerRepository;
import backend.repository.UserRepository;
import backend.service.PartnerFavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartnerFavoriteServiceImpl implements PartnerFavoriteService {
    
    private final PartnerFavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository;
    
    @Override
    @Transactional
    public void addToFavorites(Long userId, Long partnerId) {
        // Check if already exists
        if (favoriteRepository.existsByUserIdAndPartnerId(userId, partnerId)) {
            log.info("Partner {} already in favorites for user {}", partnerId, userId);
            return; // Already favorited, no need to throw error
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        Partner partner = partnerRepository.findById(partnerId)
            .orElseThrow(() -> new RuntimeException("Partner not found with ID: " + partnerId));
        
        PartnerFavorite favorite = new PartnerFavorite();
        favorite.setUser(user);
        favorite.setPartner(partner);
        
        favoriteRepository.save(favorite);
        log.info("Added partner {} to favorites for user {}", partnerId, userId);
    }
    
    @Override
    @Transactional
    public void removeFromFavorites(Long userId, Long partnerId) {
        if (!favoriteRepository.existsByUserIdAndPartnerId(userId, partnerId)) {
            log.info("Partner {} not in favorites for user {}", partnerId, userId);
            return; // Not favorited, no need to throw error
        }
        
        favoriteRepository.deleteByUserIdAndPartnerId(userId, partnerId);
        log.info("Removed partner {} from favorites for user {}", partnerId, userId);
    }
    
    @Override
    public boolean isPartnerInFavorites(Long userId, Long partnerId) {
        return favoriteRepository.existsByUserIdAndPartnerId(userId, partnerId);
    }
    
    @Override
    public List<Long> getUserFavoritePartnerIds(Long userId) {
        return favoriteRepository.findPartnerIdsByUserId(userId);
    }
    
    @Override
    public Long countUserFavorites(Long userId) {
        return favoriteRepository.countByUserId(userId);
    }
}

