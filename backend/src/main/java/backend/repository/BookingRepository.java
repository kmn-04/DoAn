package backend.repository;

import backend.entity.Booking;
import backend.entity.Booking.BookingStatus;
import backend.entity.Booking.ConfirmationStatus;
import backend.entity.Booking.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    /**
     * Find booking by booking code
     */
    Optional<Booking> findByBookingCode(String bookingCode);
    
    /**
     * Find bookings by user ID
     */
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find bookings by user ID with pagination
     */
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find bookings by tour ID
     */
    List<Booking> findByTourId(Long tourId);
    
    /**
     * Find bookings by confirmation status
     */
    List<Booking> findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus confirmationStatus);
    
    /**
     * Find bookings by confirmation status with pagination
     */
    Page<Booking> findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus confirmationStatus, Pageable pageable);
    
    /**
     * Find bookings by payment status
     */
    List<Booking> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);
    
    /**
     * Find bookings by payment status with pagination
     */
    Page<Booking> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus, Pageable pageable);
    
    /**
     * Find bookings by user and confirmation status
     */
    List<Booking> findByUserIdAndConfirmationStatusOrderByCreatedAtDesc(Long userId, ConfirmationStatus confirmationStatus);
    
    /**
     * Find bookings by user and payment status
     */
    List<Booking> findByUserIdAndPaymentStatusOrderByCreatedAtDesc(Long userId, PaymentStatus paymentStatus);
    
    /**
     * Find bookings by date range
     */
    List<Booking> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find bookings created in date range
     */
    List<Booking> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * Search bookings by booking code or user email
     */
    @Query("SELECT b FROM Booking b JOIN b.user u WHERE " +
           "LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Booking> searchBookings(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Count bookings by tour and confirmation status
     */
    long countByTourIdAndConfirmationStatus(Long tourId, ConfirmationStatus confirmationStatus);
    
    /**
     * Count bookings by tour and payment status
     */
    long countByTourIdAndPaymentStatus(Long tourId, PaymentStatus paymentStatus);
    
    /**
     * Count bookings by user
     */
    long countByUserId(Long userId);
    
    /**
     * Find recent bookings
     */
    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findRecentBookings(Pageable pageable);
    
    /**
     * Calculate total revenue by payment status
     */
    @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE b.paymentStatus = :paymentStatus")
    BigDecimal calculateTotalRevenueByPaymentStatus(@Param("paymentStatus") PaymentStatus paymentStatus);
    
    /**
     * Find bookings with tour details
     */
    @Query("SELECT b FROM Booking b JOIN FETCH b.tour JOIN FETCH b.user WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithDetails(@Param("bookingId") Long bookingId);
    
    /**
     * Find upcoming bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.startDate >= :currentDate AND b.confirmationStatus IN :statuses")
    List<Booking> findUpcomingBookings(@Param("currentDate") LocalDate currentDate, 
                                      @Param("statuses") List<ConfirmationStatus> statuses);
    
    /**
     * Find bookings by promotion
     */
    List<Booking> findByPromotionId(Long promotionId);
    
    /**
     * Check if booking code exists
     */
    boolean existsByBookingCode(String bookingCode);
    
    /**
     * Count bookings by confirmation status
     */
    long countByConfirmationStatus(ConfirmationStatus confirmationStatus);
    
    /**
     * Get category IDs from user's booking history
     * Returns distinct category IDs ordered by booking count
     */
    @Query("SELECT DISTINCT t.category.id FROM Booking b " +
           "JOIN b.tour t " +
           "WHERE b.user.id = :userId " +
           "AND t.category.id IS NOT NULL " +
           "GROUP BY t.category.id " +
           "ORDER BY COUNT(b) DESC")
    List<Long> findCategoryIdsByUserId(@Param("userId") Long userId);
}
