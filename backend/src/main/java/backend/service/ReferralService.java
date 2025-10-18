package backend.service;

import backend.entity.Referral;

import java.util.List;

public interface ReferralService {
    
    /**
     * Generate referral code for user
     */
    String generateReferralCode(Long userId);
    
    /**
     * Get user's referral code
     */
    String getUserReferralCode(Long userId);
    
    /**
     * Apply referral code during registration
     */
    Referral applyReferralCode(String referralCode, Long newUserId);
    
    /**
     * Complete referral when referee makes first booking
     */
    void completeReferral(Long refereeId, Long bookingId);
    
    /**
     * Get referrals by referrer
     */
    List<Referral> getReferralsByReferrer(Long referrerId);
    
    /**
     * Get referral statistics
     */
    java.util.Map<String, Object> getReferralStats(Long userId);
    
    /**
     * Check if user was referred
     */
    boolean wasUserReferred(Long userId);
}

