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

@Entity
@Table(name = "point_vouchers", indexes = {
    @Index(name = "idx_voucher_user", columnList = "user_id"),
    @Index(name = "idx_voucher_code", columnList = "voucher_code"),
    @Index(name = "idx_voucher_status", columnList = "status"),
    @Index(name = "idx_voucher_expires", columnList = "expires_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PointVoucher {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;
    
    @Column(name = "voucher_code", unique = true, nullable = false, length = 50)
    private String voucherCode;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type", nullable = false, length = 20)
    private VoucherType voucherType = VoucherType.AMOUNT;
    
    @Column(name = "voucher_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal voucherValue;
    
    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;
    
    @Column(name = "min_order_value", precision = 12, scale = 2)
    private BigDecimal minOrderValue = BigDecimal.ZERO;
    
    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VoucherStatus status = VoucherStatus.ACTIVE;
    
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDate expiresAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum VoucherType {
        AMOUNT,      // Giảm theo số tiền
        PERCENTAGE   // Giảm theo phần trăm
    }
    
    public enum VoucherStatus {
        ACTIVE,      // Đang hoạt động
        USED,        // Đã sử dụng
        EXPIRED,     // Hết hạn
        CANCELLED    // Đã hủy
    }
}

