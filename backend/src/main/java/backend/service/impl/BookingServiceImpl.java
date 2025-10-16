package backend.service.impl;

import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import backend.entity.Booking.BookingStatus;
import backend.entity.Booking.ConfirmationStatus;
import backend.entity.Booking.PaymentStatus;
import backend.entity.BookingCancellation;
import backend.entity.Notification;
import backend.entity.Promotion;
import backend.entity.Tour;
import backend.exception.BadRequestException;
import backend.mapper.BookingMapper;
import backend.repository.BookingCancellationRepository;
import backend.repository.BookingRepository;
import backend.repository.PromotionRepository;
import backend.repository.TourRepository;
import backend.service.BookingService;
import backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final BookingCancellationRepository cancellationRepository;
    private final TourRepository tourRepository;
    private final PromotionRepository promotionRepository;
    private final BookingMapper bookingMapper;
    private final NotificationService notificationService;
    
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
            booking.setConfirmationStatus(ConfirmationStatus.PENDING);
        }
        if (booking.getPaymentStatus() == null) {
            booking.setPaymentStatus(PaymentStatus.UNPAID);
        }
        
        // Calculate total price if not set
        if (booking.getTotalPrice() == null) {
            BigDecimal totalPrice = calculateBookingPrice(booking);
            booking.setTotalPrice(totalPrice);
        }
        
        // Set final amount (same as total price if no discount)
        if (booking.getFinalAmount() == null) {
            booking.setFinalAmount(booking.getTotalPrice());
        }
        
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with ID: {} and code: {}", 
                savedBooking.getId(), savedBooking.getBookingCode());
        
        // Send success notification
        sendBookingCreatedNotification(savedBooking);
        
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
        if (promotion.getType() == Promotion.PromotionType.PERCENTAGE) {
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
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        
        // Force initialization of lazy-loaded relationships to avoid LazyInitializationException
        booking.ifPresent(b -> {
            if (b.getTour() != null) {
                b.getTour().getName(); // Force load
            }
            if (b.getUser() != null) {
                b.getUser().getName(); // Force load
            }
            if (b.getSchedule() != null) {
                b.getSchedule().getDepartureDate(); // Force load schedule
            }
        });
        
        return booking;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Booking> getBookingByCode(String bookingCode) {
        Optional<Booking> booking = bookingRepository.findByBookingCode(bookingCode);
        
        // Force initialization of lazy-loaded relationships to avoid LazyInitializationException
        booking.ifPresent(b -> {
            if (b.getTour() != null) {
                b.getTour().getName(); // Force load
            }
            if (b.getUser() != null) {
                b.getUser().getName(); // Force load
            }
            if (b.getSchedule() != null) {
                b.getSchedule().getDepartureDate(); // Force load schedule
            }
        });
        
        return booking;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByUser(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Force initialization of lazy-loaded relationships to avoid LazyInitializationException
        bookings.forEach(booking -> {
            if (booking.getTour() != null) {
                booking.getTour().getName(); // Force load tour
                
                // Force load itineraries and their partners
                try {
                    if (booking.getTour().getItineraries() != null) {
                        booking.getTour().getItineraries().size(); // Force load itineraries
                        booking.getTour().getItineraries().forEach(itinerary -> {
                            // Force load partners for each itinerary
                            try {
                                if (itinerary.getAccommodationPartner() != null) {
                                    itinerary.getAccommodationPartner().getName();
                                }
                            } catch (Exception e) {
                                log.debug("Could not load accommodation partner: {}", e.getMessage());
                            }
                            try {
                                if (itinerary.getMealsPartner() != null) {
                                    itinerary.getMealsPartner().getName();
                                }
                            } catch (Exception e) {
                                log.debug("Could not load meals partner: {}", e.getMessage());
                            }
                        });
                    }
                } catch (Exception e) {
                    log.debug("Could not load itineraries: {}", e.getMessage());
                }
            }
            if (booking.getUser() != null) {
                booking.getUser().getName(); // Force load user
            }
            if (booking.getSchedule() != null) {
                booking.getSchedule().getDepartureDate(); // Force load schedule
            }
        });
        
        return bookings;
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
            case PENDING -> ConfirmationStatus.PENDING;
            case CONFIRMED, PAID -> ConfirmationStatus.CONFIRMED;
            case CANCELLED -> ConfirmationStatus.CANCELLED;
            case COMPLETED -> ConfirmationStatus.COMPLETED;
            case CANCELLATION_REQUESTED -> ConfirmationStatus.CANCELLATION_REQUESTED;
            default -> ConfirmationStatus.PENDING;
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
        List<Booking> bookings = bookingRepository.findAll();
        
        // Force initialization of lazy-loaded relationships to avoid LazyInitializationException
        bookings.forEach(booking -> {
            if (booking.getTour() != null) {
                booking.getTour().getName(); // Force load
            }
            if (booking.getUser() != null) {
                booking.getUser().getName(); // Force load
            }
            if (booking.getSchedule() != null) {
                booking.getSchedule().getDepartureDate(); // Force load schedule
            }
        });
        
        return bookings;
    }
    
    @Override
    public Booking confirmBooking(Long bookingId) {
        log.info("Confirming booking with ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getConfirmationStatus() != ConfirmationStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }
        
        booking.setConfirmationStatus(ConfirmationStatus.CONFIRMED);
        Booking confirmedBooking = bookingRepository.save(booking);
        
        // Send confirmation notification
        sendBookingConfirmedNotification(confirmedBooking);
        
        log.info("Booking confirmed successfully with ID: {}", bookingId);
        return confirmedBooking;
    }
    
    @Override
    public Booking cancelBooking(Long bookingId, String reason) {
        log.info("Cancelling booking with ID: {} with reason: {}", bookingId, reason);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getConfirmationStatus() == ConfirmationStatus.COMPLETED || booking.getConfirmationStatus() == ConfirmationStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel booking with status: " + booking.getConfirmationStatus());
        }
        
        booking.setConfirmationStatus(ConfirmationStatus.CANCELLED);
        if (reason != null) {
            booking.setSpecialRequests(booking.getSpecialRequests() + " | Cancelled: " + reason);
        }
        
        Booking cancelledBooking = bookingRepository.save(booking);
        
        // Send cancellation notification (Warning)
        sendBookingCancelledNotification(cancelledBooking, reason);
        
        log.info("Booking cancelled successfully with ID: {}", bookingId);
        return cancelledBooking;
    }
    
    @Override
    public Booking markAsPaid(Long bookingId) {
        log.info("Marking booking as paid with ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        booking.setPaymentStatus(PaymentStatus.PAID);
        Booking paidBooking = bookingRepository.save(booking);
        
        log.info("Booking marked as paid successfully with ID: {}", bookingId);
        return paidBooking;
    }
    
    @Override
    public Booking completeBooking(Long bookingId) {
        log.info("Completing booking with ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Only paid bookings can be completed");
        }
        
        booking.setConfirmationStatus(ConfirmationStatus.COMPLETED);
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
        if (tour.getStatus() != Tour.TourStatus.ACTIVE || tour.isDeleted()) {
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
                .filter(booking -> booking.getConfirmationStatus() == ConfirmationStatus.CONFIRMED || 
                                 booking.getPaymentStatus() == PaymentStatus.PAID)
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
                ConfirmationStatus.CONFIRMED, ConfirmationStatus.COMPLETED);
        return bookingRepository.findUpcomingBookings(today, activeStatuses);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BookingStatistics getBookingStatistics() {
        long totalBookings = bookingRepository.count();
        // Count by confirmation status
        long pendingBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.PENDING).size();
        long confirmedBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.CONFIRMED).size();
        long cancelledBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.CANCELLED).size();
        long completedBookings = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(ConfirmationStatus.COMPLETED).size();
        // Count by payment status
        long paidBookings = bookingRepository.findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus.PAID).size();
        
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenueByPaymentStatus(PaymentStatus.PAID);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        // Calculate monthly revenue
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1);
        List<Booking> monthlyBookings = bookingRepository.findByCreatedAtBetween(startOfMonth, endOfMonth);
        BigDecimal monthlyRevenue = monthlyBookings.stream()
                .filter(booking -> booking.getPaymentStatus() == PaymentStatus.PAID)
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
                .filter(booking -> booking.getPaymentStatus() == PaymentStatus.PAID)
                .map(Booking::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // ========== NEW DTO METHODS ==========
    
    @Override
    public BookingResponse getBookingByIdDto(Long bookingId) {
        log.info("Getting booking by ID (DTO): {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    public Page<BookingResponse> getAllBookingsDto(Pageable pageable) {
        log.info("Getting all bookings (DTO) with pagination");
        
        Page<Booking> bookings = bookingRepository.findAll(pageable);
        
        return bookings.map(bookingMapper::toResponse);
    }
    
    @Override
    public Page<BookingResponse> getBookingsByStatusDto(String status, Pageable pageable) {
        log.info("Getting bookings by status (DTO): {}", status);
        
        ConfirmationStatus confirmationStatus = ConfirmationStatus.valueOf(status.toUpperCase());
        // Get list and convert to Page manually
        List<Booking> bookingList = bookingRepository.findByConfirmationStatusOrderByCreatedAtDesc(confirmationStatus);
        
        // Simple pagination - just return all as one page for now
        // TODO: Implement proper pagination in repository
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), bookingList.size());
        List<Booking> pageContent = bookingList.subList(start, end);
        
        Page<Booking> bookings = new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, bookingList.size());
        
        return bookings.map(bookingMapper::toResponse);
    }
    
    @Override
    public BookingResponse updateBookingStatus(Long bookingId, String status) {
        log.info("Updating booking status for ID: {}, new status: {}", bookingId, status);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        ConfirmationStatus oldStatus = booking.getConfirmationStatus();
        ConfirmationStatus newStatus = ConfirmationStatus.valueOf(status.toUpperCase());
        
        // Admin cannot manually set status to CancellationRequested
        // This status should only be set by user cancellation request
        if (newStatus == ConfirmationStatus.CANCELLATION_REQUESTED) {
            throw new BadRequestException("Cannot manually set status to CancellationRequested. Use cancellation request API instead.");
        }
        
        // Handle status transitions
        if (oldStatus == ConfirmationStatus.CANCELLATION_REQUESTED) {
            if (newStatus == ConfirmationStatus.CANCELLED) {
                // Changing from CancellationRequested to Cancelled = approving the cancellation
                // This should be done through the cancellation approval API, not here
                throw new BadRequestException("Please approve the cancellation request through the Cancellation Management page");
            } else if (newStatus != ConfirmationStatus.CANCELLATION_REQUESTED) {
                // Changing from CancellationRequested to other status (Pending/Confirmed) = rejecting cancellation
                log.info("Booking status changing from CancellationRequested to {}, auto-rejecting cancellation", newStatus);
                
                Optional<BookingCancellation> cancellation = cancellationRepository.findByBookingId(bookingId);
                if (cancellation.isPresent() && 
                    cancellation.get().getStatus() != BookingCancellation.CancellationStatus.REJECTED) {
                    
                    BookingCancellation bc = cancellation.get();
                    bc.setStatus(BookingCancellation.CancellationStatus.REJECTED);
                    bc.setAdminNotes("Auto-rejected: Booking status restored by admin");
                    bc.setProcessedAt(LocalDateTime.now());
                    cancellationRepository.save(bc);
                    
                    log.info("✅ Auto-rejected cancellation request ID: {}", bc.getId());
                }
            }
        } else if (newStatus == ConfirmationStatus.CANCELLED) {
            // Admin directly cancelling a booking (without cancellation request)
            // This is allowed but should create a cancellation record for audit trail
            log.info("Admin directly cancelling booking {}", bookingId);
            // Note: No cancellation record needed for direct admin cancellation
            // The booking status change itself is the audit trail
        }
        
        booking.setConfirmationStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updated = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(updated);
    }
    
    @Override
    public BookingResponse updatePaymentStatus(Long bookingId, String paymentStatus) {
        log.info("Updating payment status for ID: {}, new status: {}", bookingId, paymentStatus);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        PaymentStatus newPaymentStatus = PaymentStatus.valueOf(paymentStatus.toUpperCase());
        PaymentStatus oldPaymentStatus = booking.getPaymentStatus();
        
        booking.setPaymentStatus(newPaymentStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updated = bookingRepository.save(booking);
        
        // Sync refundStatus in BookingCancellation when payment status changes to REFUNDED
        if (newPaymentStatus == PaymentStatus.REFUNDED && oldPaymentStatus != PaymentStatus.REFUNDED) {
            cancellationRepository.findByBookingId(bookingId).ifPresent(cancellation -> {
                if (cancellation.getStatus() == BookingCancellation.CancellationStatus.APPROVED) {
                    cancellation.setRefundStatus(BookingCancellation.RefundStatus.COMPLETED);
                    cancellation.setRefundProcessedAt(LocalDateTime.now());
                    cancellationRepository.save(cancellation);
                    log.info("✅ Auto-updated cancellation {} refundStatus to COMPLETED", cancellation.getId());
                }
            });
        }
        
        return bookingMapper.toResponse(updated);
    }
    
    @Override
    public BookingResponse adminCancelBooking(Long bookingId, String reason) {
        log.info("Admin cancelling booking ID: {}, reason: {}", bookingId, reason);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        booking.setConfirmationStatus(ConfirmationStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        // TODO: Set cancelledBy from security context
        
        Booking updated = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(updated);
    }
    
    @Override
    public Page<BookingResponse> searchBookingsDto(String keyword, Pageable pageable) {
        log.info("Searching bookings (DTO) with keyword: {}", keyword);
        
        Page<Booking> bookings = bookingRepository.searchBookings(keyword, pageable);
        
        return bookings.map(bookingMapper::toResponse);
    }
    
    @Override
    public long getTotalBookings() {
        return bookingRepository.count();
    }
    
    @Override
    public long getBookingCountByStatus(String status) {
        try {
            ConfirmationStatus confirmationStatus = ConfirmationStatus.valueOf(status.toUpperCase());
            return bookingRepository.countByConfirmationStatus(confirmationStatus);
        } catch (IllegalArgumentException e) {
            log.error("Invalid booking status: {}", status);
            return 0;
        }
    }
    
    // ==================== NOTIFICATION HELPERS ====================
    
    /**
     * Send notification when booking is created successfully
     */
    private void sendBookingCreatedNotification(Booking booking) {
        try {
            String title = "Đặt tour thành công";
            String message = String.format(
                "Bạn đã đặt tour '%s' thành công! Mã đặt tour: %s. Vui lòng thanh toán trước %s.",
                booking.getTour().getName(),
                booking.getBookingCode(),
                booking.getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
            );
            String link = "/bookings/" + booking.getId();
            
            notificationService.createNotificationForUser(
                booking.getUser().getId(),
                title,
                message,
                Notification.NotificationType.SUCCESS,
                link
            );
            
            log.info("Sent booking created notification for booking ID: {}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send booking created notification", e);
        }
    }
    
    /**
     * Send notification when booking is confirmed by admin
     */
    private void sendBookingConfirmedNotification(Booking booking) {
        try {
            String title = "Booking đã được xác nhận";
            String message = String.format(
                "Booking %s của bạn đã được xác nhận. Tour '%s' sẽ khởi hành vào %s. Chuẩn bị hành lý và giấy tờ cần thiết!",
                booking.getBookingCode(),
                booking.getTour().getName(),
                booking.getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
            );
            String link = "/bookings/" + booking.getId();
            
            notificationService.createNotificationForUser(
                booking.getUser().getId(),
                title,
                message,
                Notification.NotificationType.SUCCESS,
                link
            );
            
            log.info("Sent booking confirmed notification for booking ID: {}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send booking confirmed notification", e);
        }
    }
    
    /**
     * Send notification when booking is cancelled
     */
    private void sendBookingCancelledNotification(Booking booking, String reason) {
        try {
            String title = "Booking đã bị hủy";
            String message = String.format(
                "Booking %s của bạn cho tour '%s' đã bị hủy. %s",
                booking.getBookingCode(),
                booking.getTour().getName(),
                reason != null ? "Lý do: " + reason : "Vui lòng liên hệ để biết thêm chi tiết."
            );
            String link = "/bookings/" + booking.getId();
            
            notificationService.createNotificationForUser(
                booking.getUser().getId(),
                title,
                message,
                Notification.NotificationType.WARNING,
                link
            );
            
            log.info("Sent booking cancelled notification for booking ID: {}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send booking cancelled notification", e);
        }
    }
}
