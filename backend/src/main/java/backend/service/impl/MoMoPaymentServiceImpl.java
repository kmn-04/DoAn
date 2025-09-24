package backend.service.impl;

import backend.dto.request.PaymentRequest;
import backend.dto.response.PaymentResponse;
import backend.service.MoMoPaymentService;
import backend.service.PaymentService;
import backend.service.BookingService;
import backend.entity.Booking;
import backend.entity.Payment;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoPaymentServiceImpl implements MoMoPaymentService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final PaymentService paymentService;
    private final BookingService bookingService;
    
    @Value("${momo.partnerCode:MOMO}")
    private String partnerCode;
    
    @Value("${momo.accessKey:F8BBA842ECF85}")
    private String accessKey;
    
    @Value("${momo.secretKey:K951B6PE1waDMi640xX08PD3vg6EkVlz}")
    private String secretKey;
    
    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String endpoint;
    
    @Value("${momo.redirectUrl:http://localhost:5173/payment/momo/return}")
    private String redirectUrl;
    
    @Value("${momo.ipnUrl:http://localhost:8080/api/payment/momo/callback}")
    private String ipnUrl;
    
    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            String orderId = UUID.randomUUID().toString();
            String requestId = UUID.randomUUID().toString();
            
            // Get booking to create payment record
            log.info("📋 Getting booking for payment: {}", request.getBookingId());
            Booking booking = bookingService.getBookingByCode(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found: " + request.getBookingId()));
            
            log.info("✅ Found booking: {} for user: {}", booking.getBookingCode(), booking.getUser().getId());
            
            // Prepare request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("partnerCode", partnerCode);
            requestData.put("partnerName", "Tour Booking");
            requestData.put("storeId", "MomoTestStore");
            requestData.put("requestId", requestId);
            requestData.put("amount", request.getAmount().longValue());
            requestData.put("orderId", orderId);
            requestData.put("orderInfo", request.getOrderInfo());
            requestData.put("redirectUrl", redirectUrl);
            requestData.put("ipnUrl", ipnUrl);
            requestData.put("lang", "vi");
            requestData.put("extraData", request.getExtraData() != null ? request.getExtraData() : "");
            requestData.put("requestType", "payWithATM");
            requestData.put("autoCapture", true);
            
            // Create signature
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + request.getAmount().longValue() +
                    "&extraData=" + (request.getExtraData() != null ? request.getExtraData() : "") +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + request.getOrderInfo() +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=payWithATM";
            
            String signature = createSignature(rawSignature);
            requestData.put("signature", signature);
            
            log.info("MoMo Payment Request: {}", requestData);
            
            // Send request to MoMo
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(endpoint, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            Map<String, Object> responseBody = response.getBody();
            log.info("MoMo Payment Response: {}", responseBody);
            
            if (responseBody != null && "0".equals(String.valueOf(responseBody.get("resultCode")))) {
                // Success - Create payment record in database
                Payment payment = paymentService.createPayment(
                    booking, 
                    request.getAmount(), 
                    "MOMO", 
                    orderId // Use orderId as transactionId for tracking
                );
                log.info("✅ Created payment record with ID: {} for MoMo transaction", payment.getId());
                
                return PaymentResponse.builder()
                        .paymentId(requestId)
                        .orderId(orderId)
                        .bookingId(request.getBookingId())
                        .amount(request.getAmount())
                        .paymentMethod("MOMO")
                        .status("PENDING")
                        .message("Payment created successfully")
                        .payUrl((String) responseBody.get("payUrl"))
                        .partnerCode(partnerCode)
                        .requestId(requestId)
                        .orderInfo(request.getOrderInfo())
                        .signature(signature)
                        .build();
            } else {
                // Error
                String errorMessage = responseBody != null ? 
                        (String) responseBody.get("message") : "Unknown error";
                return PaymentResponse.error("MOMO_ERROR", errorMessage);
            }
            
        } catch (Exception e) {
            log.error("Error creating MoMo payment", e);
            return PaymentResponse.error("SYSTEM_ERROR", "System error occurred");
        }
    }
    
    @Override
    public boolean handleCallback(Map<String, String> momoData) {
        try {
            // Verify signature
            String signature = momoData.get("signature");
            if (!verifySignature(momoData, signature)) {
                log.error("Invalid MoMo signature");
                return false;
            }
            
            String resultCode = momoData.get("resultCode");
            String orderId = momoData.get("orderId");
            
            log.info("MoMo callback - OrderId: {}, ResultCode: {}", orderId, resultCode);
            
            // Process payment result
            if ("0".equals(resultCode)) {
                // Payment success
                log.info("MoMo payment success for order: {}", orderId);
                
                try {
                    // Find booking by orderId (which is stored as transactionId in Payment)
                    Payment payment = paymentService.findByTransactionId(orderId)
                            .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));
                    
                    // Process successful payment - updates payment status and booking status
                    paymentService.processSuccessfulPayment(orderId, payment.getBooking());
                    
                    log.info("✅ Successfully processed MoMo payment callback for order: {}", orderId);
                    return true;
                } catch (Exception e) {
                    log.error("❌ Error processing successful MoMo payment for order: {}", orderId, e);
                    return false;
                }
            } else {
                // Payment failed
                log.warn("MoMo payment failed for order: {}, code: {}", orderId, resultCode);
                
                try {
                    // Process failed payment
                    paymentService.processFailedPayment(orderId, "MoMo payment failed with code: " + resultCode);
                    log.info("✅ Processed failed MoMo payment for order: {}", orderId);
                } catch (Exception e) {
                    log.error("❌ Error processing failed MoMo payment for order: {}", orderId, e);
                }
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error handling MoMo callback", e);
            return false;
        }
    }
    
    @Override
    public PaymentResponse checkPaymentStatus(String orderId) {
        try {
            // Create request for MoMo status check
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("partnerCode", partnerCode);
            requestData.put("orderId", orderId);
            requestData.put("requestId", UUID.randomUUID().toString());
            requestData.put("lang", "vi");
            
            // Create signature for status check
            String rawSignature = "accessKey=" + accessKey +
                    "&orderId=" + orderId +
                    "&partnerCode=" + partnerCode +
                    "&requestId=" + requestData.get("requestId");
            
            String signature = createSignature(rawSignature);
            requestData.put("signature", signature);
            
            // Call MoMo status check API
            String statusEndpoint = "https://test-payment.momo.vn/v2/gateway/api/query";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(statusEndpoint, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            Map<String, Object> responseBody = response.getBody();
            log.info("MoMo status check response: {}", responseBody);
            
            if (responseBody != null) {
                String resultCode = String.valueOf(responseBody.get("resultCode"));
                String message = (String) responseBody.get("message");
                
                if ("0".equals(resultCode)) {
                    // Payment successful
                    return PaymentResponse.builder()
                            .orderId(orderId)
                            .status("SUCCESS")
                            .message("Payment completed successfully")
                            .transactionId((String) responseBody.get("transId"))
                            .amount(responseBody.get("amount") != null ? 
                                    new BigDecimal(responseBody.get("amount").toString()) : BigDecimal.ZERO)
                            .build();
                } else if ("1006".equals(resultCode)) {
                    // Transaction not found or pending
                    return PaymentResponse.builder()
                            .orderId(orderId)
                            .status("PENDING")
                            .message("Transaction is still pending")
                            .build();
                } else {
                    // Payment failed
                    return PaymentResponse.builder()
                            .orderId(orderId)
                            .status("FAILED")
                            .message(message != null ? message : "Payment failed")
                            .build();
                }
            }
            
            return PaymentResponse.builder()
                    .orderId(orderId)
                    .status("FAILED")
                    .message("Unable to get payment status")
                    .build();
            
        } catch (Exception e) {
            log.error("Error checking MoMo payment status for orderId: {}", orderId, e);
            return PaymentResponse.builder()
                    .orderId(orderId)
                    .status("FAILED")
                    .message("System error occurred while checking payment status")
                    .build();
        }
    }
    
    @Override
    public boolean verifySignature(Map<String, String> data, String signature) {
        try {
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + data.get("amount") +
                    "&extraData=" + data.getOrDefault("extraData", "") +
                    "&message=" + data.get("message") +
                    "&orderId=" + data.get("orderId") +
                    "&orderInfo=" + data.get("orderInfo") +
                    "&orderType=" + data.get("orderType") +
                    "&partnerCode=" + data.get("partnerCode") +
                    "&payType=" + data.get("payType") +
                    "&requestId=" + data.get("requestId") +
                    "&responseTime=" + data.get("responseTime") +
                    "&resultCode=" + data.get("resultCode") +
                    "&transId=" + data.get("transId");
            
            String expectedSignature = createSignature(rawSignature);
            return expectedSignature.equals(signature);
            
        } catch (Exception e) {
            log.error("Error verifying MoMo signature", e);
            return false;
        }
    }
    
    @Override
    public String createSignature(String rawData) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            
            byte[] hash = sha256_HMAC.doFinal(rawData.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
            
        } catch (Exception e) {
            log.error("Error creating signature", e);
            throw new RuntimeException("Failed to create signature", e);
        }
    }
}
