package backend.repository;

import backend.entity.BookingModification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingModificationRepository extends JpaRepository<BookingModification, Long> {

    /**
     * Find modifications by booking ID
     */
    List<BookingModification> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    /**
     * Find modifications by user ID (who requested)
     */
    Page<BookingModification> findByRequestedByIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find modifications by status
     */
    List<BookingModification> findByStatusOrderByCreatedAtDesc(BookingModification.Status status);
    
    /**
     * Find modifications by status with pagination
     */
    Page<BookingModification> findByStatusOrderByCreatedAtDesc(BookingModification.Status status, Pageable pageable);

    /**
     * Find pending modifications (for admin review)
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.status IN ('REQUESTED', 'UNDER_REVIEW') ORDER BY bm.createdAt ASC")
    List<BookingModification> findPendingModifications();

    /**
     * Find modifications requiring processing (approved but not completed)
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.status = 'APPROVED' ORDER BY bm.approvedAt ASC")
    List<BookingModification> findModificationsRequiringProcessing();

    /**
     * Find modifications by booking code
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.booking.bookingCode = :bookingCode ORDER BY bm.createdAt DESC")
    List<BookingModification> findByBookingCode(@Param("bookingCode") String bookingCode);

    /**
     * Find modifications by type
     */
    List<BookingModification> findByModificationTypeOrderByCreatedAtDesc(BookingModification.ModificationType type);

    /**
     * Check if booking has pending modification
     */
    @Query("SELECT COUNT(bm) > 0 FROM BookingModification bm WHERE bm.booking.id = :bookingId AND bm.status IN ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING')")
    boolean hasActivePendingModification(@Param("bookingId") Long bookingId);

    /**
     * Find recent modifications for user
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.requestedBy.id = :userId AND bm.createdAt > :since ORDER BY bm.createdAt DESC")
    List<BookingModification> findRecentByUser(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    /**
     * Find modifications processed by admin
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.processedBy = :adminId ORDER BY bm.processedAt DESC")
    List<BookingModification> findByProcessedBy(@Param("adminId") Long adminId);

    /**
     * Count modifications by status
     */
    @Query("SELECT bm.status, COUNT(bm) FROM BookingModification bm GROUP BY bm.status")
    List<Object[]> countByStatus();

    /**
     * Count modifications by type
     */
    @Query("SELECT bm.modificationType, COUNT(bm) FROM BookingModification bm GROUP BY bm.modificationType")
    List<Object[]> countByType();

    /**
     * Get modification statistics
     */
    @Query("SELECT " +
           "COUNT(bm) as total, " +
           "COUNT(CASE WHEN bm.status = 'COMPLETED' THEN 1 END) as completed, " +
           "COUNT(CASE WHEN bm.status = 'REJECTED' THEN 1 END) as rejected, " +
           "AVG(CASE WHEN bm.completedAt IS NOT NULL THEN TIMESTAMPDIFF(HOUR, bm.createdAt, bm.completedAt) END) as avgProcessingHours " +
           "FROM BookingModification bm")
    Object[] getModificationStatistics();

    /**
     * Find modifications requiring additional payment
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.priceDifference > 0 AND bm.status = 'APPROVED' ORDER BY bm.approvedAt ASC")
    List<BookingModification> findRequiringAdditionalPayment();

    /**
     * Find modifications offering refunds
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.priceDifference < 0 AND bm.status = 'APPROVED' ORDER BY bm.approvedAt ASC")
    List<BookingModification> findOfferingRefunds();

    /**
     * Find modifications by date range
     */
    @Query("SELECT bm FROM BookingModification bm WHERE bm.createdAt BETWEEN :startDate AND :endDate ORDER BY bm.createdAt DESC")
    List<BookingModification> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find modifications by booking and user
     */
    Optional<BookingModification> findByIdAndRequestedById(Long modificationId, Long userId);

    /**
     * Find modification by ID and booking ID
     */
    Optional<BookingModification> findByIdAndBookingId(Long modificationId, Long bookingId);
}
