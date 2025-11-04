package backend.service;

import backend.dto.request.VnPayPaymentRequest;
import backend.dto.response.VnPayPaymentResponse;
import backend.entity.Booking;
import backend.entity.Payment;
import backend.exception.ResourceNotFoundException;
import backend.repository.BookingRepository;
import backend.repository.PaymentRepository;
import backend.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {
    
    private final VnPayUtil vnPayUtil;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    
    @Transactional
    public VnPayPaymentResponse createPaymentUrl(VnPayPaymentRequest request, String ipAddress) {
        log.info("Creating VNPay payment URL for booking: {}, amount: {}", 
                request.getBookingId(), request.getAmount());
        
        // Lấy thông tin booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));
        
        // Kiểm tra booking status
        if (booking.getPaymentStatus() == Booking.PaymentStatus.PAID) {
            throw new IllegalStateException("Booking has already been paid");
        }
        
        // Tạo payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod("VNPay");
        payment.setPaymentProvider("VNPay");
        payment.setPaymentCode("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        String orderInfo = request.getOrderInfo() != null ? 
                request.getOrderInfo() : 
                "Thanh toan tour " + booking.getBookingCode();
        payment.setPaymentNote(orderInfo);
        
        payment = paymentRepository.save(payment);
        
        log.info("Created payment record: {}", payment.getId());
        
        // Tạo URL thanh toán VNPay
        String paymentUrl = vnPayUtil.createOrderUrl(
                payment.getId(), 
                request.getAmount(), 
                orderInfo,
                ipAddress
        );
        
        log.info("Generated VNPay payment URL for payment: {}", payment.getId());
        
        return VnPayPaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .orderId(payment.getId().toString())
                .message("Payment URL created successfully")
                .build();
    }
    
    @Transactional
    public VnPayPaymentResponse handlePaymentReturn(Map<String, String> params) {
        log.info("Handling VNPay payment return with params: {}", params);
        
        // Validate signature
        if (!vnPayUtil.validateSignature(params)) {
            log.error("Invalid VNPay signature");
            throw new IllegalArgumentException("Invalid payment signature");
        }
        
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTxnRef = params.get("vnp_TxnRef"); // Payment ID
        String vnpTransactionNo = params.get("vnp_TransactionNo");
        String vnpAmount = params.get("vnp_Amount");
        String vnpBankCode = params.get("vnp_BankCode");
        String vnpPayDate = params.get("vnp_PayDate");
        
        log.info("Payment response - Code: {}, TxnRef: {}, TransactionNo: {}", 
                vnpResponseCode, vnpTxnRef, vnpTransactionNo);
        
        // Lấy payment record
        Payment payment = paymentRepository.findById(Long.parseLong(vnpTxnRef))
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", vnpTxnRef));
        
        Booking booking = payment.getBooking();
        
        VnPayPaymentResponse response = new VnPayPaymentResponse();
        response.setOrderId(payment.getId().toString());
        response.setTransactionNo(vnpTransactionNo);
        
        if ("00".equals(vnpResponseCode)) {
            // Thanh toán thành công
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setProviderTransactionId(vnpTransactionNo);
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId("VNP-" + vnpTransactionNo);
            
            // Cập nhật trạng thái booking - CHỈ cập nhật paymentStatus, giữ nguyên confirmationStatus để admin xác nhận
            booking.setPaymentStatus(Booking.PaymentStatus.PAID);
            // Không thay đổi confirmationStatus - vẫn giữ là Pending để chờ admin xác nhận
            
            response.setMessage("Payment successful");
            
            log.info("✅ Payment successful for booking: {}, payment: {}, transaction: {}", 
                    booking.getBookingCode(), payment.getId(), vnpTransactionNo);
            
            // 📧 Send payment success email
            try {
                String userEmail = booking.getUser().getEmail();
                String tourName = booking.getTour().getName();
                String amount = String.format("%,.0f", payment.getAmount());
                
                emailService.sendPaymentSuccessEmail(
                    userEmail,
                    booking.getBookingCode(),
                    tourName,
                    amount,
                    "VNPay - " + vnpBankCode
                );
                
                log.info("📧 Payment success email sent to: {}", userEmail);
            } catch (Exception e) {
                log.error("Failed to send payment success email: {}", e.getMessage());
            }
        } else {
            // Thanh toán thất bại
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setPaymentNote("Payment failed with code: " + vnpResponseCode);
            
            response.setMessage("Payment failed with code: " + vnpResponseCode);
            
            log.error("❌ Payment failed for payment: {}, response code: {}", 
                    payment.getId(), vnpResponseCode);
        }
        
        paymentRepository.save(payment);
        bookingRepository.save(booking);
        
        return response;
    }
    
    /**
     * Get VNPay response code meaning
     */
    public String getResponseCodeMessage(String responseCode) {
        return switch (responseCode) {
            case "00" -> "Giao dịch thành công";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)";
            case "09" -> "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng";
            case "10" -> "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11" -> "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch";
            case "12" -> "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa";
            case "13" -> "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)";
            case "24" -> "Giao dịch không thành công do: Khách hàng hủy giao dịch";
            case "51" -> "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch";
            case "65" -> "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày";
            case "75" -> "Ngân hàng thanh toán đang bảo trì";
            case "79" -> "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định";
            default -> "Giao dịch thất bại";
        };
    }
}

