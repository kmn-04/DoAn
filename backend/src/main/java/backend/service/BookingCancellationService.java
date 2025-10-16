package backend.service;

import backend.dto.request.BookingCancellationRequest;
import backend.dto.response.BookingCancellationResponse;
import backend.entity.BookingCancellation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingCancellationService {

    // Core cancellation operations
    BookingCancellationResponse requestCancellation(BookingCancellationRequest request, Long userId);
    BookingCancellationResponse getCancellationById(Long cancellationId);
    BookingCancellationResponse getCancellationByBookingId(Long bookingId);
    
    // User operations
    Page<BookingCancellationResponse> getUserCancellations(Long userId, Pageable pageable);
    boolean canUserCancelBooking(Long bookingId, Long userId);
    
    // Admin operations
    BookingCancellationResponse approveCancellation(Long cancellationId, Long adminId, String adminNotes);
    BookingCancellationResponse rejectCancellation(Long cancellationId, Long adminId, String adminNotes);
    BookingCancellationResponse updateRefundStatus(Long cancellationId, String refundStatus);
    Page<BookingCancellationResponse> getPendingCancellations(Pageable pageable);
    Page<BookingCancellationResponse> getAllCancellations(Pageable pageable);
    Page<BookingCancellationResponse> getCancellationsByStatus(
            BookingCancellation.CancellationStatus status, 
            Pageable pageable
    );
    
    // Refund operations
    BookingCancellationResponse processRefund(
            Long cancellationId, 
            String transactionId, 
            String refundMethod
    );
    Page<BookingCancellationResponse> getCancellationsAwaitingRefund(Pageable pageable);
    BigDecimal calculateRefundAmount(Long bookingId, BookingCancellationRequest request);
    
    // Emergency handling
    Page<BookingCancellationResponse> getEmergencyCancellations(Pageable pageable);
    BookingCancellationResponse expediteEmergencyCancellation(Long cancellationId, Long adminId);
    
    // Search and filtering
    Page<BookingCancellationResponse> searchCancellations(String searchTerm, Pageable pageable);
    Page<BookingCancellationResponse> getCancellationsByDateRange(
            LocalDateTime startDate, 
            LocalDateTime endDate, 
            Pageable pageable
    );
    
    // Statistics and reporting
    CancellationStatistics getCancellationStatistics(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    List<CancellationReasonStat> getCancellationReasonStats(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    UserCancellationSummary getUserCancellationSummary(Long userId);
    
    // Policy evaluation
    CancellationEvaluation evaluateCancellation(Long bookingId, BookingCancellationRequest request);
    
    // Prevention and abuse detection
    boolean isUserAbusiveCanceller(Long userId);
    List<BookingCancellation> getRecentUserCancellations(Long userId, int daysBack);
    
    // Test methods
    long countAllCancellations();
    
    // Utility classes for responses
    class CancellationStatistics {
        public long totalCancellations;
        public long pendingCancellations;
        public long approvedCancellations;
        public long rejectedCancellations;
        public BigDecimal totalRefundAmount;
        public long emergencyCancellations;
    }
    
    class CancellationReasonStat {
        public BookingCancellation.CancellationReason reason;
        public long count;
        public double percentage;
    }
    
    class UserCancellationSummary {
        public long totalCancellations;
        public BigDecimal totalRefundReceived;
        public List<BookingCancellation.CancellationReason> topReasons;
        public boolean isFrequentCanceller;
    }
    
    class CancellationEvaluation {
        public boolean isEligible;
        public String reason;
        public BigDecimal estimatedRefund;
        public BigDecimal cancellationFee;
        public BigDecimal processingFee;
        public BigDecimal finalRefundAmount;
        public int hoursBeforeDeparture;
        public String policyName;
        public List<String> warnings;
        public List<String> requirements;
    }
}
