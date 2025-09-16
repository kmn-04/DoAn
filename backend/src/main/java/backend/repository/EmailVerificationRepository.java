package backend.repository;

import backend.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    
    Optional<EmailVerification> findByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);
    
    Optional<EmailVerification> findByEmailAndVerificationCodeAndVerifiedFalse(String email, String verificationCode);
    
    @Modifying
    @Query("DELETE FROM EmailVerification e WHERE e.expiresAt < :now")
    void deleteExpiredVerifications(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM EmailVerification e WHERE e.email = :email")
    void deleteByEmail(@Param("email") String email);
    
    boolean existsByEmailAndVerifiedFalse(String email);
}
