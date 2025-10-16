package backend.repository;

import backend.entity.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    
    /**
     * Check if token exists in blacklist
     */
    boolean existsByToken(String token);
    
    /**
     * Find blacklisted token by token string
     */
    Optional<BlacklistedToken> findByToken(String token);
    
    /**
     * Delete expired tokens (cleanup)
     */
    @Modifying
    @Query("DELETE FROM BlacklistedToken bt WHERE bt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * Count blacklisted tokens for a user
     */
    long countByUserEmail(String userEmail);
}

