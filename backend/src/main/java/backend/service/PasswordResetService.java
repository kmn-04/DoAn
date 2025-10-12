package backend.service;

import java.util.Set;

public interface PasswordResetService {
    
    /**
     * Save reset token for email
     */
    void saveResetToken(String email, String token);
    
    /**
     * Check if reset token exists and is valid
     */
    boolean isValidResetToken(String email, String token);
    
    /**
     * Delete reset token after successful password reset
     */
    void deleteResetToken(String email);
    
    /**
     * Clean up expired tokens
     */
    void cleanupExpiredTokens();
    
    /**
     * Get all active reset tokens (for debugging)
     */
    Set<String> getActiveTokens();
}
