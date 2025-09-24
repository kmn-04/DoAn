package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private String paymentId;
    private String orderId;
    private String bookingId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status; // PENDING, SUCCESS, FAILED, CANCELLED
    private String message;
    private String payUrl; // URL để redirect user đến trang thanh toán
    private String transactionId; // ID từ payment gateway
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // MoMo specific fields
    private String partnerCode;
    private String requestId;
    private String orderInfo;
    private String redirectUrl;
    private String ipnUrl;
    private String extraData;
    private String signature;
    
    // Error handling
    private String errorCode;
    private String errorMessage;
    
    public static PaymentResponse success(String paymentId, String payUrl, String message) {
        return PaymentResponse.builder()
                .paymentId(paymentId)
                .payUrl(payUrl)
                .status("PENDING")
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    public static PaymentResponse error(String errorCode, String errorMessage) {
        return PaymentResponse.builder()
                .status("FAILED")
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
