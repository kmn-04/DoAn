package backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    
    @NotBlank(message = "Booking ID is required")
    private String bookingId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotBlank(message = "Order info is required")
    private String orderInfo;
    
    private String extraData;
    
    private String requestId;
    
    // Payment method: MOMO, VNPAY, STRIPE, PAYPAL
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    // User info for payment
    private Long userId;
    private String userEmail;
    private String userPhone;
}
