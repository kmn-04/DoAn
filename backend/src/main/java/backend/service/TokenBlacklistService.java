package backend.service;

import backend.entity.BlacklistedToken;

public interface TokenBlacklistService {
    
    /**
     * Add token to blacklist
     */
    void blacklistToken(String token, String userEmail, String reason, String ipAddress);
    
    /**
     * Check if token is blacklisted
     */
    boolean isTokenBlacklisted(String token);
    
    /**
     * Delete expired tokens (cleanup job)
     */
    int deleteExpiredTokens();
}

