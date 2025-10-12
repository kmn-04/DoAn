package backend.service.impl;

import backend.service.PasswordResetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {
    
    // In-memory storage for reset tokens
    // In production, this should be Redis or database
    private final Map<String, String> resetTokens = new ConcurrentHashMap<>();
    
    @Override
    public void saveResetToken(String email, String token) {
        resetTokens.put(email, token);
        log.info("Saved reset token for email: {}", email);
    }
    
    @Override
    public boolean isValidResetToken(String email, String token) {
        String storedToken = resetTokens.get(email);
        boolean isValid = storedToken != null && storedToken.equals(token);
        
        if (isValid) {
            log.info("Reset token validated for email: {}", email);
        } else {
            log.warn("Invalid reset token for email: {}", email);
        }
        
        return isValid;
    }
    
    @Override
    public void deleteResetToken(String email) {
        String removedToken = resetTokens.remove(email);
        if (removedToken != null) {
            log.info("Deleted reset token for email: {}", email);
        } else {
            log.warn("No reset token found for email: {}", email);
        }
    }
    
    @Override
    public void cleanupExpiredTokens() {
        // In production, implement token expiry logic
        // For now, we rely on JWT expiry
        log.info("Token cleanup completed. Active tokens: {}", resetTokens.size());
    }
    
    @Override
    public Set<String> getActiveTokens() {
        return new HashSet<>(resetTokens.keySet());
    }
}
