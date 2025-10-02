package backend.service;

import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import backend.entity.Booking.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingService {
    
    // ========== DTO Methods (for REST API) ==========
    
    /**
     * Get booking by ID (DTO version)
     */
    BookingResponse getBookingByIdDto(Long bookingId);
    
    /**
     * Get all bookings with pagination (DTO version)
     */
    Page<BookingResponse> getAllBookingsDto(Pageable pageable);
    
    /**
     * Get bookings by status (DTO version)
     */
    Page<BookingResponse> getBookingsByStatusDto(String status, Pageable pageable);
    
    /**
     * Update booking status (DTO version)
     */
    BookingResponse updateBookingStatus(Long bookingId, String status);
    
    /**
     * Update payment status (DTO version)
     */
    BookingResponse updatePaymentStatus(Long bookingId, String paymentStatus);
    
    /**
     * Admin cancel booking (DTO version)
     */
    BookingResponse adminCancelBooking(Long bookingId, String reason);
    
    /**
     * Search bookings (DTO version)
     */
    Page<BookingResponse> searchBookingsDto(String keyword, Pageable pageable);
    
    /**
     * Get total bookings count
     */
    long getTotalBookings();
    
    /**
     * Get booking count by status
     */
    long getBookingCountByStatus(String status);
    
    // ========== Entity Methods (LEGACY) ==========
    
    /**
     * Create new booking
     */
    Booking createBooking(Booking booking);
    
    /**
     * Update booking
     */
    Booking updateBooking(Long bookingId, Booking booking);
    
    /**
     * Get booking by ID
     */
    Optional<Booking> getBookingById(Long bookingId);
    
    /**
     * Get booking by booking code
     */
    Optional<Booking> getBookingByCode(String bookingCode);
    
    /**
     * Get bookings by user
     */
    List<Booking> getBookingsByUser(Long userId);
    
    /**
     * Get bookings by tour
     */
    List<Booking> getBookingsByTour(Long tourId);
    
    /**
     * Get bookings by status
     */
    List<Booking> getBookingsByStatus(BookingStatus status);
    
    /**
     * Search bookings
     */
    Page<Booking> searchBookings(String keyword, Pageable pageable);
    
    /**
     * Get all bookings with pagination
     */
    Page<Booking> getAllBookings(Pageable pageable);
    
    /**
     * Get all bookings without pagination
     */
    List<Booking> getAllBookings();
    
    /**
     * Confirm booking
     */
    Booking confirmBooking(Long bookingId);
    
    /**
     * Cancel booking
     */
    Booking cancelBooking(Long bookingId, String reason);
    
    /**
     * Mark booking as paid
     */
    Booking markAsPaid(Long bookingId);
    
    /**
     * Complete booking
     */
    Booking completeBooking(Long bookingId);
    
    /**
     * Calculate booking total price
     */
    BigDecimal calculateTotalPrice(Long tourId, Integer adults, Integer children, String promotionCode);
    
    /**
     * Check tour availability
     */
    boolean checkAvailability(Long tourId, LocalDate startDate, Integer totalPeople);
    
    /**
     * Generate unique booking code
     */
    String generateBookingCode();
    
    /**
     * Get upcoming bookings
     */
    List<Booking> getUpcomingBookings();
    
    /**
     * Get booking statistics
     */
    BookingStatistics getBookingStatistics();
    
    /**
     * Get revenue by date range
     */
    BigDecimal getRevenueByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Inner class for booking statistics
     */
    class BookingStatistics {
        private long totalBookings;
        private long pendingBookings;
        private long confirmedBookings;
        private long paidBookings;
        private long cancelledBookings;
        private long completedBookings;
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        
        public BookingStatistics(long totalBookings, long pendingBookings, long confirmedBookings,
                               long paidBookings, long cancelledBookings, long completedBookings,
                               BigDecimal totalRevenue, BigDecimal monthlyRevenue) {
            this.totalBookings = totalBookings;
            this.pendingBookings = pendingBookings;
            this.confirmedBookings = confirmedBookings;
            this.paidBookings = paidBookings;
            this.cancelledBookings = cancelledBookings;
            this.completedBookings = completedBookings;
            this.totalRevenue = totalRevenue;
            this.monthlyRevenue = monthlyRevenue;
        }
        
        // Getters
        public long getTotalBookings() { return totalBookings; }
        public long getPendingBookings() { return pendingBookings; }
        public long getConfirmedBookings() { return confirmedBookings; }
        public long getPaidBookings() { return paidBookings; }
        public long getCancelledBookings() { return cancelledBookings; }
        public long getCompletedBookings() { return completedBookings; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    }
}
