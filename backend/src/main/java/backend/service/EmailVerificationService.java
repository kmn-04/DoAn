package backend.service;

import backend.entity.User;

public interface EmailVerificationService {
    
    /**
     * Create and send verification email
     */
    void sendVerificationEmail(User user);
    
    /**
     * Verify email with token
     */
    boolean verifyEmail(String token);
    
    /**
     * Resend verification email
     */
    void resendVerificationEmail(String email);
    
    /**
     * Check if token is valid
     */
    boolean isTokenValid(String token);
}

