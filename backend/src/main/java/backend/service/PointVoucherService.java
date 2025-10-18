package backend.service;

import backend.entity.PointVoucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface PointVoucherService {
    
    /**
     * Create voucher from points
     */
    PointVoucher redeemPointsForVoucher(Long userId, Integer points, 
                                         BigDecimal voucherValue, Integer validDays);
    
    /**
     * Get voucher by code
     */
    PointVoucher getVoucherByCode(String voucherCode);
    
    /**
     * Get user's vouchers
     */
    List<PointVoucher> getUserVouchers(Long userId);
    
    /**
     * Get user's vouchers with pagination
     */
    Page<PointVoucher> getUserVouchers(Long userId, Pageable pageable);
    
    /**
     * Get active vouchers for user
     */
    List<PointVoucher> getActiveVouchers(Long userId);
    
    /**
     * Use voucher for booking
     */
    PointVoucher useVoucher(String voucherCode, Long userId, Long bookingId);
    
    /**
     * Validate voucher for booking
     */
    boolean validateVoucher(String voucherCode, Long userId, BigDecimal bookingAmount);
    
    /**
     * Calculate discount from voucher
     */
    BigDecimal calculateVoucherDiscount(String voucherCode, BigDecimal bookingAmount);
    
    /**
     * Process expired vouchers
     */
    void processExpiredVouchers();
    
    /**
     * Cancel voucher
     */
    void cancelVoucher(Long voucherId, Long userId);
    
    /**
     * Get available redemption options
     */
    java.util.List<java.util.Map<String, Object>> getRedemptionOptions(Long userId);
    
    /**
     * Generate unique voucher code
     */
    String generateVoucherCode();
}

