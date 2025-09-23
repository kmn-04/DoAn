package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingModificationResponse {
    
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private Long requestedByUserId;
    private String requestedByUserName;
    private ModificationType modificationType;
    private Status status;
    
    // Original values
    private OriginalValues originalValues;
    
    // Requested new values
    private NewValues newValues;
    
    // Pricing information
    private PricingDetails pricingDetails;
    
    // Status and tracking
    private StatusTracking statusTracking;
    
    // Reason and notes
    private String reason;
    private String customerNotes;
    private String adminNotes;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public enum ModificationType {
        DATE_CHANGE,
        PARTICIPANT_CHANGE,
        DATE_AND_PARTICIPANT_CHANGE,
        UPGRADE_TOUR_PACKAGE,
        ACCOMMODATION_CHANGE,
        OTHER
    }
    
    public enum Status {
        REQUESTED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        PROCESSING,
        COMPLETED,
        CANCELLED
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OriginalValues {
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer participants;
        private BigDecimal amount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewValues {
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer participants;
        private BigDecimal amount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingDetails {
        private BigDecimal originalAmount;
        private BigDecimal newAmount;
        private BigDecimal priceDifference;
        private BigDecimal processingFee;
        private BigDecimal totalAdditionalAmount;
        private Boolean requiresAdditionalPayment;
        private Boolean offersRefund;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusTracking {
        private Status currentStatus;
        private String statusMessage;
        private Long approvedBy;
        private String approvedByName;
        private LocalDateTime approvedAt;
        private Long processedBy;
        private String processedByName;
        private LocalDateTime processedAt;
        private LocalDateTime completedAt;
        private Boolean canBeCancelled;
        private Boolean requiresCustomerAction;
    }
    
    // Helper methods
    public boolean isAwaitingCustomerAction() {
        return status == Status.APPROVED && 
               pricingDetails != null && 
               pricingDetails.getRequiresAdditionalPayment() != null && 
               pricingDetails.getRequiresAdditionalPayment();
    }
    
    public boolean isProcessingComplete() {
        return status == Status.COMPLETED;
    }
    
    public boolean canBeModified() {
        return status == Status.REQUESTED || status == Status.UNDER_REVIEW;
    }
    
    public String getStatusDisplayText() {
        switch (status) {
            case REQUESTED: return "Đang chờ xem xét";
            case UNDER_REVIEW: return "Đang được xem xét";
            case APPROVED: return "Đã phê duyệt";
            case REJECTED: return "Đã từ chối";
            case PROCESSING: return "Đang xử lý";
            case COMPLETED: return "Hoàn thành";
            case CANCELLED: return "Đã hủy";
            default: return status.toString();
        }
    }
    
    public String getModificationTypeDisplayText() {
        switch (modificationType) {
            case DATE_CHANGE: return "Thay đổi ngày";
            case PARTICIPANT_CHANGE: return "Thay đổi số người";
            case DATE_AND_PARTICIPANT_CHANGE: return "Thay đổi ngày và số người";
            case UPGRADE_TOUR_PACKAGE: return "Nâng cấp gói tour";
            case ACCOMMODATION_CHANGE: return "Thay đổi chỗ ở";
            case OTHER: return "Khác";
            default: return modificationType.toString();
        }
    }
}
