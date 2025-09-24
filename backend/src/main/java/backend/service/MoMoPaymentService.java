package backend.service;

import backend.dto.request.PaymentRequest;
import backend.dto.response.PaymentResponse;

import java.math.BigDecimal;
import java.util.Map;

public interface MoMoPaymentService {
    
    /**
     * Tạo payment request với MoMo
     */
    PaymentResponse createPayment(PaymentRequest request);
    
    /**
     * Xử lý callback từ MoMo
     */
    boolean handleCallback(Map<String, String> momoData);
    
    /**
     * Kiểm tra trạng thái payment
     */
    PaymentResponse checkPaymentStatus(String orderId);
    
    /**
     * Verify signature từ MoMo
     */
    boolean verifySignature(Map<String, String> data, String signature);
    
    /**
     * Tạo signature cho request
     */
    String createSignature(String rawData);
}
