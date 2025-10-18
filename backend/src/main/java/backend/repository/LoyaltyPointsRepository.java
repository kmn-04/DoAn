package backend.repository;

import backend.entity.LoyaltyPoints;
import backend.entity.LoyaltyPoints.LoyaltyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyPointsRepository extends JpaRepository<LoyaltyPoints, Long> {
    
    /**
     * Find loyalty points by user ID
     */
    Optional<LoyaltyPoints> findByUserId(Long userId);
    
    /**
     * Find loyalty points by user email
     */
    @Query("SELECT lp FROM LoyaltyPoints lp JOIN lp.user u WHERE u.email = :email")
    Optional<LoyaltyPoints> findByUserEmail(@Param("email") String email);
    
    /**
     * Find all users by loyalty level
     */
    List<LoyaltyPoints> findByLevel(LoyaltyLevel level);
    
    /**
     * Find users with points balance greater than threshold
     */
    @Query("SELECT lp FROM LoyaltyPoints lp WHERE lp.pointsBalance >= :minPoints")
    List<LoyaltyPoints> findByPointsBalanceGreaterThanEqual(@Param("minPoints") Integer minPoints);
    
    /**
     * Find top N users by points balance
     */
    @Query("SELECT lp FROM LoyaltyPoints lp ORDER BY lp.pointsBalance DESC")
    List<LoyaltyPoints> findTopByPointsBalance();
    
    /**
     * Count users by loyalty level
     */
    Long countByLevel(LoyaltyLevel level);
    
    /**
     * Get total points in system
     */
    @Query("SELECT SUM(lp.pointsBalance) FROM LoyaltyPoints lp")
    Long getTotalPointsInSystem();
    
    /**
     * Get average points per user
     */
    @Query("SELECT AVG(lp.pointsBalance) FROM LoyaltyPoints lp")
    Double getAveragePointsPerUser();
    
    /**
     * Check if user has loyalty points record
     */
    boolean existsByUserId(Long userId);
}

