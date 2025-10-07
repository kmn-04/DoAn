package backend.service.impl;

import backend.entity.Booking;
import backend.entity.Notification;
import backend.entity.Payment;
import backend.entity.Payment.PaymentStatus;
import backend.repository.PaymentRepository;
import backend.repository.BookingRepository;
import backend.service.NotificationService;
import backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    
    @Override
    @Transactional
    public Payment createPayment(Booking booking, BigDecimal amount, String paymentMethod, String transactionId) {
        log.info("Creating payment record for booking: {} with amount: {}", booking.getBookingCode(), amount);
        
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setStatus(PaymentStatus.Pending);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("✅ Created payment record with ID: {} for transaction: {}", savedPayment.getId(), transactionId);
        
        return savedPayment;
    }
    
    @Override
    @Transactional
    public Payment updatePaymentStatus(String transactionId, PaymentStatus status) {
        log.info("Updating payment status for transaction: {} to: {}", transactionId, status);
        
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(transactionId);
        if (paymentOpt.isEmpty()) {
            log.error("❌ Payment not found for transaction ID: {}", transactionId);
            throw new RuntimeException("Payment not found for transaction ID: " + transactionId);
        }
        
        Payment payment = paymentOpt.get();
        payment.setStatus(status);
        payment.setUpdatedAt(LocalDateTime.now());
        
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("✅ Updated payment status to: {} for transaction: {}", status, transactionId);
        
        // Send notification based on payment status
        sendPaymentNotification(updatedPayment);
        
        return updatedPayment;
    }
    
    @Override
    public Optional<Payment> findByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }
    
    @Override
    public List<Payment> findByBookingId(Long bookingId) {
        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }
    
    @Override
    public List<Payment> findByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
    
    @Override
    @Transactional
    public Payment processSuccessfulPayment(String transactionId, Booking booking) {
        log.info("Processing successful payment for transaction: {} and booking: {}", transactionId, booking.getBookingCode());
        
        // Update payment status
        Payment payment = updatePaymentStatus(transactionId, PaymentStatus.Completed);
        
        // Update booking payment status to PAID
        booking.setPaymentStatus(Booking.PaymentStatus.Paid);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        
        log.info("✅ Successfully processed payment - Booking: {} is now PAID", booking.getBookingCode());
        
        return payment;
    }
    
    @Override
    @Transactional
    public Payment processFailedPayment(String transactionId, String failureReason) {
        log.info("Processing failed payment for transaction: {} - Reason: {}", transactionId, failureReason);
        
        // Update payment status to Failed
        Payment payment = updatePaymentStatus(transactionId, PaymentStatus.Failed);
        
        // Reset booking payment status back to Unpaid if it's not Paid
        Booking booking = payment.getBooking();
        if (booking != null && booking.getPaymentStatus() != Booking.PaymentStatus.Paid) {
            log.info("Resetting booking: {} back to UNPAID payment status", booking.getBookingCode());
            booking.setPaymentStatus(Booking.PaymentStatus.Unpaid);
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            log.info("✅ Booking: {} reset to UNPAID - User can retry payment", booking.getBookingCode());
        }
        
        log.info("✅ Marked payment as FAILED for transaction: {}", transactionId);
        
        return payment;
    }
    
    @Override
    public boolean isBookingFullyPaid(Long bookingId) {
        List<Payment> successfulPayments = paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.Completed);
        
        if (successfulPayments.isEmpty()) {
            return false;
        }
        
        // Get booking
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return false;
        }
        
        Booking booking = bookingOpt.get();
        BigDecimal totalPaid = getTotalPaidAmount(bookingId);
        
        // Check if total paid amount >= booking total price
        return totalPaid.compareTo(booking.getTotalPrice()) >= 0;
    }
    
    @Override
    public BigDecimal getTotalPaidAmount(Long bookingId) {
        List<Payment> successfulPayments = paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.Completed);
        
        return successfulPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // ==================== NOTIFICATION HELPERS ====================
    
    /**
     * Send notification based on payment status
     */
    private void sendPaymentNotification(Payment payment) {
        try {
            Booking booking = payment.getBooking();
            Long userId = booking.getUser().getId();
            String link = "/bookings/" + booking.getId();
            
            NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(Locale.of("vi", "VN"));
            String formattedAmount = currencyFormatter.format(payment.getAmount());
            
            switch (payment.getStatus()) {
                case Completed:
                    // Success notification
                    notificationService.createNotificationForUser(
                        userId,
                        "Thanh toán thành công",
                        String.format("Thanh toán %s cho booking %s đã được xác nhận. Cảm ơn bạn!", 
                            formattedAmount, booking.getBookingCode()),
                        Notification.NotificationType.Success,
                        link
                    );
                    log.info("Sent payment success notification for payment ID: {}", payment.getId());
                    break;
                    
                case Failed:
                    // Error notification
                    notificationService.createNotificationForUser(
                        userId,
                        "Thanh toán thất bại",
                        String.format("Thanh toán %s cho booking %s không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.", 
                            formattedAmount, booking.getBookingCode()),
                        Notification.NotificationType.Error,
                        link
                    );
                    log.info("Sent payment failed notification for payment ID: {}", payment.getId());
                    break;
                    
                case Pending:
                    // Warning notification
                    notificationService.createNotificationForUser(
                        userId,
                        "Chờ xác nhận thanh toán",
                        String.format("Thanh toán %s cho booking %s đang chờ xác nhận. Chúng tôi sẽ thông báo khi có kết quả.", 
                            formattedAmount, booking.getBookingCode()),
                        Notification.NotificationType.Warning,
                        link
                    );
                    log.info("Sent payment pending notification for payment ID: {}", payment.getId());
                    break;
                    
                case Refunded:
                    // Success notification for refund
                    notificationService.createNotificationForUser(
                        userId,
                        "Hoàn tiền thành công",
                        String.format("Đã hoàn %s vào tài khoản của bạn cho booking %s.", 
                            formattedAmount, booking.getBookingCode()),
                        Notification.NotificationType.Success,
                        link
                    );
                    log.info("Sent refund notification for payment ID: {}", payment.getId());
                    break;
                    
                default:
                    log.debug("No notification sent for payment status: {}", payment.getStatus());
            }
        } catch (Exception e) {
            log.error("Failed to send payment notification for payment ID: {}", payment.getId(), e);
        }
    }
}
