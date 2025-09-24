package backend.controller;

import backend.dto.request.PaymentRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.PaymentResponse;
import backend.service.MoMoPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "APIs for payment processing")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PaymentController {
    
    private final MoMoPaymentService moMoPaymentService;
    
    @PostMapping("/momo/create")
    @Operation(summary = "Create MoMo payment", description = "Tạo yêu cầu thanh toán qua MoMo")
    public ResponseEntity<ApiResponse<PaymentResponse>> createMoMoPayment(
            @Valid @RequestBody PaymentRequest request) {
        
        try {
            log.info("Creating MoMo payment for booking: {}", request.getBookingId());
            
            PaymentResponse response = moMoPaymentService.createPayment(request);
            
            if ("FAILED".equals(response.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(response.getErrorMessage()));
            }
            
            return ResponseEntity.ok(
                    ApiResponse.success("Payment created successfully", response)
            );
            
        } catch (Exception e) {
            log.error("Error creating MoMo payment", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to create payment"));
        }
    }
    
    @PostMapping("/momo/callback")
    @Operation(summary = "MoMo payment callback", description = "Xử lý callback từ MoMo sau khi thanh toán")
    public ResponseEntity<Map<String, String>> handleMoMoCallback(
            HttpServletRequest request) {
        
        try {
            // Extract MoMo callback data
            Map<String, String> momoData = new HashMap<>();
            request.getParameterMap().forEach((key, values) -> {
                if (values.length > 0) {
                    momoData.put(key, values[0]);
                }
            });
            
            log.info("Received MoMo callback: {}", momoData);
            
            boolean success = moMoPaymentService.handleCallback(momoData);
            
            Map<String, String> response = new HashMap<>();
            if (success) {
                response.put("resultCode", "0");
                response.put("message", "Success");
            } else {
                response.put("resultCode", "1");
                response.put("message", "Failed");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error handling MoMo callback", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", "1");
            errorResponse.put("message", "System error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/momo/status/{orderId}")
    @Operation(summary = "Check MoMo payment status", description = "Kiểm tra trạng thái thanh toán MoMo")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkMoMoPaymentStatus(
            @Parameter(description = "Order ID") @PathVariable String orderId) {
        
        try {
            PaymentResponse response = moMoPaymentService.checkPaymentStatus(orderId);
            return ResponseEntity.ok(
                    ApiResponse.success("Payment status retrieved", response)
            );
            
        } catch (Exception e) {
            log.error("Error checking MoMo payment status", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check payment status"));
        }
    }
    
    @GetMapping("/methods")
    @Operation(summary = "Get available payment methods", description = "Lấy danh sách phương thức thanh toán")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentMethods() {
        
        Map<String, Object> methods = new HashMap<>();
        
        // MoMo
        Map<String, Object> momo = new HashMap<>();
        momo.put("name", "MoMo E-Wallet");
        momo.put("code", "MOMO");
        momo.put("description", "Thanh toán qua ví điện tử MoMo");
        momo.put("logo", "/images/payment/momo-logo.png");
        momo.put("enabled", true);
        momo.put("testMode", true);
        
        // VNPay (placeholder)
        Map<String, Object> vnpay = new HashMap<>();
        vnpay.put("name", "VNPay");
        vnpay.put("code", "VNPAY");
        vnpay.put("description", "Thanh toán qua VNPay");
        vnpay.put("logo", "/images/payment/vnpay-logo.png");
        vnpay.put("enabled", false);
        vnpay.put("testMode", true);
        
        // Stripe (placeholder)
        Map<String, Object> stripe = new HashMap<>();
        stripe.put("name", "Credit/Debit Card");
        stripe.put("code", "STRIPE");
        stripe.put("description", "Thanh toán bằng thẻ tín dụng/ghi nợ");
        stripe.put("logo", "/images/payment/stripe-logo.png");
        stripe.put("enabled", false);
        stripe.put("testMode", true);
        
        // PayPal (placeholder)
        Map<String, Object> paypal = new HashMap<>();
        paypal.put("name", "PayPal");
        paypal.put("code", "PAYPAL");
        paypal.put("description", "Thanh toán qua PayPal");
        paypal.put("logo", "/images/payment/paypal-logo.png");
        paypal.put("enabled", false);
        paypal.put("testMode", true);
        
        methods.put("MOMO", momo);
        methods.put("VNPAY", vnpay);
        methods.put("STRIPE", stripe);
        methods.put("PAYPAL", paypal);
        
        return ResponseEntity.ok(
                ApiResponse.success("Payment methods retrieved", methods)
        );
    }
}
