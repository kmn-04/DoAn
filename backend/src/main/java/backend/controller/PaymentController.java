package backend.controller;

import backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    
    // MoMo payment integration removed - will be re-implemented later
    // TODO: Re-implement MoMo payment with proper architecture
    
    @GetMapping("/methods")
    @Operation(summary = "Get available payment methods", description = "Lấy danh sách phương thức thanh toán")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentMethods() {
        
        Map<String, Object> methods = new HashMap<>();
        
        // MoMo - Disabled
        Map<String, Object> momo = new HashMap<>();
        momo.put("name", "MoMo E-Wallet");
        momo.put("code", "MOMO");
        momo.put("description", "Thanh toán qua ví điện tử MoMo");
        momo.put("logo", "/images/payment/momo-logo.png");
        momo.put("enabled", false);
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
