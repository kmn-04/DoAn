package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_modifications")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class BookingModification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModificationType modificationType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.REQUESTED;
    
    // Original values
    @Column(name = "original_start_date")
    private LocalDate originalStartDate;
    
    @Column(name = "original_end_date")
    private LocalDate originalEndDate;
    
    @Column(name = "original_participants")
    private Integer originalParticipants;
    
    @Column(name = "original_amount", precision = 10, scale = 2)
    private BigDecimal originalAmount;
    
    // Requested new values
    @Column(name = "new_start_date")
    private LocalDate newStartDate;
    
    @Column(name = "new_end_date")
    private LocalDate newEndDate;
    
    @Column(name = "new_participants")
    private Integer newParticipants;
    
    @Column(name = "new_amount", precision = 10, scale = 2)
    private BigDecimal newAmount;
    
    // Price difference
    @Column(name = "price_difference", precision = 10, scale = 2)
    private BigDecimal priceDifference;
    
    @Column(name = "processing_fee", precision = 10, scale = 2)
    private BigDecimal processingFee = BigDecimal.ZERO;
    
    // Reason and notes
    @Column(length = 500)
    private String reason;
    
    @Column(name = "customer_notes", length = 1000)
    private String customerNotes;
    
    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;
    
    // Status tracking
    @Column(name = "approved_by_user_id")
    private Long approvedBy;
    
    @Column(name = "processed_by_user_id")
    private Long processedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
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
    
    // Helper methods
    public boolean requiresAdditionalPayment() {
        return priceDifference != null && priceDifference.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean offersRefund() {
        return priceDifference != null && priceDifference.compareTo(BigDecimal.ZERO) < 0;
    }
    
    public BigDecimal getTotalAdditionalAmount() {
        BigDecimal additional = requiresAdditionalPayment() ? priceDifference : BigDecimal.ZERO;
        return additional.add(processingFee != null ? processingFee : BigDecimal.ZERO);
    }
}
