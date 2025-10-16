package backend.service.impl;

import backend.entity.EmailVerificationToken;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.EmailVerificationTokenRepository;
import backend.repository.UserRepository;
import backend.service.EmailService;
import backend.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {
    
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    private static final int TOKEN_EXPIRATION_HOURS = 24;
    
    @Override
    @Transactional
    public void sendVerificationEmail(User user) {
        log.info("Creating verification token for user: {}", user.getEmail());
        
        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiresAt(LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS));
        
        tokenRepository.save(verificationToken);
        
        // Send email
        emailService.sendVerificationEmail(user, token);
        
        log.info("Verification email sent to: {}", user.getEmail());
    }
    
    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        log.info("Verifying email with token: {}", token);
        
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token xác thực không hợp lệ"));
        
        // Check if already verified - this is OK, just notify user
        if (verificationToken.isVerified()) {
            User user = verificationToken.getUser();
            // Make sure user status is ACTIVE
            if (user.getStatus() != User.UserStatus.ACTIVE) {
                user.setStatus(User.UserStatus.ACTIVE);
                userRepository.save(user);
            }
            log.info("Email already verified for user: {} (verified at: {})", 
                    user.getEmail(), verificationToken.getVerifiedAt());
            return true; // Idempotent - return success
        }
        
        if (verificationToken.isExpired()) {
            throw new BadRequestException("Link xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email.");
        }
        
        // Mark token as verified
        verificationToken.setVerifiedAt(LocalDateTime.now());
        tokenRepository.save(verificationToken);
        
        // Update user
        User user = verificationToken.getUser();
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);
        
        log.info("Email verified successfully for user: {}", user.getEmail());
        return true;
    }
    
    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        log.info("Resending verification email to: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        if (user.getEmailVerifiedAt() != null) {
            throw new BadRequestException("Email already verified");
        }
        
        sendVerificationEmail(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isTokenValid(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.isExpired() && !t.isVerified())
                .orElse(false);
    }
}

