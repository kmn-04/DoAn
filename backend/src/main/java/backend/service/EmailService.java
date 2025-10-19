package backend.service;

import backend.entity.User;

public interface EmailService {
    
    /**
     * Send welcome email to new newsletter subscriber
     */
    void sendNewsletterWelcomeEmail(String to, String subscriberEmail);
    
    /**
     * Send new tour notification to all active subscribers
     */
    void sendNewTourNotification(Long tourId, String tourName, String tourSlug);
    
    /**
     * Send promotion notification to all active subscribers
     */
    void sendPromotionNotification(String promotionCode, String promotionName, Integer discountPercent);
    
    /**
     * Send booking confirmation email
     */
    void sendBookingConfirmation(String to, String bookingCode, String tourName);
    
    /**
     * Send password reset email
     */
    void sendPasswordResetEmail(User user, String resetToken);
    
    /**
     * Send verification email
     */
    void sendVerificationEmail(User user, String verificationToken);
    
    /**
     * Send simple email
     */
    void sendSimpleEmail(String to, String subject, String content);
    
    /**
     * Send points earned email (loyalty)
     */
    void sendPointsEarnedEmail(User user, Integer points, String tourName, String transactionType);
    
    /**
     * Send level up email (loyalty)
     */
    void sendLevelUpEmail(User user, String oldLevel, String newLevel, Integer totalPoints);
    
    /**
     * Send voucher redeemed email
     */
    void sendVoucherRedeemedEmail(User user, String voucherCode, Integer pointsUsed, double discountAmount);
}
