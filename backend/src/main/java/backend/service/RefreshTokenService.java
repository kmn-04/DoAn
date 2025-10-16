package backend.service;

import backend.entity.RefreshToken;
import backend.entity.User;

import java.util.Optional;

public interface RefreshTokenService {
    
    /**
     * Create a new refresh token for user
     */
    RefreshToken createRefreshToken(User user, String ipAddress, String userAgent);
    
    /**
     * Find refresh token by token string
     */
    Optional<RefreshToken> findByToken(String token);
    
    /**
     * Verify and validate refresh token
     */
    RefreshToken verifyExpiration(RefreshToken token);
    
    /**
     * Revoke a refresh token
     */
    void revokeToken(String token, String reason);
    
    /**
     * Revoke all tokens for a user
     */
    void revokeAllUserTokens(User user, String reason);
    
    /**
     * Delete expired and revoked tokens (cleanup)
     */
    int deleteExpiredTokens();
    
    /**
     * Rotate refresh token (revoke old, create new)
     */
    RefreshToken rotateRefreshToken(String oldToken, String ipAddress, String userAgent);
}

