package backend.service;

import backend.model.EmailVerification;
import backend.model.User;
import backend.repository.EmailVerificationRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.email.verification.expiration:15}")
    private int expirationMinutes;

    @Value("${app.email.verification.max-attempts:5}")
    private int maxAttempts;

    private final SecureRandom random = new SecureRandom();

    @Async
    @Transactional
    public void sendVerificationCode(String email) {
        // Kiểm tra user đã verified chưa
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getEmailVerified())) {
            throw new RuntimeException("Email đã được xác minh");
        }

        // Xóa các mã cũ của email này
        emailVerificationRepository.deleteByEmail(email);

        // Tạo mã mới
        String verificationCode = generateVerificationCode();
        EmailVerification verification = new EmailVerification(email, verificationCode);
        emailVerificationRepository.save(verification);

        // Gửi email
        try {
            emailService.sendVerificationEmail(email, verificationCode);
            System.out.println("Đã gửi mã xác minh " + verificationCode + " tới " + email);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
            throw new RuntimeException("Không thể gửi email xác minh", e);
        }
    }

    @Transactional
    public boolean verifyEmail(String email, String code) {
        Optional<EmailVerification> verificationOpt = 
            emailVerificationRepository.findByEmailAndVerificationCodeAndVerifiedFalse(email, code);

        if (verificationOpt.isEmpty()) {
            return false;
        }

        EmailVerification verification = verificationOpt.get();

        // Kiểm tra hết hạn
        if (verification.isExpired()) {
            return false;
        }

        // Kiểm tra số lần thử
        if (!verification.canAttempt()) {
            return false;
        }

        // Increment attempt count
        verification.incrementAttempt();

        // Nếu mã đúng
        if (verification.getVerificationCode().equals(code)) {
            verification.setVerified(true);
            emailVerificationRepository.save(verification);

            // Cập nhật user là đã verified
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setEmailVerified(true);
                userRepository.save(user);
            }

            // Xóa tất cả verification codes của email này
            emailVerificationRepository.deleteByEmail(email);
            return true;
        }

        emailVerificationRepository.save(verification);
        return false;
    }

    public boolean isEmailVerified(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getEmailVerified());
    }

    public boolean hasPendingVerification(String email) {
        return emailVerificationRepository.existsByEmailAndVerifiedFalse(email);
    }

    private String generateVerificationCode() {
        return String.format("%06d", random.nextInt(999999));
    }

    // Cleanup expired verifications every hour
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredVerifications() {
        emailVerificationRepository.deleteExpiredVerifications(LocalDateTime.now());
        System.out.println("Đã xóa các mã xác minh hết hạn lúc: " + LocalDateTime.now());
    }
}
