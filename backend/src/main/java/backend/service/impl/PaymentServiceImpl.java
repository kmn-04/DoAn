package backend.service.impl;

import backend.entity.Booking;
import backend.entity.Payment;
import backend.entity.Payment.PaymentStatus;
import backend.repository.PaymentRepository;
import backend.repository.BookingRepository;
import backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    
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
        
        // Update booking status to PAID
        booking.setStatus(Booking.BookingStatus.Paid);
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
        
        // Reset booking status back to Pending if it's not Paid
        Booking booking = payment.getBooking();
        if (booking != null && booking.getStatus() != Booking.BookingStatus.Paid) {
            log.info("Resetting booking: {} back to PENDING status", booking.getBookingCode());
            booking.setStatus(Booking.BookingStatus.Pending);
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);
            log.info("✅ Booking: {} reset to PENDING - User can retry payment", booking.getBookingCode());
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
}
