package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(name = "payment_code", unique = true, length = 50)
    private String paymentCode; // Mã thanh toán nội bộ
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // COD, Bank Transfer, Credit Card
    
    @Column(name = "payment_provider", length = 50)
    private String paymentProvider; // ZaloPay, VNPay, Stripe...
    
    @Column(name = "transaction_id", length = 100)
    private String transactionId; // ID giao dịch nội bộ
    
    @Column(name = "provider_transaction_id", length = 100)
    private String providerTransactionId; // ID từ nhà cung cấp thanh toán
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt; // Thời điểm thanh toán thành công
    
    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount; // Số tiền hoàn lại
    
    @Column(name = "refunded_at")
    private LocalDateTime refundedAt; // Thời điểm hoàn tiền
    
    @Column(name = "payment_note", columnDefinition = "TEXT")
    private String paymentNote; // Ghi chú
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship with Booking (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
