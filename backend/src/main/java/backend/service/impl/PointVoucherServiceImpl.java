package backend.service.impl;

import backend.entity.Booking;
import backend.entity.PointVoucher;
import backend.entity.PointVoucher.VoucherStatus;
import backend.entity.PointVoucher.VoucherType;
import backend.entity.PointTransaction.SourceType;
import backend.entity.User;
import backend.repository.BookingRepository;
import backend.repository.LoyaltyConfigRepository;
import backend.repository.PointVoucherRepository;
import backend.repository.UserRepository;
import backend.service.LoyaltyService;
import backend.service.PointVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PointVoucherServiceImpl implements PointVoucherService {
    
    private final PointVoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final LoyaltyService loyaltyService;
    private final LoyaltyConfigRepository configRepository;
    private final backend.service.EmailService emailService;
    
    @Override
    public PointVoucher redeemPointsForVoucher(Long userId, Integer points,
                                                BigDecimal voucherValue, Integer validDays) {
        if (points == null || points <= 0) {
            throw new RuntimeException("Số điểm không hợp lệ");
        }

        // Check minimum points
        int minPoints = Integer.parseInt(getConfigValue("min_redeem_points", "1000"));
        if (points < minPoints) {
            throw new RuntimeException("Số điểm tối thiểu để đổi là " + minPoints);
        }

        // Derive voucher value if not provided: default rate = 50đ/điểm (1000 pts = 50k)
        if (voucherValue == null) {
            BigDecimal valuePerPoint = new BigDecimal(getConfigValue("voucher_value_per_point", "50"));
            voucherValue = valuePerPoint.multiply(BigDecimal.valueOf(points));
        }
        
        // Deduct points
        String description = String.format("Đổi %d điểm lấy voucher %s VND", 
            points, voucherValue.toString());
        loyaltyService.deductPoints(userId, points, SourceType.PROMOTION, null, description);
        
        // Create voucher
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        PointVoucher voucher = new PointVoucher();
        voucher.setUser(user);
        voucher.setVoucherCode(generateVoucherCode());
        voucher.setVoucherType(VoucherType.AMOUNT);
        voucher.setVoucherValue(voucherValue);
        voucher.setPointsCost(points);
        BigDecimal minOrder = new BigDecimal(getConfigValue("voucher_min_order_value", "0"));
        voucher.setMinOrderValue(minOrder);
        voucher.setStatus(VoucherStatus.ACTIVE);
        
        // Set expiry date
        if (validDays == null) {
            int defaultDays = Integer.parseInt(getConfigValue("voucher_expiry_months", "6")) * 30;
            validDays = defaultDays;
        }
        voucher.setExpiresAt(LocalDate.now().plusDays(validDays));
        
        PointVoucher savedVoucher = voucherRepository.save(voucher);
        
        // Send email notification for voucher redeemed
        try {
            emailService.sendVoucherRedeemedEmail(
                user,
                savedVoucher.getVoucherCode(),
                points,
                voucherValue.doubleValue()
            );
        } catch (Exception e) {
            log.error("Failed to send voucher redeemed email", e);
        }
        
        log.info("User {} redeemed {} points for voucher {}", userId, points, savedVoucher.getVoucherCode());
        
        return savedVoucher;
    }
    
    @Override
    public PointVoucher getVoucherByCode(String voucherCode) {
        // Use fetch join to avoid lazy loading issues
        return voucherRepository.findByVoucherCodeWithUser(voucherCode)
            .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
    }
    
    @Override
    public List<PointVoucher> getUserVouchers(Long userId) {
        return voucherRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public Page<PointVoucher> getUserVouchers(Long userId, Pageable pageable) {
        return voucherRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    @Override
    public List<PointVoucher> getActiveVouchers(Long userId) {
        return voucherRepository.findActiveVouchersByUserId(userId, LocalDate.now());
    }
    
    @Override
    public PointVoucher useVoucher(String voucherCode, Long userId, Long bookingId) {
        // Use query with user ID to avoid lazy loading and ownership issues
        PointVoucher voucher = voucherRepository.findByVoucherCodeAndUserId(voucherCode, userId)
            .orElseThrow(() -> new RuntimeException("Voucher không tồn tại hoặc không thuộc về bạn"));
        
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new RuntimeException("Voucher không còn hiệu lực");
        }
        
        if (voucher.getExpiresAt().isBefore(LocalDate.now())) {
            throw new RuntimeException("Voucher đã hết hạn");
        }
        
        // Mark voucher as used
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        voucher.setStatus(VoucherStatus.USED);
        voucher.setBooking(booking);
        voucher.setUsedAt(LocalDateTime.now());
        
        PointVoucher savedVoucher = voucherRepository.save(voucher);
        
        log.info("Voucher {} used by user {} for booking {}", voucherCode, userId, bookingId);
        
        return savedVoucher;
    }
    
    @Override
    public boolean validateVoucher(String voucherCode, Long userId, BigDecimal bookingAmount) {
        // Use fetch join to avoid lazy loading issues
        Optional<PointVoucher> voucherOpt = voucherRepository.findByVoucherCodeWithUser(voucherCode);
        
        if (voucherOpt.isEmpty()) {
            return false;
        }
        
        PointVoucher voucher = voucherOpt.get();
        
        // Check ownership
        if (!voucher.getUser().getId().equals(userId)) {
            return false;
        }
        
        // Check status
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            return false;
        }
        
        // Check expiry
        if (voucher.getExpiresAt().isBefore(LocalDate.now())) {
            return false;
        }
        
        // Check minimum order value
        if (bookingAmount.compareTo(voucher.getMinOrderValue()) < 0) {
            return false;
        }
        
        return true;
    }
    
    @Override
    public BigDecimal calculateVoucherDiscount(String voucherCode, BigDecimal bookingAmount) {
        PointVoucher voucher = getVoucherByCode(voucherCode);
        
        if (voucher.getVoucherType() == VoucherType.AMOUNT) {
            return voucher.getVoucherValue().min(bookingAmount);
        } else { // PERCENTAGE
            BigDecimal discount = bookingAmount
                .multiply(voucher.getVoucherValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            if (voucher.getMaxDiscount() != null) {
                discount = discount.min(voucher.getMaxDiscount());
            }
            
            return discount;
        }
    }
    
    @Override
    public void processExpiredVouchers() {
        LocalDate today = LocalDate.now();
        List<PointVoucher> expiredVouchers = voucherRepository.findExpiredVouchers(today);
        
        for (PointVoucher voucher : expiredVouchers) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            log.info("Voucher {} expired", voucher.getVoucherCode());
        }
        
        log.info("Processed {} expired vouchers", expiredVouchers.size());
    }
    
    @Override
    public void cancelVoucher(Long voucherId, Long userId) {
        PointVoucher voucher = voucherRepository.findById(voucherId)
            .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        if (!voucher.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new RuntimeException("Voucher cannot be cancelled");
        }
        
        voucher.setStatus(VoucherStatus.CANCELLED);
        voucherRepository.save(voucher);
        
        // Refund points
        loyaltyService.addPoints(userId, voucher.getPointsCost(),
            SourceType.ADMIN, voucherId,
            "Hoàn điểm từ voucher đã hủy");
        
        log.info("Voucher {} cancelled by user {}", voucherId, userId);
    }
    
    @Override
    public List<Map<String, Object>> getRedemptionOptions(Long userId) {
        List<Map<String, Object>> options = new ArrayList<>();
        
        // Common redemption options
        int[][] optionValues = {
            {1000, 50000},   // 1000 points = 50k
            {2000, 100000},  // 2000 points = 100k
            {5000, 250000},  // 5000 points = 250k
            {10000, 500000}, // 10000 points = 500k
            {20000, 1000000} // 20000 points = 1M
        };
        
        for (int[] option : optionValues) {
            Map<String, Object> redemption = new HashMap<>();
            redemption.put("points", option[0]);
            redemption.put("value", option[1]);
            redemption.put("name", String.format("Voucher %,d VND", option[1]));
            options.add(redemption);
        }
        
        return options;
    }
    
    @Override
    public String generateVoucherCode() {
        String code;
        do {
            code = "PV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (voucherRepository.existsByVoucherCode(code));
        
        return code;
    }
    
    private String getConfigValue(String key, String defaultValue) {
        return configRepository.getConfigValue(key).orElse(defaultValue);
    }
}

