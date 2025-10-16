package backend.dto.response;

import backend.entity.BookingCancellation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCancellationResponse {

    private Long id;
    
    // Booking information
    private BookingSummary booking;
    
    // Cancellation details
    private String reason;
    private BookingCancellation.CancellationReason reasonCategory;
    private String additionalNotes;
    
    // Financial information
    private BigDecimal originalAmount;
    private BigDecimal refundPercentage;
    private BigDecimal refundAmount;
    private BigDecimal cancellationFee;
    private BigDecimal processingFee;
    private BigDecimal finalRefundAmount;
    
    // Timing
    private Integer hoursBeforeDeparture;
    private LocalDateTime departureDate;
    private LocalDateTime cancelledAt;
    
    // Status
    private BookingCancellation.CancellationStatus status;
    private BookingCancellation.RefundStatus refundStatus;
    
    // Processing information
    private UserSummary cancelledBy;
    private UserSummary processedBy;
    private LocalDateTime processedAt;
    private String adminNotes;
    
    // Special circumstances
    private Boolean isMedicalEmergency;
    private Boolean isWeatherRelated;
    private Boolean isForceMajeure;
    private List<String> supportingDocuments;
    
    // Refund tracking
    private String refundTransactionId;
    private String refundMethod;
    private LocalDateTime refundProcessedAt;
    
    // Policy information
    private CancellationPolicySummary cancellationPolicy;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingSummary {
        private Long id;
        private String bookingCode;
        private String tourName;
        private LocalDateTime startDate;
        private Integer totalPeople;
        private BigDecimal totalPrice;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancellationPolicySummary {
        private Long id;
        private String name;
        private String policyType;
        private Integer hoursBeforeDepartureFullRefund;
        private Integer hoursBeforeDeparturePartialRefund;
        private BigDecimal fullRefundPercentage;
        private BigDecimal partialRefundPercentage;
        private BigDecimal cancellationFee;
        private BigDecimal processingFee;
    }
    
    // Helper methods
    public boolean isRefundEligible() {
        return finalRefundAmount != null && finalRefundAmount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isPending() {
        return status == BookingCancellation.CancellationStatus.PENDING;
    }
    
    public boolean isApproved() {
        return status == BookingCancellation.CancellationStatus.APPROVED;
    }
    
    public boolean isRefundProcessing() {
        return refundStatus == BookingCancellation.RefundStatus.PROCESSING;
    }
    
    public boolean isRefundCompleted() {
        return refundStatus == BookingCancellation.RefundStatus.COMPLETED && status == BookingCancellation.CancellationStatus.APPROVED;
    }
    
    public String getStatusDisplayText() {
        switch (status) {
            case PENDING:
                return "Yêu cầu hủy đã được gửi";
            case APPROVED:
                return "Yêu cầu hủy đã được phê duyệt";
            case REJECTED:
                return "Yêu cầu hủy bị từ chối";
            default:
                return status.toString();
        }
    }
    
    public String getRefundStatusDisplayText() {
        switch (refundStatus) {
            case PENDING:
                return "Chờ xử lý hoàn tiền";
            case PROCESSING:
                return "Đang xử lý hoàn tiền";
            case COMPLETED:
                return "Đã hoàn tiền thành công";
            case FAILED:
                return "Hoàn tiền thất bại";
            case NOT_APPLICABLE:
                return "Không áp dụng hoàn tiền";
            default:
                return refundStatus.toString();
        }
    }
}
