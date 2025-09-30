package backend.service.impl;

import backend.entity.Booking;
import backend.entity.Booking.BookingStatus;
import backend.entity.Booking.ConfirmationStatus;
import backend.entity.Booking.PaymentStatus;
import backend.entity.Promotion;
import backend.entity.Tour;
import backend.repository.BookingRepository;
import backend.repository.PromotionRepository;
import backend.repository.TourRepository;
import backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final PromotionRepository promotionRepository;
    
    @Override
    public Booking createBooking(Booking booking) {
        log.info("Creating new booking for tour: {}", booking.getTour().getId());
        
        // Validate tour availability
        if (!checkAvailability(booking.getTour().getId(), booking.getStartDate(), booking.getTotalPeople())) {
            throw new RuntimeException("Tour not available for selected date and number of people");
        }
        
        // Generate booking code if not provided
        if (booking.getBookingCode() == null || booking.getBookingCode().isEmpty()) {
            booking.setBookingCode(generateBookingCode());
        }
        
        // Set default status
        if (booking.getConfirmationStatus() == null) {
            booking.setConfirmationStatus(ConfirmationStatus.Pending);
        }
        if (booking.getPaymentStatus() == null) {
            booking.setPaymentStatus(PaymentStatus.Unpaid);
        }
        
        // Calculate total price if not set
        if (booking.getTotalPrice() == null) {
            BigDecimal totalPrice = calculateBookingPrice(booking);
            booking.setTotalPrice(totalPrice);
        }
        
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with ID: {} and code: {}", 
                savedBooking.getId(), savedBooking.getBookingCode());
        return savedBooking;
    }
    
    private BigDecimal calculateBookingPrice(Booking booking) {
        Tour tour = booking.getTour();
        BigDecimal basePrice = tour.getEffectivePrice();
        
        // Calculate price for adults and children
        BigDecimal adultPrice = basePrice.multiply(BigDecimal.valueOf(booking.getNumAdults()));
        BigDecimal childPrice = basePrice.multiply(BigDecimal.valueOf(0.7)) // 30% discount for children
                                        .multiply(BigDecimal.valueOf(booking.getNumChildren()));
        
        BigDecimal totalPrice = adultPrice.add(childPrice);
        
        // Apply promotion if exists
        if (booking.getPromotion() != null) {
            totalPrice = applyPromotion(totalPrice, booking.getPromotion());
        }
        
        return totalPrice;
    }
    
    private BigDecimal applyPromotion(BigDecimal totalPrice, Promotion promotion) {
        if (promotion.getType() == Promotion.PromotionType.Percentage) {
            BigDecimal discount = totalPrice.multiply(promotion.getValue().divide(BigDecimal.valueOf(100)));
            return totalPrice.subtract(discount);
        } else {
            return totalPrice.subtract(promotion.getValue());
        }
    }
    
    @Override
    public Booking updateBooking(Long bookingId, Booking booking) {
        log.info("Updating booking with ID: {}", bookingId);
        
        Booking existingBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        // Update allowed fields
        if (booking.getSpecialRequests() != null) {
            existingBooking.setSpecialRequests(booking.getSpecialRequests());
        }
        if (booking.getContactPhone() != null) {
            existingBooking.setContactPhone(booking.getContactPhone());
        }
        
        Booking updatedBooking = bookingRepository.save(existingBooking);
        log.info("Booking updated successfully with ID: {}", updatedBooking.getId());
        return updatedBooking;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Booking> getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Booking> getBookingByCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByTour(Long tourId) {
        return bookingRepository.findByTourId(tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        // Note: This method is deprecated. Use getBookingsByConfirmationStatus or getBookingsByPaymentStatus
        // For backwards compatibility, map to confirmation status
        ConfirmationStatus confirmationStatus = mapToConfirmationStatus(status);
        return bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(confirmationStatus);
    }
    
    private ConfirmationStatus mapToConfirmationStatus(BookingStatus status) {
        return switch (status) {
            case Pending -> ConfirmationStatus.Pending;
            case Confirmed, Paid -> ConfirmationStatus.Confirmed;
            case Cancelled -> ConfirmationStatus.Cancelled;
            case Completed -> ConfirmationStatus.Completed;
            case CancellationRequested -> ConfirmationStatus.CancellationRequested;
            default -> ConfirmationStatus.Pending;
        };
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Booking> searchBookings(String keyword, Pageable pageable) {
        return bookingRepository.searchBookings(keyword, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Booking> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    @Override
    public Booking confirmBooking(Long bookingId) {
        log.info("Confirming booking with ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getConfirmationStatus() != ConfirmationStatus.Pending) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }
        
        booking.setConfirmationStatus(ConfirmationStatus.Confirmed);
        Booking confirmedBooking = bookingRepository.save(booking);
        
        log.info("Booking confirmed successfully with ID: {}", bookingId);
        return confirmedBooking;
    }
    
    @Override
    public Booking cancelBooking(Long bookingId, String reason) {
        log.info("Cancelling booking with ID: {} with reason: {}", bookingId, reason);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getConfirmationStatus() == ConfirmationStatus.Completed || booking.getConfirmationStatus() == ConfirmationStatus.Cancelled) {
            throw new RuntimeException("Cannot cancel booking with status: " + booking.getConfirmationStatus());
        }
        
        booking.setConfirmationStatus(ConfirmationStatus.Cancelled);
        if (reason != null) {
            booking.setSpecialRequests(booking.getSpecialRequests() + " | Cancelled: " + reason);
        }
        
        Booking cancelledBooking = bookingRepository.save(booking);
        log.info("Booking cancelled successfully with ID: {}", bookingId);
        return cancelledBooking;
    }
    
    @Override
    public Booking markAsPaid(Long bookingId) {
        log.info("Marking booking as paid with ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        booking.setPaymentStatus(PaymentStatus.Paid);
        Booking paidBooking = bookingRepository.save(booking);
        
        log.info("Booking marked as paid successfully with ID: {}", bookingId);
        return paidBooking;
    }
    
    @Override
    public Booking completeBooking(Long bookingId) {
        log.info("Completing booking with ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getPaymentStatus() != PaymentStatus.Paid) {
            throw new RuntimeException("Only paid bookings can be completed");
        }
        
        booking.setConfirmationStatus(ConfirmationStatus.Completed);
        Booking completedBooking = bookingRepository.save(booking);
        
        log.info("Booking completed successfully with ID: {}", bookingId);
        return completedBooking;
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalPrice(Long tourId, Integer adults, Integer children, String promotionCode) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        BigDecimal basePrice = tour.getEffectivePrice();
        BigDecimal adultPrice = basePrice.multiply(BigDecimal.valueOf(adults));
        BigDecimal childPrice = basePrice.multiply(BigDecimal.valueOf(0.7))
                                        .multiply(BigDecimal.valueOf(children));
        
        BigDecimal totalPrice = adultPrice.add(childPrice);
        
        // Apply promotion if provided
        if (promotionCode != null && !promotionCode.isEmpty()) {
            Optional<Promotion> promotion = promotionRepository.findValidPromotionByCode(
                    promotionCode, LocalDateTime.now());
            if (promotion.isPresent()) {
                totalPrice = applyPromotion(totalPrice, promotion.get());
            }
        }
        
        return totalPrice;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long tourId, LocalDate startDate, Integer totalPeople) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        // Check if tour is active
        if (tour.getStatus() != Tour.TourStatus.Active || tour.isDeleted()) {
            return false;
        }
        
        // Check if requested people count exceeds tour capacity
        if (totalPeople > tour.getMaxPeople()) {
            return false;
        }
        
        // Check existing bookings for the same date
        List<Booking> existingBookings = bookingRepository.findByStartDateBetween(startDate, startDate);
        int bookedPeople = existingBookings.stream()
                .filter(booking -> booking.getTour().getId().equals(tourId))
                .filter(booking -> booking.getConfirmationStatus() == ConfirmationStatus.Confirmed || 
                                 booking.getPaymentStatus() == PaymentStatus.Paid)
                .mapToInt(Booking::getTotalPeople)
                .sum();
        
        return (bookedPeople + totalPeople) <= tour.getMaxPeople();
    }
    
    @Override
    public String generateBookingCode() {
        String prefix = "BK";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomSuffix = String.valueOf((int) (Math.random() * 1000));
        
        String bookingCode = prefix + timestamp.substring(timestamp.length() - 8) + randomSuffix;
        
        // Ensure uniqueness
        while (bookingRepository.existsByBookingCode(bookingCode)) {
            randomSuffix = String.valueOf((int) (Math.random() * 1000));
            bookingCode = prefix + timestamp.substring(timestamp.length() - 8) + randomSuffix;
        }
        
        return bookingCode;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> getUpcomingBookings() {
        LocalDate today = LocalDate.now();
        List<ConfirmationStatus> activeStatuses = List.of(
                ConfirmationStatus.Confirmed, ConfirmationStatus.Completed);
        return bookingRepository.findUpcomingBookings(today, activeStatuses);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BookingStatistics getBookingStatistics() {
        long totalBookings = bookingRepository.count();
        // Count by confirmation status
        long pendingBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.Pending).size();
        long confirmedBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.Confirmed).size();
        long cancelledBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.Cancelled).size();
        long completedBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.Completed).size();
        // Count by payment status
        long paidBookings = bookingRepository.findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus.Paid).size();
        
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenueByPaymentStatus(PaymentStatus.Paid);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        // Calculate monthly revenue
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1);
        List<Booking> monthlyBookings = bookingRepository.findByCreatedAtBetween(startOfMonth, endOfMonth);
        BigDecimal monthlyRevenue = monthlyBookings.stream()
                .filter(booking -> booking.getPaymentStatus() == PaymentStatus.Paid)
                .map(Booking::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new BookingStatistics(totalBookings, pendingBookings, confirmedBookings,
                paidBookings, cancelledBookings, completedBookings, totalRevenue, monthlyRevenue);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal getRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<Booking> bookings = bookingRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        return bookings.stream()
                .filter(booking -> booking.getPaymentStatus() == PaymentStatus.Paid)
                .map(Booking::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
