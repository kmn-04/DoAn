package backend.repository;

import backend.entity.Referral;
import backend.entity.Referral.ReferralStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {
    
    /**
     * Find referral by code
     */
    Optional<Referral> findByReferralCode(String referralCode);
    
    /**
     * Find referrals by referrer ID
     */
    List<Referral> findByReferrerIdOrderByCreatedAtDesc(Long referrerId);
    
    /**
     * Find referrals by referee ID
     */
    Optional<Referral> findByRefereeId(Long refereeId);
    
    /**
     * Find referrals by status
     */
    List<Referral> findByStatus(ReferralStatus status);
    
    /**
     * Count successful referrals by referrer
     */
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrer.id = :referrerId AND r.status = 'COMPLETED'")
    Long countSuccessfulReferralsByReferrerId(@Param("referrerId") Long referrerId);
    
    /**
     * Get total points earned from referrals by user
     */
    @Query("SELECT SUM(r.pointsEarned) FROM Referral r WHERE r.referrer.id = :userId AND r.status = 'COMPLETED'")
    Integer getTotalPointsEarnedFromReferrals(@Param("userId") Long userId);
    
    /**
     * Check if user was referred
     */
    boolean existsByRefereeId(Long refereeId);
    
    /**
     * Check if referral code exists
     */
    boolean existsByReferralCode(String referralCode);
    
    /**
     * Find pending referrals for user
     */
    @Query("SELECT r FROM Referral r WHERE r.referrer.id = :userId AND r.status = 'PENDING'")
    List<Referral> findPendingReferralsByUserId(@Param("userId") Long userId);
}

