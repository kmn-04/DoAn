package backend.service;

import backend.entity.*;
import backend.entity.LoyaltyPoints.LoyaltyLevel;
import backend.entity.PointTransaction.SourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface LoyaltyService {
    
    /**
     * Get or create loyalty points for user
     */
    LoyaltyPoints getOrCreateLoyaltyPoints(Long userId);
    
    /**
     * Get loyalty points by user ID
     */
    LoyaltyPoints getLoyaltyPointsByUserId(Long userId);
    
    /**
     * Add points to user account
     */
    PointTransaction addPoints(Long userId, Integer points, SourceType sourceType, 
                               Long sourceId, String description);
    
    /**
     * Deduct points from user account
     */
    PointTransaction deductPoints(Long userId, Integer points, SourceType sourceType,
                                  Long sourceId, String description);
    
    /**
     * Calculate and award points from booking
     */
    PointTransaction awardBookingPoints(Long userId, Long bookingId, 
                                        BigDecimal bookingAmount, String tourType);
    
    /**
     * Calculate and award points from review
     */
    PointTransaction awardReviewPoints(Long userId, Long reviewId, 
                                       boolean hasPhotos, int contentLength);
    
    /**
     * Award referral points to referrer and referee
     */
    void awardReferralPoints(Long referrerId, Long refereeId, Long bookingId);
    
    /**
     * Award birthday bonus points
     */
    PointTransaction awardBirthdayBonus(Long userId);
    
    /**
     * Check and update user level based on points
     */
    boolean checkAndUpdateLevel(Long userId);
    
    /**
     * Get level benefits for user
     */
    Map<String, Object> getLevelBenefits(LoyaltyLevel level);
    
    /**
     * Get discount percentage for user's level
     */
    BigDecimal getLevelDiscount(Long userId);
    
    /**
     * Get transaction history
     */
    Page<PointTransaction> getTransactionHistory(Long userId, Pageable pageable);
    
    /**
     * Get recent transactions
     */
    List<PointTransaction> getRecentTransactions(Long userId, int limit);
    
    /**
     * Process expired points
     */
    void processExpiredPoints();
    
    /**
     * Get loyalty statistics for user
     */
    Map<String, Object> getUserLoyaltyStats(Long userId);
    
    /**
     * Get top users by points
     */
    List<LoyaltyPoints> getTopUsersByPoints(int limit);
}

