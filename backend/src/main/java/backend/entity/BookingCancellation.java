package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_cancellations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to the cancelled booking
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Who cancelled the booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id", nullable = false)
    private User cancelledBy;

    // Applied cancellation policy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancellation_policy_id", nullable = false)
    private CancellationPolicy cancellationPolicy;

    // Cancellation details
    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CancellationReason reasonCategory;

    @Column(columnDefinition = "TEXT")
    private String additionalNotes;

    // Financial calculations
    @Column(name = "original_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal originalAmount;

    @Column(name = "refund_percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal refundPercentage;

    @Column(name = "refund_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal refundAmount;

    @Column(name = "cancellation_fee", precision = 10, scale = 2)
    private BigDecimal cancellationFee = BigDecimal.ZERO;

    @Column(name = "processing_fee", precision = 10, scale = 2)
    private BigDecimal processingFee = BigDecimal.ZERO;

    @Column(name = "final_refund_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal finalRefundAmount;

    // Timing information
    @Column(name = "hours_before_departure", nullable = false)
    private Integer hoursBeforeDeparture;

    @Column(name = "departure_date", nullable = false)
    private LocalDateTime departureDate;

    @Column(name = "cancelled_at", nullable = false)
    private LocalDateTime cancelledAt;

    // Status and processing
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CancellationStatus status = CancellationStatus.REQUESTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus refundStatus = RefundStatus.PENDING;

    // Admin processing
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_user_id")
    private User processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // Special circumstances
    @Column(name = "is_medical_emergency")
    private Boolean isMedicalEmergency = false;

    @Column(name = "is_weather_related")
    private Boolean isWeatherRelated = false;

    @Column(name = "is_force_majeure")
    private Boolean isForceMajeure = false;

    @Column(name = "supporting_documents", columnDefinition = "TEXT")
    private String supportingDocuments; // JSON array of document URLs

    // Refund tracking
    @Column(name = "refund_transaction_id")
    private String refundTransactionId;

    @Column(name = "refund_method")
    private String refundMethod; // CREDIT_CARD, BANK_TRANSFER, VOUCHER, etc.

    @Column(name = "refund_processed_at")
    private LocalDateTime refundProcessedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum CancellationReason {
        PERSONAL_EMERGENCY,
        MEDICAL_EMERGENCY,
        WEATHER_CONDITIONS,
        FORCE_MAJEURE,
        TRAVEL_RESTRICTIONS,
        SCHEDULE_CONFLICT,
        FINANCIAL_DIFFICULTY,
        DISSATISFACTION,
        DUPLICATE_BOOKING,
        TECHNICAL_ERROR,
        OTHER
    }

    public enum CancellationStatus {
        REQUESTED,      // Initial request
        UNDER_REVIEW,   // Being reviewed by admin
        APPROVED,       // Cancellation approved
        REJECTED,       // Cancellation rejected
        COMPLETED       // Fully processed
    }

    public enum RefundStatus {
        PENDING,        // Refund not processed
        PROCESSING,     // Refund being processed
        COMPLETED,      // Refund completed
        FAILED,         // Refund failed
        NOT_APPLICABLE  // No refund (policy or timing)
    }

    // Helper methods
    public boolean isRefundEligible() {
        return finalRefundAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isEmergencyException() {
        return Boolean.TRUE.equals(isMedicalEmergency) || 
               Boolean.TRUE.equals(isWeatherRelated) || 
               Boolean.TRUE.equals(isForceMajeure);
    }

    public boolean canBeProcessed() {
        return status == CancellationStatus.REQUESTED || status == CancellationStatus.UNDER_REVIEW;
    }

    public void markAsApproved(User admin, String notes) {
        this.status = CancellationStatus.APPROVED;
        this.processedBy = admin;
        this.processedAt = LocalDateTime.now();
        this.adminNotes = notes;
        
        if (isRefundEligible()) {
            this.refundStatus = RefundStatus.PROCESSING;
        } else {
            this.refundStatus = RefundStatus.NOT_APPLICABLE;
        }
    }

    public void markAsRejected(User admin, String notes) {
        this.status = CancellationStatus.REJECTED;
        this.processedBy = admin;
        this.processedAt = LocalDateTime.now();
        this.adminNotes = notes;
        this.refundStatus = RefundStatus.NOT_APPLICABLE;
    }

    public void markRefundCompleted(String transactionId, String method) {
        this.refundStatus = RefundStatus.COMPLETED;
        this.refundTransactionId = transactionId;
        this.refundMethod = method;
        this.refundProcessedAt = LocalDateTime.now();
        this.status = CancellationStatus.COMPLETED;
    }
}
