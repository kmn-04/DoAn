package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnPayPaymentResponse {
    private String paymentUrl;
    private String orderId;
    private String message;
    private String transactionNo;
}

