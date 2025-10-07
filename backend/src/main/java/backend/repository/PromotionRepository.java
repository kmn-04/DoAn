package backend.repository;

import backend.entity.Promotion;
import backend.entity.Promotion.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    /**
     * Find promotion by code
     */
    Optional<Promotion> findByCode(String code);
    
    /**
     * Find active promotions
     */
    List<Promotion> findByStatusOrderByCreatedAtDesc(PromotionStatus status);
    
    /**
     * Find valid promotions (active and within date range)
     */
    @Query("SELECT p FROM Promotion p WHERE " +
           "p.status = backend.entity.Promotion$PromotionStatus.Active AND " +
           "p.startDate <= :currentDate AND " +
           "p.endDate >= :currentDate")
    List<Promotion> findValidPromotions(@Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Find promotion by code if valid
     */
    @Query("SELECT p FROM Promotion p WHERE " +
           "p.code = :code AND " +
           "p.status = backend.entity.Promotion$PromotionStatus.Active AND " +
           "p.startDate <= :currentDate AND " +
           "p.endDate >= :currentDate")
    Optional<Promotion> findValidPromotionByCode(@Param("code") String code, 
                                                @Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Find expired promotions
     */
    @Query("SELECT p FROM Promotion p WHERE p.endDate < :currentDate AND p.status != backend.entity.Promotion$PromotionStatus.Expired")
    List<Promotion> findExpiredPromotions(@Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Find promotions by type
     */
    List<Promotion> findByTypeAndStatusOrderByCreatedAtDesc(Promotion.PromotionType type, PromotionStatus status);
    
    /**
     * Check if promotion code exists
     */
    boolean existsByCode(String code);
    
    /**
     * Count usage of promotion
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.promotion.id = :promotionId")
    long countUsageByPromotionId(@Param("promotionId") Long promotionId);
    
    /**
     * Find promotions with usage count
     */
    @Query("SELECT p, COUNT(b) FROM Promotion p LEFT JOIN p.bookings b " +
           "WHERE p.status = :status GROUP BY p ORDER BY p.createdAt DESC")
    List<Object[]> findPromotionsWithUsageCount(@Param("status") PromotionStatus status);
    
    /**
     * Find promotions by date range
     */
    List<Promotion> findByStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
