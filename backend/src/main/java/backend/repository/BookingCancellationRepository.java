package backend.repository;

import backend.entity.BookingCancellation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingCancellationRepository extends JpaRepository<BookingCancellation, Long> {

    // Find by booking
    Optional<BookingCancellation> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);

    // Find by user who cancelled - eager fetch booking and tour to avoid LazyInitializationException
    // Using separate query to handle cases where booking might be deleted
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.cancelledBy.id = :userId 
        AND bc.booking IS NOT NULL
        ORDER BY bc.createdAt DESC
        """)
    Page<BookingCancellation> findByCancelledByIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    // Find by status
    Page<BookingCancellation> findByStatusOrderByCreatedAtDesc(
            BookingCancellation.CancellationStatus status, 
            Pageable pageable
    );

    // Find by refund status
    Page<BookingCancellation> findByRefundStatusOrderByCreatedAtDesc(
            BookingCancellation.RefundStatus refundStatus, 
            Pageable pageable
    );

    // Find pending cancellations (for admin review)
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.status = 'PENDING'
        ORDER BY bc.createdAt ASC
        """)
    Page<BookingCancellation> findPendingCancellations(Pageable pageable);

    // Find cancellations requiring refund processing
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.status = 'APPROVED' 
        AND bc.refundStatus = 'PROCESSING'
        AND bc.finalRefundAmount > 0
        ORDER BY bc.processedAt ASC
        """)
    Page<BookingCancellation> findCancellationsAwaitingRefund(Pageable pageable);

    // Find emergency cancellations
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.isMedicalEmergency = true 
        OR bc.isWeatherRelated = true 
        OR bc.isForceMajeure = true
        ORDER BY bc.createdAt ASC
        """)
    Page<BookingCancellation> findEmergencyCancellations(Pageable pageable);

    // Search cancellations
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        LEFT JOIN bc.booking b 
        LEFT JOIN b.tour t 
        WHERE (LOWER(bc.reason) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(bc.additionalNotes) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        AND bc.booking IS NOT NULL
        ORDER BY bc.createdAt DESC
        """)
    Page<BookingCancellation> searchCancellations(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Find cancellations by date range
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.cancelledAt BETWEEN :startDate AND :endDate 
        ORDER BY bc.cancelledAt DESC
        """)
    Page<BookingCancellation> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // Find user's recent cancellations (for preventing abuse)
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.cancelledBy.id = :userId 
        AND bc.cancelledAt >= :sinceDate 
        ORDER BY bc.cancelledAt DESC
        """)
    List<BookingCancellation> findRecentCancellationsByUser(
            @Param("userId") Long userId,
            @Param("sinceDate") LocalDateTime sinceDate
    );

    // Statistics queries
    @Query("SELECT COUNT(bc) FROM BookingCancellation bc WHERE bc.status = :status")
    long countByStatus(@Param("status") BookingCancellation.CancellationStatus status);

    @Query("SELECT COUNT(bc) FROM BookingCancellation bc WHERE bc.refundStatus = :refundStatus")
    long countByRefundStatus(@Param("refundStatus") BookingCancellation.RefundStatus refundStatus);

    @Query("""
        SELECT COUNT(bc) FROM BookingCancellation bc 
        WHERE bc.cancelledAt BETWEEN :startDate AND :endDate
        """)
    long countByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
        SELECT SUM(bc.finalRefundAmount) FROM BookingCancellation bc 
        WHERE bc.refundStatus = 'COMPLETED'
        AND bc.refundProcessedAt BETWEEN :startDate AND :endDate
        """)
    BigDecimal getTotalRefundAmount(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
        SELECT bc.reasonCategory, COUNT(bc) FROM BookingCancellation bc 
        WHERE bc.cancelledAt BETWEEN :startDate AND :endDate 
        GROUP BY bc.reasonCategory
        ORDER BY COUNT(bc) DESC
        """)
    List<Object[]> getCancellationReasonStats(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Find cancellations by specific conditions
    List<BookingCancellation> findByReasonCategoryAndStatusOrderByCreatedAtDesc(
            BookingCancellation.CancellationReason reasonCategory,
            BookingCancellation.CancellationStatus status
    );

    // Find overdue cancellations (requested but not processed within timeframe)
    @Query("""
        SELECT bc FROM BookingCancellation bc 
        WHERE bc.status = 'REQUESTED' 
        AND bc.createdAt < :cutoffDate
        ORDER BY bc.createdAt ASC
        """)
    List<BookingCancellation> findOverdueCancellations(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Get user cancellation summary
    @Query("""
        SELECT COUNT(bc), SUM(bc.finalRefundAmount) FROM BookingCancellation bc 
        WHERE bc.cancelledBy.id = :userId
        AND bc.status = 'COMPLETED'
        """)
    Object[] getUserCancellationSummary(@Param("userId") Long userId);
}
