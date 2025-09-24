package backend.service;

import backend.entity.Booking;
import backend.entity.Payment;
import backend.entity.Payment.PaymentStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentService {
    
    /**
     * Create a new payment record
     */
    Payment createPayment(Booking booking, BigDecimal amount, String paymentMethod, String transactionId);
    
    /**
     * Update payment status
     */
    Payment updatePaymentStatus(String transactionId, PaymentStatus status);
    
    /**
     * Find payment by transaction ID
     */
    Optional<Payment> findByTransactionId(String transactionId);
    
    /**
     * Find payments by booking ID
     */
    List<Payment> findByBookingId(Long bookingId);
    
    /**
     * Find payments by user ID
     */
    List<Payment> findByUserId(Long userId);
    
    /**
     * Process successful payment - update payment and booking status
     */
    Payment processSuccessfulPayment(String transactionId, Booking booking);
    
    /**
     * Process failed payment
     */
    Payment processFailedPayment(String transactionId, String failureReason);
    
    /**
     * Check if booking is fully paid
     */
    boolean isBookingFullyPaid(Long bookingId);
    
    /**
     * Get total paid amount for booking
     */
    BigDecimal getTotalPaidAmount(Long bookingId);
}
