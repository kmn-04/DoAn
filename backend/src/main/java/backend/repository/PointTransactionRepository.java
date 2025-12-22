package backend.repository;

import backend.entity.PointTransaction;
import backend.entity.PointTransaction.SourceType;
import backend.entity.PointTransaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    
    /**
     * Find transactions by user ID with pagination
     */
    Page<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find transactions by user ID
     */
    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find transactions by transaction type
     */
    List<PointTransaction> findByTransactionType(TransactionType transactionType);
    
    /**
     * Find transactions by source type and source ID
     */
    List<PointTransaction> findBySourceTypeAndSourceId(SourceType sourceType, Long sourceId);
    
    /**
     * Find expired points that haven't been marked as expired
     */
    @Query("SELECT pt FROM PointTransaction pt WHERE pt.expiresAt <= :currentDate AND pt.isExpired = false AND pt.transactionType = 'EARNED'")
    List<PointTransaction> findExpiredPoints(@Param("currentDate") LocalDate currentDate);
    
    /**
     * Get total earned points by user
     */
    @Query("SELECT SUM(pt.points) FROM PointTransaction pt WHERE pt.user.id = :userId AND pt.transactionType = 'EARNED'")
    Integer getTotalEarnedByUserId(@Param("userId") Long userId);
    
    /**
     * Get total redeemed points by user
     */
    @Query("SELECT SUM(ABS(pt.points)) FROM PointTransaction pt WHERE pt.user.id = :userId AND pt.transactionType = 'REDEEMED'")
    Integer getTotalRedeemedByUserId(@Param("userId") Long userId);
    
    /**
     * Find transactions by date range
     */
    @Query("SELECT pt FROM PointTransaction pt WHERE pt.user.id = :userId AND pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    List<PointTransaction> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Sum earned points from a start date (rolling period)
     */
    @Query("""
        SELECT COALESCE(SUM(pt.points), 0)
        FROM PointTransaction pt
        WHERE pt.user.id = :userId
          AND pt.transactionType = 'EARNED'
          AND pt.createdAt >= :fromDate
    """)
    Integer sumEarnedSince(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDateTime fromDate
    );
    
    /**
     * Find recent transactions
     */
    @Query("SELECT pt FROM PointTransaction pt WHERE pt.user.id = :userId ORDER BY pt.createdAt DESC")
    List<PointTransaction> findRecentTransactionsByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Count transactions by user and type
     */
    Long countByUserIdAndTransactionType(Long userId, TransactionType transactionType);

    /**
     * Count transactions by type (all users)
     */
    Long countByTransactionType(TransactionType transactionType);

    /**
     * Find transactions by user ID and transaction type with pagination
     */
    Page<PointTransaction> findByUserIdAndTransactionTypeOrderByCreatedAtDesc(
        Long userId, TransactionType transactionType, Pageable pageable);

    /**
     * Get sum of all earned points (for stats)
     */
    @Query("SELECT SUM(pt.points) FROM PointTransaction pt WHERE pt.transactionType = 'EARNED'")
    Integer getTotalEarnedSum();

    /**
     * Get sum of all redeemed points (for stats) - using ABS for negative values
     */
    @Query("SELECT SUM(ABS(pt.points)) FROM PointTransaction pt WHERE pt.transactionType = 'REDEEMED'")
    Integer getTotalRedeemedSum();
}

