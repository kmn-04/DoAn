package backend.service.impl;

import backend.entity.RefreshToken;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.RefreshTokenRepository;
import backend.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    
    @Value("${app.jwt.refreshExpirationMs:2592000000}") // 30 days default
    private Long refreshTokenDurationMs;
    
    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user, String ipAddress, String userAgent) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000));
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setUserAgent(userAgent);
        refreshToken.setRevoked(false);
        
        refreshToken = refreshTokenRepository.save(refreshToken);
        
        log.info("Created refresh token for user: {}", user.getEmail());
        return refreshToken;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
    
    @Override
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isRevoked()) {
            log.warn("Refresh token is revoked: {}", token.getToken());
            throw new BadRequestException("Refresh token is revoked. Please login again.");
        }
        
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            log.warn("Refresh token expired: {}", token.getToken());
            throw new BadRequestException("Refresh token expired. Please login again.");
        }
        
        // Update last used timestamp
        token.updateLastUsed();
        refreshTokenRepository.save(token);
        
        return token;
    }
    
    @Override
    @Transactional
    public void revokeToken(String token, String reason) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", "token", token));
        
        refreshToken.revoke(reason);
        refreshTokenRepository.save(refreshToken);
        
        log.info("Revoked refresh token: {} - Reason: {}", token, reason);
    }
    
    @Override
    @Transactional
    public void revokeAllUserTokens(User user, String reason) {
        int revokedCount = refreshTokenRepository.revokeAllUserTokens(
                user, 
                LocalDateTime.now(), 
                reason
        );
        
        log.info("Revoked {} refresh tokens for user: {} - Reason: {}", 
                revokedCount, user.getEmail(), reason);
    }
    
    @Override
    @Transactional
    public int deleteExpiredTokens() {
        int deletedCount = refreshTokenRepository.deleteExpiredAndRevokedTokens(LocalDateTime.now());
        log.info("Deleted {} expired/revoked refresh tokens", deletedCount);
        return deletedCount;
    }
    
    @Override
    @Transactional
    public RefreshToken rotateRefreshToken(String oldToken, String ipAddress, String userAgent) {
        RefreshToken oldRefreshToken = refreshTokenRepository.findByToken(oldToken)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", "token", oldToken));
        
        // Verify old token is still valid
        verifyExpiration(oldRefreshToken);
        
        // Revoke old token
        oldRefreshToken.revoke("Token rotated");
        refreshTokenRepository.save(oldRefreshToken);
        
        // Create new token
        RefreshToken newRefreshToken = createRefreshToken(
                oldRefreshToken.getUser(), 
                ipAddress, 
                userAgent
        );
        
        log.info("Rotated refresh token for user: {}", oldRefreshToken.getUser().getEmail());
        return newRefreshToken;
    }
}

