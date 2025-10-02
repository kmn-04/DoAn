package backend.service;

import backend.entity.Booking;
import backend.entity.User;

public interface EmailService {
    
    /**
     * Send booking confirmation email
     */
    void sendBookingConfirmationEmail(Booking booking);
    
    /**
     * Send payment confirmation email
     */
    void sendPaymentConfirmationEmail(Booking booking);
    
    /**
     * Send booking cancellation email
     */
    void sendBookingCancellationEmail(Booking booking, String reason);
    
    /**
     * Send booking reminder email (before tour starts)
     */
    void sendBookingReminderEmail(Booking booking);
    
    /**
     * Send password reset email
     */
    void sendPasswordResetEmail(User user, String resetToken);
    
    /**
     * Send welcome email
     */
    void sendWelcomeEmail(User user);
    
    /**
     * Send generic email
     */
    void sendEmail(String to, String subject, String body);
    
    /**
     * Send HTML email
     */
    void sendHtmlEmail(String to, String subject, String htmlBody);
    
    /**
     * Send simple text email
     */
    void sendSimpleEmail(String to, String subject, String body);
}

