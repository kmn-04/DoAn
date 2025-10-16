package backend.service.impl;

import backend.entity.BlacklistedToken;
import backend.repository.BlacklistedTokenRepository;
import backend.security.JwtUtils;
import backend.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistServiceImpl implements TokenBlacklistService {
    
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtUtils jwtUtils;
    
    @Override
    @Transactional
    public void blacklistToken(String token, String userEmail, String reason, String ipAddress) {
        // Check if already blacklisted
        if (blacklistedTokenRepository.existsByToken(token)) {
            log.debug("Token already blacklisted: {}", token.substring(0, Math.min(20, token.length())));
            return;
        }
        
        // Get token expiration date
        LocalDateTime expiresAt;
        try {
            Date expirationDate = jwtUtils.getExpirationDateFromToken(token);
            expiresAt = expirationDate.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (Exception e) {
            log.warn("Could not get expiration from token, using default 24 hours: {}", e.getMessage());
            expiresAt = LocalDateTime.now().plusHours(24);
        }
        
        // Create blacklisted token
        BlacklistedToken blacklistedToken = new BlacklistedToken(
                token,
                userEmail,
                expiresAt,
                reason,
                ipAddress
        );
        
        blacklistedTokenRepository.save(blacklistedToken);
        
        log.info("Token blacklisted for user: {} - Reason: {}", userEmail, reason);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }
    
    @Override
    @Transactional
    public int deleteExpiredTokens() {
        int deletedCount = blacklistedTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Deleted {} expired blacklisted tokens", deletedCount);
        return deletedCount;
    }
}

