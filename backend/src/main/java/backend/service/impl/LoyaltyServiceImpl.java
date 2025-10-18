package backend.service.impl;

import backend.entity.*;
import backend.entity.LoyaltyPoints.LoyaltyLevel;
import backend.entity.PointTransaction.SourceType;
import backend.entity.PointTransaction.TransactionType;
import backend.repository.*;
import backend.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LoyaltyServiceImpl implements LoyaltyService {
    
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final LoyaltyConfigRepository loyaltyConfigRepository;
    private final LoyaltyLevelHistoryRepository levelHistoryRepository;
    private final UserRepository userRepository;
    private final backend.service.EmailService emailService;
    
    @Override
    public LoyaltyPoints getOrCreateLoyaltyPoints(Long userId) {
        return loyaltyPointsRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                LoyaltyPoints loyaltyPoints = new LoyaltyPoints();
                loyaltyPoints.setUser(user);
                loyaltyPoints.setPointsBalance(0);
                loyaltyPoints.setTotalEarned(0);
                loyaltyPoints.setTotalRedeemed(0);
                loyaltyPoints.setLevel(LoyaltyLevel.BRONZE);
                
                return loyaltyPointsRepository.save(loyaltyPoints);
            });
    }
    
    @Override
    public LoyaltyPoints getLoyaltyPointsByUserId(Long userId) {
        return loyaltyPointsRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Loyalty points not found for user"));
    }
    
    @Override
    public PointTransaction addPoints(Long userId, Integer points, SourceType sourceType,
                                      Long sourceId, String description) {
        LoyaltyPoints loyaltyPoints = getOrCreateLoyaltyPoints(userId);
        
        // Create transaction
        PointTransaction transaction = new PointTransaction();
        transaction.setUser(loyaltyPoints.getUser());
        transaction.setPoints(points);
        transaction.setTransactionType(TransactionType.EARNED);
        transaction.setSourceType(sourceType);
        transaction.setSourceId(sourceId);
        transaction.setDescription(description);
        transaction.setBalanceBefore(loyaltyPoints.getPointsBalance());
        transaction.setBalanceAfter(loyaltyPoints.getPointsBalance() + points);
        
        // Set expiry date (24 months from now)
        String expiryMonthsStr = getConfigValue("point_expiry_months", "24");
        int expiryMonths = Integer.parseInt(expiryMonthsStr);
        transaction.setExpiresAt(LocalDate.now().plusMonths(expiryMonths));
        
        // Update loyalty points
        loyaltyPoints.setPointsBalance(loyaltyPoints.getPointsBalance() + points);
        loyaltyPoints.setTotalEarned(loyaltyPoints.getTotalEarned() + points);
        
        loyaltyPointsRepository.save(loyaltyPoints);
        PointTransaction savedTransaction = pointTransactionRepository.save(transaction);
        
        // Send email notification for points earned
        try {
            emailService.sendPointsEarnedEmail(
                loyaltyPoints.getUser(), 
                points, 
                sourceType.name(), 
                description
            );
        } catch (Exception e) {
            log.error("Failed to send points earned email", e);
        }
        
        // Check for level up
        checkAndUpdateLevel(userId);
        
        log.info("Added {} points to user {}: {}", points, userId, description);
        
        return savedTransaction;
    }
    
    @Override
    public PointTransaction deductPoints(Long userId, Integer points, SourceType sourceType,
                                        Long sourceId, String description) {
        LoyaltyPoints loyaltyPoints = getLoyaltyPointsByUserId(userId);
        
        if (loyaltyPoints.getPointsBalance() < points) {
            throw new RuntimeException("Insufficient points balance");
        }
        
        // Create transaction
        PointTransaction transaction = new PointTransaction();
        transaction.setUser(loyaltyPoints.getUser());
        transaction.setPoints(-points); // Negative for deduction
        transaction.setTransactionType(TransactionType.REDEEMED);
        transaction.setSourceType(sourceType);
        transaction.setSourceId(sourceId);
        transaction.setDescription(description);
        transaction.setBalanceBefore(loyaltyPoints.getPointsBalance());
        transaction.setBalanceAfter(loyaltyPoints.getPointsBalance() - points);
        
        // Update loyalty points
        loyaltyPoints.setPointsBalance(loyaltyPoints.getPointsBalance() - points);
        loyaltyPoints.setTotalRedeemed(loyaltyPoints.getTotalRedeemed() + points);
        
        loyaltyPointsRepository.save(loyaltyPoints);
        PointTransaction savedTransaction = pointTransactionRepository.save(transaction);
        
        log.info("Deducted {} points from user {}: {}", points, userId, description);
        
        return savedTransaction;
    }
    
    @Override
    public PointTransaction awardBookingPoints(Long userId, Long bookingId,
                                               BigDecimal bookingAmount, String tourType) {
        // Hardcode rates to avoid database dependency
        double rate = tourType != null && tourType.equals("INTERNATIONAL") 
            ? 0.0008  // 0.08% for international
            : 0.0005; // 0.05% for domestic
        
        // Calculate base points
        int basePoints = (int) (bookingAmount.doubleValue() * rate);
        
        // Apply multipliers
        double multiplier = 1.0;
        
        // Check if first booking
        long bookingCount = pointTransactionRepository.countByUserIdAndTransactionType(
            userId, TransactionType.EARNED);
        
        // Hardcode first booking multiplier
        if (bookingCount == 0) {
            multiplier *= 1.3; // Fixed multiplier
        }
        
        // Check birthday month
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getDateOfBirth() != null) {
            if (user.getDateOfBirth().getMonth() == LocalDate.now().getMonth()) {
                multiplier *= Double.parseDouble(getConfigValue("birthday_month_multiplier", "1.5"));
            }
        }
        
        int finalPoints = (int) (basePoints * multiplier);
        
        String description = String.format("Tích điểm từ booking #%d (x%.1f)", bookingId, multiplier);
        
        return addPoints(userId, finalPoints, SourceType.BOOKING, bookingId, description);
    }
    
    @Override
    public PointTransaction awardReviewPoints(Long userId, Long reviewId,
                                              boolean hasPhotos, int contentLength) {
        int points = Integer.parseInt(getConfigValue("review_basic_points", "50"));
        
        if (hasPhotos) {
            points = Integer.parseInt(getConfigValue("review_with_photo_points", "100"));
        }
        
        if (contentLength > 200) {
            points = Integer.parseInt(getConfigValue("review_detailed_points", "150"));
        }
        
        String description = String.format("Tích điểm từ đánh giá #%d", reviewId);
        
        return addPoints(userId, points, SourceType.REVIEW, reviewId, description);
    }
    
    @Override
    public void awardReferralPoints(Long referrerId, Long refereeId, Long bookingId) {
        int referrerPoints = Integer.parseInt(getConfigValue("referral_referrer_points", "200"));
        int refereePoints = Integer.parseInt(getConfigValue("referral_referee_points", "100"));
        
        addPoints(referrerId, referrerPoints, SourceType.REFERRAL, bookingId,
            "Thưởng giới thiệu bạn bè");
        
        addPoints(refereeId, refereePoints, SourceType.REFERRAL, bookingId,
            "Thưởng đăng ký qua giới thiệu");
        
        log.info("Awarded referral points: {} to referrer {}, {} to referee {}",
            referrerPoints, referrerId, refereePoints, refereeId);
    }
    
    @Override
    public PointTransaction awardBirthdayBonus(Long userId) {
        int bonusPoints = Integer.parseInt(getConfigValue("birthday_bonus_points", "500"));
        
        return addPoints(userId, bonusPoints, SourceType.BIRTHDAY, null,
            "Chúc mừng sinh nhật!");
    }
    
    @Override
    public boolean checkAndUpdateLevel(Long userId) {
        LoyaltyPoints loyaltyPoints = getLoyaltyPointsByUserId(userId);
        LoyaltyLevel currentLevel = loyaltyPoints.getLevel();
        LoyaltyLevel newLevel = calculateLevel(loyaltyPoints.getTotalEarned());
        
        if (newLevel != currentLevel) {
            LoyaltyLevel oldLevel = currentLevel;
            loyaltyPoints.setLevel(newLevel);
            loyaltyPoints.setLevelUpdatedAt(LocalDateTime.now());
            loyaltyPointsRepository.save(loyaltyPoints);
            
            // Record level change
            LoyaltyLevelHistory history = new LoyaltyLevelHistory();
            history.setUser(loyaltyPoints.getUser());
            history.setOldLevel(oldLevel);
            history.setNewLevel(newLevel);
            history.setPointsAtChange(loyaltyPoints.getTotalEarned());
            history.setReason("Đạt đủ điểm để nâng cấp");
            levelHistoryRepository.save(history);
            
            // Send level up email notification
            try {
                emailService.sendLevelUpEmail(
                    loyaltyPoints.getUser(),
                    oldLevel.name(),
                    newLevel.name(),
                    loyaltyPoints.getPointsBalance()
                );
            } catch (Exception e) {
                log.error("Failed to send level up email", e);
            }
            
            log.info("User {} upgraded from {} to {}", userId, oldLevel, newLevel);
            
            return true;
        }
        
        return false;
    }
    
    @Override
    public Map<String, Object> getLevelBenefits(LoyaltyLevel level) {
        Map<String, Object> benefits = new HashMap<>();
        
        String discountKey = level.name().toLowerCase() + "_discount";
        double discount = Double.parseDouble(getConfigValue(discountKey, "0"));
        
        benefits.put("level", level.name());
        benefits.put("discount", discount);
        benefits.put("priority", level.ordinal() >= LoyaltyLevel.SILVER.ordinal());
        benefits.put("freeUpgrade", level.ordinal() >= LoyaltyLevel.GOLD.ordinal());
        benefits.put("personalManager", level.ordinal() >= LoyaltyLevel.PLATINUM.ordinal());
        benefits.put("vipEvents", level == LoyaltyLevel.DIAMOND);
        
        return benefits;
    }
    
    @Override
    public BigDecimal getLevelDiscount(Long userId) {
        LoyaltyPoints loyaltyPoints = getLoyaltyPointsByUserId(userId);
        String discountKey = loyaltyPoints.getLevel().name().toLowerCase() + "_discount";
        double discount = Double.parseDouble(getConfigValue(discountKey, "0"));
        return BigDecimal.valueOf(discount);
    }
    
    @Override
    public Page<PointTransaction> getTransactionHistory(Long userId, Pageable pageable) {
        return pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    @Override
    public List<PointTransaction> getRecentTransactions(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return pointTransactionRepository.findRecentTransactionsByUserId(userId, pageable);
    }
    
    @Override
    public void processExpiredPoints() {
        LocalDate today = LocalDate.now();
        List<PointTransaction> expiredTransactions = 
            pointTransactionRepository.findExpiredPoints(today);
        
        for (PointTransaction transaction : expiredTransactions) {
            Long userId = transaction.getUser().getId();
            Integer expiredPoints = transaction.getPoints();
            
            try {
                LoyaltyPoints loyaltyPoints = getLoyaltyPointsByUserId(userId);
                
                // Deduct expired points
                int newBalance = Math.max(0, loyaltyPoints.getPointsBalance() - expiredPoints);
                loyaltyPoints.setPointsBalance(newBalance);
                loyaltyPoints.setTotalExpired(loyaltyPoints.getTotalExpired() + expiredPoints);
                loyaltyPointsRepository.save(loyaltyPoints);
                
                // Mark transaction as expired
                transaction.setIsExpired(true);
                pointTransactionRepository.save(transaction);
                
                // Create expiry transaction record
                PointTransaction expiryRecord = new PointTransaction();
                expiryRecord.setUser(transaction.getUser());
                expiryRecord.setPoints(-expiredPoints);
                expiryRecord.setTransactionType(TransactionType.EXPIRED);
                expiryRecord.setSourceType(transaction.getSourceType());
                expiryRecord.setSourceId(transaction.getSourceId());
                expiryRecord.setDescription("Điểm hết hạn");
                expiryRecord.setBalanceBefore(loyaltyPoints.getPointsBalance() + expiredPoints);
                expiryRecord.setBalanceAfter(newBalance);
                pointTransactionRepository.save(expiryRecord);
                
                log.info("Expired {} points for user {}", expiredPoints, userId);
            } catch (Exception e) {
                log.error("Error processing expired points for user {}: {}", userId, e.getMessage());
            }
        }
    }
    
    @Override
    public Map<String, Object> getUserLoyaltyStats(Long userId) {
        LoyaltyPoints loyaltyPoints = getLoyaltyPointsByUserId(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("currentLevel", loyaltyPoints.getLevel().name());
        stats.put("pointsBalance", loyaltyPoints.getPointsBalance());
        stats.put("totalEarned", loyaltyPoints.getTotalEarned());
        stats.put("totalRedeemed", loyaltyPoints.getTotalRedeemed());
        stats.put("totalExpired", loyaltyPoints.getTotalExpired());
        
        // Calculate points to next level
        LoyaltyLevel nextLevel = getNextLevel(loyaltyPoints.getLevel());
        if (nextLevel != null) {
            int pointsToNext = getPointsForLevel(nextLevel) - loyaltyPoints.getTotalEarned();
            stats.put("pointsToNextLevel", Math.max(0, pointsToNext));
            stats.put("nextLevel", nextLevel.name());
        } else {
            stats.put("pointsToNextLevel", 0);
            stats.put("nextLevel", "MAX_LEVEL");
        }
        
        stats.put("benefits", getLevelBenefits(loyaltyPoints.getLevel()));
        
        return stats;
    }
    
    @Override
    public List<LoyaltyPoints> getTopUsersByPoints(int limit) {
        return loyaltyPointsRepository.findTopByPointsBalance();
    }
    
    // Helper methods
    
    private LoyaltyLevel calculateLevel(int totalPoints) {
        if (totalPoints >= getPointsForLevel(LoyaltyLevel.DIAMOND)) {
            return LoyaltyLevel.DIAMOND;
        } else if (totalPoints >= getPointsForLevel(LoyaltyLevel.PLATINUM)) {
            return LoyaltyLevel.PLATINUM;
        } else if (totalPoints >= getPointsForLevel(LoyaltyLevel.GOLD)) {
            return LoyaltyLevel.GOLD;
        } else if (totalPoints >= getPointsForLevel(LoyaltyLevel.SILVER)) {
            return LoyaltyLevel.SILVER;
        } else {
            return LoyaltyLevel.BRONZE;
        }
    }
    
    private int getPointsForLevel(LoyaltyLevel level) {
        return switch (level) {
            case BRONZE -> 0;
            case SILVER -> 5000;      // 5,000 điểm
            case GOLD -> 20000;       // 20,000 điểm  
            case PLATINUM -> 50000;   // 50,000 điểm
            case DIAMOND -> 100000;   // 100,000 điểm
        };
    }
    
    private LoyaltyLevel getNextLevel(LoyaltyLevel currentLevel) {
        return switch (currentLevel) {
            case BRONZE -> LoyaltyLevel.SILVER;
            case SILVER -> LoyaltyLevel.GOLD;
            case GOLD -> LoyaltyLevel.PLATINUM;
            case PLATINUM -> LoyaltyLevel.DIAMOND;
            case DIAMOND -> null; // Max level
        };
    }
    
    private String getConfigValue(String key, String defaultValue) {
        return loyaltyConfigRepository.getConfigValue(key).orElse(defaultValue);
    }
}

