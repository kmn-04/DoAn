package backend.repository;

import backend.entity.LoyaltyLevelHistory;
import backend.entity.LoyaltyPoints.LoyaltyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoyaltyLevelHistoryRepository extends JpaRepository<LoyaltyLevelHistory, Long> {
    
    /**
     * Find level history by user ID
     */
    List<LoyaltyLevelHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find level history by new level
     */
    List<LoyaltyLevelHistory> findByNewLevel(LoyaltyLevel newLevel);
    
    /**
     * Find recent level changes
     */
    @Query("SELECT llh FROM LoyaltyLevelHistory llh WHERE llh.createdAt >= :startDate ORDER BY llh.createdAt DESC")
    List<LoyaltyLevelHistory> findRecentLevelChanges(@Param("startDate") LocalDateTime startDate);
    
    /**
     * Count level changes by user
     */
    Long countByUserId(Long userId);
    
    /**
     * Get latest level change for user
     */
    @Query("SELECT llh FROM LoyaltyLevelHistory llh WHERE llh.user.id = :userId ORDER BY llh.createdAt DESC")
    List<LoyaltyLevelHistory> findLatestByUserId(@Param("userId") Long userId);
}

