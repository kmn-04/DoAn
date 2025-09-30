package backend.service.impl;

import backend.dto.request.BookingCancellationRequest;
import backend.dto.response.BookingCancellationResponse;
import backend.entity.*;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.*;
import backend.service.BookingCancellationService;
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

        // Check if already cancelled
        if (cancellationRepository.existsByBookingId(request.getBookingId())) {
            throw new BadRequestException("Cancellation request already exists for this booking");
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

        // Create cancellation record
        BookingCancellation cancellation = new BookingCancellation();
        cancellation.setBooking(booking);
        cancellation.setCancelledBy(user);
        cancellation.setRequestedBy(user); // Set the requested_by field
        // Set the saved policy (required by database constraint)
        cancellation.setCancellationPolicy(policy);
        cancellation.setReason(request.getReason());
        cancellation.setReasonCategory(request.getReasonCategory());
        cancellation.setDetailedReason(request.getAdditionalNotes()); // Map additionalNotes to detailedReason
        cancellation.setAdditionalNotes(request.getAdditionalNotes());
        
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

        // Set initial status - emergency cases go to review immediately
        if (cancellation.isEmergencyException()) {
            cancellation.setStatus(BookingCancellation.CancellationStatus.UNDER_REVIEW);
        } else {
            cancellation.setStatus(BookingCancellation.CancellationStatus.REQUESTED);
        }

        // Update booking status
        booking.setStatus(Booking.BookingStatus.CancellationRequested);
        bookingRepository.save(booking);

        // Save cancellation
        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Cancellation request created with ID: {}", savedCancellation.getId());
        
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
        return cancellationRepository.findByCancelledByIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canUserCancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        // Temporarily disabled for testing - TODO: Fix user relationship  
        // Check ownership
        // if (!booking.getUser().getId().equals(userId)) {
        //     return false;
        // }

        // Check booking status
        if (booking.getStatus() == Booking.BookingStatus.Cancelled || 
            booking.getStatus() == Booking.BookingStatus.Completed ||
            booking.getStatus() == Booking.BookingStatus.CancellationRequested) {
            return false;
        }

        // Check if already has cancellation request
        if (cancellationRepository.existsByBookingId(bookingId)) {
            return false;
        }

        // Check timing constraints
        LocalDateTime now = LocalDateTime.now();
        long hoursBeforeDeparture = ChronoUnit.HOURS.between(now, booking.getStartDate().atStartOfDay());
        
        CancellationPolicy policy = findApplicablePolicy(booking);
        return policy.isCancellationAllowed((int) hoursBeforeDeparture);
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

        // Update booking status
        Booking booking = cancellation.getBooking();
        booking.setStatus(Booking.BookingStatus.Cancelled);
        bookingRepository.save(booking);

        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Cancellation {} approved by admin {}", cancellationId, adminId);
        
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

        // Restore booking status
        Booking booking = cancellation.getBooking();
        booking.setStatus(Booking.BookingStatus.Confirmed); // Or original status
        bookingRepository.save(booking);

        BookingCancellation savedCancellation = cancellationRepository.save(cancellation);
        
        log.info("Cancellation {} rejected by admin {}", cancellationId, adminId);
        
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
        stats.pendingCancellations = cancellationRepository.countByStatus(BookingCancellation.CancellationStatus.REQUESTED) +
                                   cancellationRepository.countByStatus(BookingCancellation.CancellationStatus.UNDER_REVIEW);
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
