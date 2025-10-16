package backend.repository;

import backend.entity.EmailVerificationToken;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByUserAndVerifiedAtIsNull(User user);
    
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
    
    void deleteByUser(User user);
}

