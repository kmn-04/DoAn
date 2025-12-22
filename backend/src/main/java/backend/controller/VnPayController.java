package backend.controller;

import backend.dto.request.VnPayPaymentRequest;
import backend.dto.response.VnPayPaymentResponse;
import backend.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class VnPayController {
    
    private final VnPayService vnPayService;
    
    /**
     * Tạo URL thanh toán VNPay
     */
    @PostMapping("/create-payment")
    public ResponseEntity<VnPayPaymentResponse> createPayment(
            @Valid @RequestBody VnPayPaymentRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("📝 Creating VNPay payment for booking: {}", request.getBookingId());
        
        // Lấy IP address của người dùng
        String ipAddress = getClientIp(httpRequest);
        log.info("Client IP: {}", ipAddress);
        
        try {
            VnPayPaymentResponse response = vnPayService.createPaymentUrl(request, ipAddress);
            
            log.info("✅ VNPay payment URL created successfully: {}", response.getOrderId());
            log.info("📋 Payment URL preview (first 100 chars): {}", 
                    response.getPaymentUrl().length() > 100 ? 
                    response.getPaymentUrl().substring(0, 100) + "..." : 
                    response.getPaymentUrl());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error creating VNPay payment URL", e);
            // Nếu lỗi code 71 (website chưa được phê duyệt), cung cấp thông tin hữu ích
            if (e.getMessage() != null && e.getMessage().contains("71")) {
                log.error("⚠️ VNPay Error Code 71: Website chưa được phê duyệt.");
                log.error("💡 Solution: Đăng nhập vào VNPay merchant portal và đăng ký Return URL.");
                log.error("📍 Return URL cần đăng ký: {}", request);
            }
            throw e;
        }
    }
    
    /**
     * Xử lý kết quả thanh toán từ VNPay (GET request từ redirect)
     */
    @GetMapping("/payment-return")
    public ResponseEntity<VnPayPaymentResponse> handlePaymentReturn(
            HttpServletRequest request) {
        
        log.info("🔄 Handling VNPay payment return");
        
        Map<String, String> params = new HashMap<>();
        Enumeration<String> parameterNames = request.getParameterNames();
        
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            params.put(paramName, paramValue);
        }
        
        log.info("Received params from VNPay: {}", params);
        
        try {
            VnPayPaymentResponse response = vnPayService.handlePaymentReturn(params);
            
            log.info("✅ Payment processed successfully: {}", response.getMessage());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error processing payment return", e);
            return ResponseEntity.badRequest()
                    .body(VnPayPaymentResponse.builder()
                            .message("Payment processing failed: " + e.getMessage())
                            .build());
        }
    }
    
    /**
     * IPN (Instant Payment Notification) - Webhook từ VNPay
     * VNPay sẽ gọi API này để thông báo kết quả thanh toán
     */
    @GetMapping("/payment-callback")
    public ResponseEntity<Map<String, String>> handlePaymentCallback(
            HttpServletRequest request) {
        
        log.info("📞 Received VNPay IPN callback");
        
        Map<String, String> params = new HashMap<>();
        Enumeration<String> parameterNames = request.getParameterNames();
        
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            params.put(paramName, paramValue);
        }
        
        log.info("IPN params: {}", params);
        
        Map<String, String> response = new HashMap<>();
        
        try {
            vnPayService.handlePaymentReturn(params);
            
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
            
            log.info("✅ IPN processed successfully");
        } catch (Exception e) {
            log.error("❌ Error processing IPN", e);
            
            response.put("RspCode", "99");
            response.put("Message", "Unknown error");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get response code meaning
     */
    @GetMapping("/response-code/{code}")
    public ResponseEntity<Map<String, String>> getResponseCodeMeaning(@PathVariable String code) {
        String message = vnPayService.getResponseCodeMessage(code);
        
        Map<String, String> response = new HashMap<>();
        response.put("code", code);
        response.put("message", message);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Helper method to get client IP address
     */
    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // Nếu có nhiều IP (qua nhiều proxy), lấy IP đầu tiên
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }
}

