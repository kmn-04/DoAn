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
@Table(name = "cancellation_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancellationPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Policy type: STANDARD, FLEXIBLE, STRICT, CUSTOM
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyType policyType;

    // Time-based refund rules
    @Column(name = "hours_before_departure_full_refund")
    private Integer hoursBeforeDepartureFullRefund; // e.g., 48 hours = 100% refund

    @Column(name = "hours_before_departure_partial_refund")
    private Integer hoursBeforeDeparturePartialRefund; // e.g., 24 hours = 50% refund

    @Column(name = "hours_before_departure_no_refund")
    private Integer hoursBeforeDepartureNoRefund; // e.g., 12 hours = 0% refund

    // Refund percentages
    @Column(name = "full_refund_percentage", precision = 5, scale = 2)
    private BigDecimal fullRefundPercentage = new BigDecimal("100.00"); // 100%

    @Column(name = "partial_refund_percentage", precision = 5, scale = 2)
    private BigDecimal partialRefundPercentage = new BigDecimal("50.00"); // 50%

    @Column(name = "no_refund_percentage", precision = 5, scale = 2)
    private BigDecimal noRefundPercentage = new BigDecimal("0.00"); // 0%

    // Fixed cancellation fees
    @Column(name = "cancellation_fee", precision = 10, scale = 2)
    private BigDecimal cancellationFee = BigDecimal.ZERO;

    @Column(name = "processing_fee", precision = 10, scale = 2)
    private BigDecimal processingFee = BigDecimal.ZERO;

    // Special conditions
    @Column(name = "allows_medical_emergency_exception")
    private Boolean allowsMedicalEmergencyException = false;

    @Column(name = "allows_weather_exception")
    private Boolean allowsWeatherException = false;

    @Column(name = "allows_force_majeure_exception")
    private Boolean allowsForceMajeureException = false;

    // Minimum notice required
    @Column(name = "minimum_notice_hours")
    private Integer minimumNoticeHours = 1; // Minimum 1 hour notice

    // Policy status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    // Category restrictions
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category; // If policy applies to specific category

    // Priority (higher number = higher priority)
    @Column(nullable = false)
    private Integer priority = 1;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum PolicyType {
        STANDARD,   // Most common policy
        FLEXIBLE,   // More lenient policy
        STRICT,     // Stricter policy
        CUSTOM      // Custom rules
    }

    public enum PolicyStatus {
        ACTIVE,
        INACTIVE,
        DEPRECATED
    }

    // Helper method to calculate refund percentage based on hours before departure
    public BigDecimal getRefundPercentage(int hoursBeforeDeparture) {
        if (hoursBeforeDeparture >= hoursBeforeDepartureFullRefund) {
            return fullRefundPercentage;
        } else if (hoursBeforeDeparture >= hoursBeforeDeparturePartialRefund) {
            return partialRefundPercentage;
        } else if (hoursBeforeDeparture >= hoursBeforeDepartureNoRefund) {
            return noRefundPercentage;
        } else {
            return BigDecimal.ZERO; // Past minimum notice
        }
    }

    // Check if cancellation is allowed based on timing
    public boolean isCancellationAllowed(int hoursBeforeDeparture) {
        return hoursBeforeDeparture >= minimumNoticeHours;
    }

    // Calculate total refund amount
    public BigDecimal calculateRefundAmount(BigDecimal originalAmount, int hoursBeforeDeparture) {
        if (!isCancellationAllowed(hoursBeforeDeparture)) {
            return BigDecimal.ZERO;
        }

        BigDecimal refundPercentage = getRefundPercentage(hoursBeforeDeparture);
        BigDecimal refundAmount = originalAmount.multiply(refundPercentage).divide(new BigDecimal("100"));
        
        // Subtract fixed fees
        refundAmount = refundAmount.subtract(cancellationFee).subtract(processingFee);
        
        // Ensure refund is not negative
        return refundAmount.max(BigDecimal.ZERO);
    }
}
