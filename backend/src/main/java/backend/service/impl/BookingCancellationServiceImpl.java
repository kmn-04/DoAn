package backend.service.impl;

import backend.dto.request.BookingCancellationRequest;
import backend.dto.response.BookingCancellationResponse;
import backend.entity.*;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.*;
import backend.service.BookingCancellationService;
import backend.service.NotificationService;
import backend.mapper.EntityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingCancellationServiceImpl implements BookingCancellationService {

    private final BookingCancellationRepository cancellationRepository;
    private final CancellationPolicyRepository policyRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Override
    public BookingCancellationResponse requestCancellation(BookingCancellationRequest request, Long userId) {
        log.info("Processing cancellation request for booking {} by user {}", request.getBookingId(), userId);

        // Validate booking exists and belongs to user
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        // Temporarily disabled for testing - TODO: Fix user relationship
        // if (!booking.getUser().getId().equals(userId)) {
        //     throw new BadRequestException("You can only cancel your own bookings");
        // }

        // Check if booking can be cancelled
        if (!canUserCancelBooking(request.getBookingId(), userId)) {
            throw new BadRequestException("This booking cannot be cancelled");
        }

        // Check if already has an active cancellation request (not rejected)
        Optional<BookingCancellation> existingCancellation = cancellationRepository.findByBookingId(request.getBookingId());
        BookingCancellation cancellation;
        boolean isReattempt = false;
        
        if (existingCancellation.isPresent()) {
            BookingCancellation.CancellationStatus cancellationStatus = existingCancellation.get().getStatus();
            // Allow new cancellation only if previous one was rejected
            if (cancellationStatus != BookingCancellation.CancellationStatus.REJECTED) {
                throw new BadRequestException("Cancellation request already exists for this booking");
            }
            // Reuse the existing REJECTED record instead of creating new one
            cancellation = existingCancellation.get();
            isReattempt = true;
            log.info("♻️ Reusing existing REJECTED cancellation record {} for re-attempt", cancellation.getId());
        } else {
            // Create new cancellation record
            cancellation = new BookingCancellation();
            cancellation.setBooking(booking);
            log.info("🆕 Creating new cancellation record for booking {}", booking.getId());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Find applicable cancellation policy  
        CancellationPolicy policy = findApplicablePolicy(booking);
        
        // Save policy if it's a new default policy and has created_by
        if (policy.getId() == null && policy.getCreatedBy() != null) {
            policy = policyRepository.save(policy);
        }
        
        // Calculate timing and refund using policy logic
        LocalDateTime now = LocalDateTime.now();
        int hoursBeforeDeparture = (int) ChronoUnit.HOURS.between(now, booking.getStartDate().atStartOfDay());
        
        CancellationEvaluation evaluation = new CancellationEvaluation();
        evaluation.hoursBeforeDeparture = hoursBeforeDeparture;
        evaluation.policyName = policy.getName();
        
        // Check eligibility using policy
        evaluation.isEligible = policy.isCancellationAllowed(hoursBeforeDeparture);
        evaluation.reason = evaluation.isEligible ? "Cancellation allowed according to policy" : "Cancellation request is outside the allowed timeframe";
        
        if (evaluation.isEligible) {
            BigDecimal originalAmount = booking.getTotalPrice();
            BigDecimal refundPercentage = policy.getRefundPercentage(hoursBeforeDeparture);
            evaluation.estimatedRefund = originalAmount.multiply(refundPercentage).divide(new BigDecimal("100"));
            evaluation.cancellationFee = policy.getCancellationFee() != null ? policy.getCancellationFee() : BigDecimal.ZERO;
            evaluation.processingFee = policy.getProcessingFee() != null ? policy.getProcessingFee() : BigDecimal.ZERO;
            evaluation.finalRefundAmount = policy.calculateRefundAmount(originalAmount, hoursBeforeDeparture);
        } else {
            evaluation.estimatedRefund = BigDecimal.ZERO;
            evaluation.cancellationFee = BigDecimal.ZERO;
            evaluation.processingFee = BigDecimal.ZERO;
            evaluation.finalRefundAmount = BigDecimal.ZERO;
        }
        
        log.info("Direct evaluation calculated: {}", evaluation);
        
        if (!evaluation.isEligible) {
            throw new BadRequestException("Cancellation not allowed: " + evaluation.reason);
        }

        // Update cancellation record (whether new or reused)
        cancellation.setCancelledBy(user);
        cancellation.setRequestedBy(user); // Set the requested_by field
        // Set the saved policy (required by database constraint)
        cancellation.setCancellationPolicy(policy);
        cancellation.setReason(request.getReason());
        cancellation.setReasonCategory(request.getReasonCategory());
        cancellation.setDetailedReason(request.getAdditionalNotes()); // Map additionalNotes to detailedReason
        cancellation.setAdditionalNotes(request.getAdditionalNotes());
        
        // Save previous booking status for auto-restore on reject
        cancellation.setPreviousBookingStatus(booking.getConfirmationStatus());
        
        // Financial calculations
        cancellation.setOriginalAmount(booking.getTotalPrice());
        cancellation.setRefundPercentage(evaluation.estimatedRefund.divide(booking.getTotalPrice(), 2, RoundingMode.HALF_UP).multiply(new BigDecimal("100")));
        cancellation.setRefundAmount(evaluation.estimatedRefund);
        cancellation.setCancellationFee(evaluation.cancellationFee);
        cancellation.setProcessingFee(evaluation.processingFee);
        cancellation.setFinalRefundAmount(evaluation.finalRefundAmount);
        
        // Timing information
        cancellation.setHoursBeforeDeparture(evaluation.hoursBeforeDeparture);
        cancellation.setDepartureDate(booking.getStartDate().atStartOfDay());
        cancellation.setCancelledAt(LocalDateTime.now());
        
        // Special circumstances
        cancellation.setIsMedicalEmergency(request.getIsMedicalEmergency());
        cancellation.setIsWeatherRelated(request.getIsWeatherRelated());
        cancellation.setIsForceMajeure(request.getIsForceMajeure());
        
        if (request.getSupportingDocuments() != null && !request.getSupportingDocuments().isEmpty()) {
            cancellation.setSupportingDocuments(String.join(",", request.getSupportingDocuments()));
        }

        // Set status back to PENDING (for both new and reattempt)
        cancellation.setStatus(BookingCancellation.CancellationStatus.PENDING);

        // Update booking confirmation status
        booking.setConfirmationStatus(Booking.ConfirmationStatus.CANCELLATION_REQUESTED);
        bookingRepository.save(booking);

        // Save cancellation
        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Cancellation request created with ID: {}", savedCancellation.getId());
        
        // 🔔 Send notification to ADMIN about new cancellation request
        try {
            String tourName = booking.getTour() != null ? booking.getTour().getName() : "Tour";
            String bookingCode = booking.getBookingCode();
            String userName = user.getName() != null ? user.getName() : user.getEmail();
            
            String adminMessage = String.format(
                "Khách hàng '%s' yêu cầu hủy tour '%s' (Booking: %s). " +
                "Lý do: %s. Vui lòng xử lý trong vòng 24h.",
                userName,
                tourName,
                bookingCode,
                request.getReason() != null ? request.getReason() : "Không nêu rõ"
            );
            
            notificationService.createNotificationForAdmins(
                "🔔 Yêu cầu hủy tour mới",
                adminMessage,
                Notification.NotificationType.WARNING,
                "/admin/cancellations"
            );
            
            log.info("📧 Sent new cancellation notification to admins");
        } catch (Exception e) {
            log.error("Failed to send admin notification: {}", e.getMessage());
        }
        
        return mapToResponse(savedCancellation);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingCancellationResponse getCancellationById(Long cancellationId) {
        BookingCancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "id", cancellationId));
        return mapToResponse(cancellation);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingCancellationResponse getCancellationByBookingId(Long bookingId) {
        BookingCancellation cancellation = cancellationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "bookingId", bookingId));
        return mapToResponse(cancellation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getUserCancellations(Long userId, Pageable pageable) {
        Page<BookingCancellation> cancellations = cancellationRepository.findByCancelledByIdOrderByCreatedAtDesc(userId, pageable);
        
        // Eagerly fetch the booking and tour relationships to avoid LazyInitializationException
        cancellations.forEach(cancellation -> {
            try {
                if (cancellation.getBooking() != null) {
                    // Force initialization of lazy-loaded relationships
                    cancellation.getBooking().getBookingCode();
                    if (cancellation.getBooking().getTour() != null) {
                        cancellation.getBooking().getTour().getName();
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to load booking details for cancellation {}: {}", 
                        cancellation.getId(), e.getMessage());
            }
        });
        
        return cancellations.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canUserCancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        log.info("🔍 Checking if booking {} can be cancelled by user {}", bookingId, userId);
        log.info("  Booking confirmationStatus: {}", booking.getConfirmationStatus());
        log.info("  Booking paymentStatus: {}", booking.getPaymentStatus());
        log.info("  Booking startDate: {}", booking.getStartDate());

        // Temporarily disabled for testing - TODO: Fix user relationship  
        // Check ownership
        // if (!booking.getUser().getId().equals(userId)) {
        //     return false;
        // }

        // Check booking status
        if (booking.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED || 
            booking.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED ||
            booking.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLATION_REQUESTED) {
            log.warn("❌ Booking status is {}, cannot cancel", booking.getConfirmationStatus());
            return false;
        }

        // Check if already has an active cancellation request (not rejected)
        Optional<BookingCancellation> existingCancellation = cancellationRepository.findByBookingId(bookingId);
        if (existingCancellation.isPresent()) {
            BookingCancellation.CancellationStatus cancellationStatus = existingCancellation.get().getStatus();
            log.info("  Existing cancellation found with status: {}", cancellationStatus);
            // Allow new cancellation if previous one was rejected
            if (cancellationStatus != BookingCancellation.CancellationStatus.REJECTED) {
                log.warn("❌ Active cancellation exists with status {}, cannot cancel", cancellationStatus);
                return false;
            } else {
                log.info("  Previous cancellation was rejected, allowing new cancellation");
            }
        }

        // Check timing constraints
        LocalDateTime now = LocalDateTime.now();
        long hoursBeforeDeparture = ChronoUnit.HOURS.between(now, booking.getStartDate().atStartOfDay());
        log.info("  Hours before departure: {}", hoursBeforeDeparture);
        
        CancellationPolicy policy = findApplicablePolicy(booking);
        log.info("  Applicable policy: {}", policy.getName());
        boolean allowed = policy.isCancellationAllowed((int) hoursBeforeDeparture);
        log.info("  Policy allows cancellation: {}", allowed);
        
        if (!allowed) {
            log.warn("❌ Cancellation not allowed according to policy");
        }
        
        return allowed;
    }

    @Override
    public BookingCancellationResponse approveCancellation(Long cancellationId, Long adminId, String adminNotes) {
        BookingCancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "id", cancellationId));

        if (!cancellation.canBeProcessed()) {
            throw new BadRequestException("Cancellation cannot be processed in current status: " + cancellation.getStatus());
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        cancellation.markAsApproved(admin, adminNotes);

        // Update booking confirmation status
        Booking booking = cancellation.getBooking();
        booking.setConfirmationStatus(Booking.ConfirmationStatus.CANCELLED);
        bookingRepository.save(booking);

        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Cancellation {} approved by admin {}", cancellationId, adminId);
        
        // 🔔 Send notification to user
        try {
            Long userId = cancellation.getCancelledBy().getId();
            String tourName = booking.getTour() != null ? booking.getTour().getName() : "Tour";
            String bookingCode = booking.getBookingCode();
            
            String message = String.format(
                "Yêu cầu hủy tour '%s' (Mã booking: %s) đã được phê duyệt. " +
                "Số tiền hoàn lại: %s đ. Chúng tôi sẽ xử lý hoàn tiền trong vòng 5-7 ngày làm việc.",
                tourName, 
                bookingCode,
                savedCancellation.getFinalRefundAmount() != null 
                    ? String.format("%,.0f", savedCancellation.getFinalRefundAmount()) 
                    : "0"
            );
            
            notificationService.createNotificationForUser(
                userId,
                "✅ Yêu cầu hủy tour đã được phê duyệt",
                message,
                Notification.NotificationType.SUCCESS,
                "/dashboard/cancellations"
            );
            
            log.info("📧 Sent approval notification to user {}", userId);
        } catch (Exception e) {
            log.error("Failed to send approval notification: {}", e.getMessage());
        }
        
        return mapToResponse(savedCancellation);
    }

    @Override
    public BookingCancellationResponse rejectCancellation(Long cancellationId, Long adminId, String adminNotes) {
        BookingCancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "id", cancellationId));

        if (!cancellation.canBeProcessed()) {
            throw new BadRequestException("Cancellation cannot be processed in current status: " + cancellation.getStatus());
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        cancellation.markAsRejected(admin, adminNotes);

        // Auto-restore booking to previous status
        Booking booking = cancellation.getBooking();
        Booking.ConfirmationStatus restoreStatus = cancellation.getPreviousBookingStatus() != null 
            ? cancellation.getPreviousBookingStatus() 
            : Booking.ConfirmationStatus.CONFIRMED; // Fallback to Confirmed if null
            
        booking.setConfirmationStatus(restoreStatus);
        bookingRepository.save(booking);
        
        log.info("✅ Auto-restored booking {} from CancellationRequested to {}", booking.getId(), restoreStatus);

        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Cancellation {} rejected by admin {}", cancellationId, adminId);
        
        // 🔔 Send notification to user
        try {
            Long userId = cancellation.getCancelledBy().getId();
            String tourName = booking.getTour() != null ? booking.getTour().getName() : "Tour";
            String bookingCode = booking.getBookingCode();
            
            String message = String.format(
                "Yêu cầu hủy tour '%s' (Mã booking: %s) đã bị từ chối. " +
                "Booking của bạn vẫn còn hiệu lực. %s",
                tourName, 
                bookingCode,
                adminNotes != null && !adminNotes.isEmpty() 
                    ? "Lý do: " + adminNotes 
                    : "Vui lòng liên hệ bộ phận hỗ trợ nếu có thắc mắc."
            );
            
            notificationService.createNotificationForUser(
                userId,
                "❌ Yêu cầu hủy tour bị từ chối",
                message,
                Notification.NotificationType.WARNING,
                "/dashboard/bookings"
            );
            
            log.info("📧 Sent rejection notification to user {}", userId);
        } catch (Exception e) {
            log.error("Failed to send rejection notification: {}", e.getMessage());
        }
        
        return mapToResponse(savedCancellation);
    }

    @Override
    public BookingCancellationResponse updateRefundStatus(Long cancellationId, String refundStatus) {
        log.info("🔄 Updating refund status for cancellation {} to {}", cancellationId, refundStatus);
        
        BookingCancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "id", cancellationId));

        // Validate that cancellation is APPROVED before updating refund status
        if (cancellation.getStatus() != BookingCancellation.CancellationStatus.APPROVED) {
            throw new BadRequestException("Refund status can only be updated for APPROVED cancellations");
        }

        // Parse and set new refund status
        BookingCancellation.RefundStatus newRefundStatus;
        try {
            newRefundStatus = BookingCancellation.RefundStatus.valueOf(refundStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid refund status: " + refundStatus);
        }

        cancellation.setRefundStatus(newRefundStatus);
        
        // If status is COMPLETED, set refund processed timestamp
        if (newRefundStatus == BookingCancellation.RefundStatus.COMPLETED) {
            cancellation.setRefundProcessedAt(LocalDateTime.now());
            
            // Auto-sync booking payment status
            Booking booking = cancellation.getBooking();
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
            bookingRepository.save(booking);
            log.info("✅ Auto-updated booking {} paymentStatus to REFUNDED", booking.getId());
            
            // 🔔 Send refund completion notification to user
            try {
                Long userId = cancellation.getCancelledBy().getId();
                String tourName = booking.getTour() != null ? booking.getTour().getName() : "Tour";
                String bookingCode = booking.getBookingCode();
                
                String message = String.format(
                    "Số tiền %s đ từ tour '%s' (Mã booking: %s) đã được hoàn lại vào tài khoản của bạn. " +
                    "Vui lòng kiểm tra tài khoản ngân hàng.",
                    cancellation.getFinalRefundAmount() != null 
                        ? String.format("%,.0f", cancellation.getFinalRefundAmount()) 
                        : "0",
                    tourName,
                    bookingCode
                );
                
                notificationService.createNotificationForUser(
                    userId,
                    "💰 Hoàn tiền thành công",
                    message,
                    Notification.NotificationType.SUCCESS,
                    "/dashboard/bookings"
                );
                
                log.info("📧 Sent refund completion notification to user {}", userId);
            } catch (Exception e) {
                log.error("Failed to send refund completion notification: {}", e.getMessage());
            }
        }

        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("✅ Updated refund status for cancellation {} to {}", cancellationId, newRefundStatus);
        
        return mapToResponse(savedCancellation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getPendingCancellations(Pageable pageable) {
        return cancellationRepository.findPendingCancellations(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getAllCancellations(Pageable pageable) {
        log.info("Fetching all cancellations - page: {}, size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<BookingCancellation> cancellations = cancellationRepository.findAll(pageable);
        
        log.info("Found {} total cancellations", cancellations.getTotalElements());
        
        return cancellations.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getCancellationsByStatus(
            BookingCancellation.CancellationStatus status, 
            Pageable pageable) {
        return cancellationRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public BookingCancellationResponse processRefund(
            Long cancellationId, 
            String transactionId, 
            String refundMethod) {
        
        BookingCancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "id", cancellationId));

        if (cancellation.getStatus() != BookingCancellation.CancellationStatus.APPROVED) {
            throw new BadRequestException("Only approved cancellations can be refunded");
        }

        if (!cancellation.isRefundEligible()) {
            throw new BadRequestException("This cancellation is not eligible for refund");
        }

        cancellation.markRefundCompleted(transactionId, refundMethod);
        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Refund processed for cancellation {} with transaction {}", cancellationId, transactionId);
        
        return mapToResponse(savedCancellation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getCancellationsAwaitingRefund(Pageable pageable) {
        return cancellationRepository.findCancellationsAwaitingRefund(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateRefundAmount(Long bookingId, BookingCancellationRequest request) {
        CancellationEvaluation evaluation = evaluateCancellation(bookingId, request);
        return evaluation.finalRefundAmount;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getEmergencyCancellations(Pageable pageable) {
        return cancellationRepository.findEmergencyCancellations(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public BookingCancellationResponse expediteEmergencyCancellation(Long cancellationId, Long adminId) {
        BookingCancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking cancellation", "id", cancellationId));

        if (!cancellation.isEmergencyException()) {
            throw new BadRequestException("Only emergency cancellations can be expedited");
        }

        // Auto-approve emergency cancellations with special handling
        return approveCancellation(cancellationId, adminId, "Auto-approved emergency cancellation");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> searchCancellations(String searchTerm, Pageable pageable) {
        return cancellationRepository.searchCancellations(searchTerm, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingCancellationResponse> getCancellationsByDateRange(
            LocalDateTime startDate, 
            LocalDateTime endDate, 
            Pageable pageable) {
        return cancellationRepository.findByDateRange(startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CancellationStatistics getCancellationStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        CancellationStatistics stats = new CancellationStatistics();
        
        stats.totalCancellations = cancellationRepository.countByDateRange(startDate, endDate);
        stats.pendingCancellations = cancellationRepository.countByStatus(BookingCancellation.CancellationStatus.PENDING);
        stats.approvedCancellations = cancellationRepository.countByStatus(BookingCancellation.CancellationStatus.APPROVED);
        stats.rejectedCancellations = cancellationRepository.countByStatus(BookingCancellation.CancellationStatus.REJECTED);
        stats.totalRefundAmount = cancellationRepository.getTotalRefundAmount(startDate, endDate);
        
        if (stats.totalRefundAmount == null) {
            stats.totalRefundAmount = BigDecimal.ZERO;
        }
        
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CancellationReasonStat> getCancellationReasonStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = cancellationRepository.getCancellationReasonStats(startDate, endDate);
        long totalCancellations = cancellationRepository.countByDateRange(startDate, endDate);
        
        return results.stream()
                .map(row -> {
                    CancellationReasonStat stat = new CancellationReasonStat();
                    stat.reason = (BookingCancellation.CancellationReason) row[0];
                    stat.count = (Long) row[1];
                    stat.percentage = totalCancellations > 0 ? (stat.count * 100.0) / totalCancellations : 0.0;
                    return stat;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserCancellationSummary getUserCancellationSummary(Long userId) {
        Object[] result = cancellationRepository.getUserCancellationSummary(userId);
        
        UserCancellationSummary summary = new UserCancellationSummary();
        summary.totalCancellations = result[0] != null ? (Long) result[0] : 0L;
        summary.totalRefundReceived = result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO;
        summary.isFrequentCanceller = summary.totalCancellations >= 5; // Configurable threshold
        
        return summary;
    }

    @Override
    public CancellationEvaluation evaluateCancellation(Long bookingId, BookingCancellationRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        CancellationPolicy policy = findApplicablePolicy(booking);
        
        LocalDateTime now = LocalDateTime.now();
        int hoursBeforeDeparture = (int) ChronoUnit.HOURS.between(now, booking.getStartDate().atStartOfDay());
        
        CancellationEvaluation evaluation = new CancellationEvaluation();
        evaluation.hoursBeforeDeparture = hoursBeforeDeparture;
        evaluation.policyName = policy.getName();
        evaluation.warnings = new ArrayList<>();
        evaluation.requirements = new ArrayList<>();
        
        // Check basic eligibility
        if (!policy.isCancellationAllowed(hoursBeforeDeparture)) {
            evaluation.isEligible = false;
            evaluation.reason = "Cancellation request is outside the allowed timeframe";
            evaluation.finalRefundAmount = BigDecimal.ZERO;
            return evaluation;
        }
        
        // Calculate refund
        BigDecimal originalAmount = booking.getTotalPrice();
        BigDecimal refundPercentage = policy.getRefundPercentage(hoursBeforeDeparture);
        evaluation.estimatedRefund = originalAmount.multiply(refundPercentage).divide(new BigDecimal("100"));
        evaluation.cancellationFee = policy.getCancellationFee() != null ? policy.getCancellationFee() : BigDecimal.ZERO;
        evaluation.processingFee = policy.getProcessingFee() != null ? policy.getProcessingFee() : BigDecimal.ZERO;
        evaluation.finalRefundAmount = policy.calculateRefundAmount(originalAmount, hoursBeforeDeparture);
        
        evaluation.isEligible = true;
        evaluation.reason = "Cancellation allowed according to policy";
        
        return evaluation;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserAbusiveCanceller(Long userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<BookingCancellation> recentCancellations = 
                cancellationRepository.findRecentCancellationsByUser(userId, thirtyDaysAgo);
        
        // Consider abuse if more than 3 cancellations in 30 days
        return recentCancellations.size() > 3;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingCancellation> getRecentUserCancellations(Long userId, int daysBack) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysBack);
        return cancellationRepository.findRecentCancellationsByUser(userId, cutoffDate);
    }

    // Helper methods
    private CancellationPolicy findApplicablePolicy(Booking booking) {
        try {
            Category category = null;
            if (booking.getTour() != null) {
                category = booking.getTour().getCategory();
            }
            
            if (category != null) {
                return policyRepository.findBestMatchingPolicy(CancellationPolicy.PolicyStatus.ACTIVE, category)
                        .orElse(getDefaultPolicy());
            } else {
                log.warn("No category found for booking {}, using default policy", booking.getId());
                return getDefaultPolicy();
            }
        } catch (Exception e) {
            log.error("Error finding applicable policy for booking {}: {}", booking.getId(), e.getMessage());
            return getDefaultPolicy();
        }
    }
    
    private CancellationPolicy getDefaultPolicy() {
        // Create a default policy if none found
        CancellationPolicy defaultPolicy = new CancellationPolicy();
        defaultPolicy.setName("Default Policy");
        defaultPolicy.setPolicyType(CancellationPolicy.PolicyType.STANDARD);
        defaultPolicy.setStatus(CancellationPolicy.PolicyStatus.ACTIVE);
        defaultPolicy.setHoursBeforeDepartureFullRefund(72); // 3 days = full refund
        defaultPolicy.setHoursBeforeDeparturePartialRefund(24); // 1 day = 50% refund
        defaultPolicy.setHoursBeforeDepartureNoRefund(6);   // 6 hours = no refund
        defaultPolicy.setFullRefundPercentage(new BigDecimal("100"));
        defaultPolicy.setPartialRefundPercentage(new BigDecimal("80")); // More reasonable 80%
        defaultPolicy.setNoRefundPercentage(BigDecimal.ZERO);
        defaultPolicy.setCancellationFee(new BigDecimal("100000")); // 100k VND (reasonable fee)
        defaultPolicy.setProcessingFee(new BigDecimal("50000")); // 50k VND processing
        defaultPolicy.setMinimumNoticeHours(1);
        
        // Set additional required fields
        defaultPolicy.setIsActive(true);
        defaultPolicy.setEffectiveFrom(LocalDateTime.now());
        defaultPolicy.setPriority(1);
        
        // Set created_by to avoid null constraint violation
        // For default policies, use system user ID (1) or create without saving
        try {
            User systemUser = userRepository.findById(1L).orElse(null);
            if (systemUser != null) {
                defaultPolicy.setCreatedBy(systemUser);
            }
        } catch (Exception e) {
            log.warn("Could not set created_by for default policy: {}", e.getMessage());
        }
        
        return defaultPolicy;
    }

    private BookingCancellationResponse mapToResponse(BookingCancellation cancellation) {
        log.info("Mapping cancellation to response - ID: {}, Reason: {}, Status: {}", 
                cancellation.getId(), cancellation.getReason(), cancellation.getStatus());
        BookingCancellationResponse response = entityMapper.toBookingCancellationResponse(cancellation);
        log.info("Mapped response - ID: {}, Reason: {}, Status: {}", 
                response.getId(), response.getReason(), response.getStatus());
        return response;
    }

    @Override
    public long countAllCancellations() {
        return cancellationRepository.count();
    }
}
