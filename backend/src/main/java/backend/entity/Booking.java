package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_user", columnList = "user_id"),
    @Index(name = "idx_bookings_tour", columnList = "tour_id"),
    @Index(name = "idx_bookings_confirmation_status", columnList = "confirmation_status"),
    @Index(name = "idx_bookings_payment_status", columnList = "payment_status"),
    @Index(name = "idx_bookings_start_date", columnList = "start_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(name = "booking_code", unique = true, nullable = false, length = 50)
    private String bookingCode;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    // Customer information
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;
    
    @Column(name = "customer_email", nullable = false, length = 100)
    private String customerEmail;
    
    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;
    
    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;
    
    // Number of participants
    @Column(name = "num_adults", nullable = false)
    private Integer numAdults = 1;
    
    @Column(name = "num_children", nullable = false)
    private Integer numChildren = 0;
    
    @Column(name = "num_infants", nullable = false)
    private Integer numInfants = 0;
    
    // Price information
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice; // Giá tour cơ bản
    
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice; // Tổng giá trước giảm giá
    
    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO; // Số tiền giảm giá
    
    @Column(name = "final_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount; // Số tiền cuối cùng phải trả
    
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;
    
    @Column(name = "contact_phone", length = 20)
    private String contactPhone;
    
    // Status fields - tách thành 2 trạng thái
    @Enumerated(EnumType.STRING)
    @Column(name = "confirmation_status", nullable = false, length = 30)
    private ConfirmationStatus confirmationStatus = ConfirmationStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    
    // Cancellation information
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;
    
    @Column(name = "cancelled_by")
    private Long cancelledBy; // User ID who cancelled
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Reminder tracking fields
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;
    
    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;
    
    // Relationship with User (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Relationship with Tour (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;
    
    // Relationship with TourSchedule (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private TourSchedule schedule;
    
    // Relationship with Promotion (Many-to-One) - Optional
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;
    
    // Relationship with Payment (One-to-Many)
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Payment> payments;
    
    // Relationship with Review (One-to-Many)
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Review> reviews;
    
    // Relationship with BookingParticipant (One-to-Many)
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<BookingParticipant> participants;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (bookingCode == null) {
            generateBookingCode();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to generate booking code
    private void generateBookingCode() {
        this.bookingCode = "BK" + System.currentTimeMillis();
    }
    
    // Helper method to get total people
    public Integer getTotalPeople() {
        return numAdults + numChildren + numInfants;
    }
    
    // Helper method for cancellation
    public void cancel(Long userId, String reason) {
        this.confirmationStatus = ConfirmationStatus.CANCELLED;
        this.cancelledBy = userId;
        this.cancelledAt = LocalDateTime.now();
        this.cancellationReason = reason;
    }
    
    // Helper method to check if booking can be cancelled
    public boolean canBeCancelled() {
        return confirmationStatus != ConfirmationStatus.CANCELLED 
            && confirmationStatus != ConfirmationStatus.COMPLETED;
    }
    
    public enum ConfirmationStatus {
        PENDING("Chờ xác nhận"),
        CONFIRMED("Đã xác nhận"),
        CANCELLED("Đã hủy"),
        COMPLETED("Đã hoàn thành"),
        CANCELLATION_REQUESTED("Yêu cầu hủy");
        
        private final String displayName;
        
        ConfirmationStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum PaymentStatus {
        UNPAID("Chưa thanh toán"),
        PAID("Đã thanh toán"),
        REFUNDING("Đang hoàn tiền"),
        REFUNDED("Đã hoàn tiền");
        
        private final String displayName;
        
        PaymentStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Deprecated - keep for backward compatibility
    @Deprecated
    public enum BookingStatus {
        PENDING, CONFIRMED, PAID, CANCELLED, COMPLETED, CANCELLATION_REQUESTED
    }
}
