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
    void sendPromotionNotification(
        String promotionCode, 
        String promotionName, 
        String promotionType,
        java.math.BigDecimal discountValue,
        java.math.BigDecimal minOrderAmount,
        java.math.BigDecimal maxDiscount
    );
    
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
    
    // ==================== PRIORITY 1: BOOKING & CANCELLATION EMAILS ====================
    
    /**
     * Send payment success email
     */
    void sendPaymentSuccessEmail(String to, String bookingCode, String tourName, String amount, String paymentMethod);
    
    /**
     * Send cancellation request confirmation email
     */
    void sendCancellationRequestEmail(String to, String bookingCode, String tourName, String reason);
    
    /**
     * Send cancellation approved email
     */
    void sendCancellationApprovedEmail(String to, String bookingCode, String tourName, String refundAmount, String adminNotes);
    
    /**
     * Send cancellation rejected email
     */
    void sendCancellationRejectedEmail(String to, String bookingCode, String tourName, String rejectionReason);
    
    /**
     * Send refund completed email
     */
    void sendRefundCompletedEmail(String to, String bookingCode, String tourName, String refundAmount, String transactionId);
}
