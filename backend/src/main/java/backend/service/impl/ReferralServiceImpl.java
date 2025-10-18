package backend.service.impl;

import backend.entity.Booking;
import backend.entity.Referral;
import backend.entity.Referral.ReferralStatus;
import backend.entity.User;
import backend.repository.BookingRepository;
import backend.repository.ReferralRepository;
import backend.repository.UserRepository;
import backend.service.LoyaltyService;
import backend.service.ReferralService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReferralServiceImpl implements ReferralService {
    
    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final LoyaltyService loyaltyService;
    
    @Override
    public String generateReferralCode(Long userId) {
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate unique code based on user ID and random string
        String code;
        do {
            code = "REF" + userId + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (referralRepository.existsByReferralCode(code));
        
        return code;
    }
    
    @Override
    public String getUserReferralCode(Long userId) {
        // Check if user already has referrals
        List<Referral> existingReferrals = referralRepository.findByReferrerIdOrderByCreatedAtDesc(userId);
        
        if (!existingReferrals.isEmpty()) {
            return existingReferrals.get(0).getReferralCode();
        }
        
        // Generate new code if none exists
        return generateReferralCode(userId);
    }
    
    @Override
    public Referral applyReferralCode(String referralCode, Long newUserId) {
        // Find referrer by code
        Referral existingReferral = referralRepository.findByReferralCode(referralCode)
            .orElse(null);
        
        Long referrerId;
        if (existingReferral != null) {
            referrerId = existingReferral.getReferrer().getId();
        } else {
            // Extract user ID from code (format: REF{userId}{random})
            try {
                String userIdPart = referralCode.substring(3);
                userIdPart = userIdPart.replaceAll("[^0-9]", "");
                referrerId = Long.parseLong(userIdPart);
            } catch (Exception e) {
                throw new RuntimeException("Invalid referral code");
            }
        }
        
        // Check if referrer exists
        User referrer = userRepository.findById(referrerId)
            .orElseThrow(() -> new RuntimeException("Referrer not found"));
        
        // Check if new user exists
        User referee = userRepository.findById(newUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user already has a referral
        if (referralRepository.existsByRefereeId(newUserId)) {
            throw new RuntimeException("User already has a referral");
        }
        
        // Create referral
        Referral referral = new Referral();
        referral.setReferrer(referrer);
        referral.setReferee(referee);
        referral.setReferralCode(referralCode);
        referral.setStatus(ReferralStatus.PENDING);
        
        Referral savedReferral = referralRepository.save(referral);
        
        log.info("User {} referred by user {} with code {}", newUserId, referrerId, referralCode);
        
        return savedReferral;
    }
    
    @Override
    public void completeReferral(Long refereeId, Long bookingId) {
        Referral referral = referralRepository.findByRefereeId(refereeId)
            .orElse(null);
        
        if (referral == null) {
            log.debug("No referral found for user {}", refereeId);
            return;
        }
        
        if (referral.getStatus() != ReferralStatus.PENDING) {
            log.debug("Referral already completed for user {}", refereeId);
            return;
        }
        
        // Get booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Award points to both referrer and referee
        loyaltyService.awardReferralPoints(
            referral.getReferrer().getId(),
            refereeId,
            bookingId
        );
        
        // Update referral status
        referral.setStatus(ReferralStatus.COMPLETED);
        referral.setFirstBooking(booking);
        referral.setCompletedAt(LocalDateTime.now());
        referral.setPointsEarned(200); // Default referrer points
        
        referralRepository.save(referral);
        
        log.info("Referral completed for referee {} by referrer {}", 
            refereeId, referral.getReferrer().getId());
    }
    
    @Override
    public List<Referral> getReferralsByReferrer(Long referrerId) {
        return referralRepository.findByReferrerIdOrderByCreatedAtDesc(referrerId);
    }
    
    @Override
    public Map<String, Object> getReferralStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get referral code
        String referralCode = getUserReferralCode(userId);
        stats.put("referralCode", referralCode);
        
        // Get all referrals
        List<Referral> referrals = getReferralsByReferrer(userId);
        stats.put("totalReferrals", referrals.size());
        
        // Count successful referrals
        Long successfulCount = referralRepository.countSuccessfulReferralsByReferrerId(userId);
        stats.put("successfulReferrals", successfulCount);
        
        // Get pending referrals
        List<Referral> pendingReferrals = referralRepository.findPendingReferralsByUserId(userId);
        stats.put("pendingReferrals", pendingReferrals.size());
        
        // Get total points earned
        Integer totalPoints = referralRepository.getTotalPointsEarnedFromReferrals(userId);
        stats.put("totalPointsEarned", totalPoints != null ? totalPoints : 0);
        
        return stats;
    }
    
    @Override
    public boolean wasUserReferred(Long userId) {
        return referralRepository.existsByRefereeId(userId);
    }
}

