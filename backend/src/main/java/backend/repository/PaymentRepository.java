package backend.repository;

import backend.entity.Payment;
import backend.entity.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Find payments by booking ID
     */
    List<Payment> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    
    /**
     * Find payment by transaction ID
     */
    Optional<Payment> findByTransactionId(String transactionId);
    
    /**
     * Find payments by status
     */
    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
    
    /**
     * Find payments by payment method
     */
    List<Payment> findByPaymentMethodOrderByCreatedAtDesc(String paymentMethod);
    
    /**
     * Find payments in date range
     */
    List<Payment> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * Calculate total amount by status
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal calculateTotalAmountByStatus(@Param("status") PaymentStatus status);
    
    /**
     * Calculate total amount by payment method
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentMethod = :paymentMethod AND p.status = :status")
    BigDecimal calculateTotalAmountByPaymentMethod(@Param("paymentMethod") String paymentMethod, 
                                                  @Param("status") PaymentStatus status);
    
    /**
     * Find successful payments for booking
     */
    List<Payment> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);
    
    /**
     * Count payments by status
     */
    long countByStatus(PaymentStatus status);
    
    /**
     * Find payments by user (through booking)
     */
    @Query("SELECT p FROM Payment p JOIN p.booking b WHERE b.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find recent payments
     */
    @Query("SELECT p FROM Payment p ORDER BY p.createdAt DESC")
    List<Payment> findRecentPayments(@Param("limit") int limit);
    
    /**
     * Check if transaction ID exists
     */
    boolean existsByTransactionId(String transactionId);
    
    /**
     * Find payment by ID with booking and all related details
     * Optimized to avoid N+1 queries when accessing booking -> tour -> user
     */
    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.tour t " +
           "LEFT JOIN FETCH b.user u " +
           "LEFT JOIN FETCH b.schedule s " +
           "LEFT JOIN FETCH b.promotion pr " +
           "WHERE p.id = :paymentId")
    Optional<Payment> findByIdWithBookingDetails(@Param("paymentId") Long paymentId);
}
