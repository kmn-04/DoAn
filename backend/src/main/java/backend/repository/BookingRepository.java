package backend.repository;

import backend.entity.Booking;
import backend.entity.Booking.BookingStatus;
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
     * Find bookings by tour ID
     */
    List<Booking> findByTourId(Long tourId);
    
    /**
     * Find bookings by status
     */
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    
    /**
     * Find bookings by user and status
     */
    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, BookingStatus status);
    
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
     * Count bookings by tour and status
     */
    long countByTourIdAndStatus(Long tourId, BookingStatus status);
    
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
     * Calculate total revenue by status
     */
    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = :status")
    BigDecimal calculateTotalRevenueByStatus(@Param("status") BookingStatus status);
    
    /**
     * Find bookings with tour details
     */
    @Query("SELECT b FROM Booking b JOIN FETCH b.tour JOIN FETCH b.user WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithDetails(@Param("bookingId") Long bookingId);
    
    /**
     * Find upcoming bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.startDate >= :currentDate AND b.status IN :statuses")
    List<Booking> findUpcomingBookings(@Param("currentDate") LocalDate currentDate, 
                                      @Param("statuses") List<BookingStatus> statuses);
    
    /**
     * Find bookings by promotion
     */
    List<Booking> findByPromotionId(Long promotionId);
    
    /**
     * Check if booking code exists
     */
    boolean existsByBookingCode(String bookingCode);
}
