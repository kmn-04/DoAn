package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.entity.LoyaltyPoints;
import backend.entity.PointTransaction;
import backend.entity.PointVoucher;
import backend.service.LoyaltyService;
import backend.service.PointVoucherService;
import backend.service.ReferralService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Loyalty Program", description = "APIs for loyalty points and rewards management")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class LoyaltyController extends BaseController {
    
    private final LoyaltyService loyaltyService;
    private final PointVoucherService voucherService;
    private final ReferralService referralService;
    
    // ================================
    // USER ENDPOINTS - LOYALTY POINTS
    // ================================
    
    @GetMapping("/points")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get user loyalty points", description = "Get current user's loyalty points and level")
    public ResponseEntity<ApiResponse<LoyaltyPoints>> getLoyaltyPoints(Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            LoyaltyPoints loyaltyPoints = loyaltyService.getOrCreateLoyaltyPoints(userDetails.getId());
            return ResponseEntity.ok(success(loyaltyPoints));
        } catch (Exception e) {
            log.error("Error getting loyalty points", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get loyalty statistics", description = "Get user's loyalty statistics and progress")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLoyaltyStats(Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            Map<String, Object> stats = loyaltyService.getUserLoyaltyStats(userDetails.getId());
            return ResponseEntity.ok(success(stats));
        } catch (Exception e) {
            log.error("Error getting loyalty stats", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get transaction history", description = "Get user's points transaction history")
    public ResponseEntity<ApiResponse<PageResponse<PointTransaction>>> getTransactionHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            Pageable pageable = createPageable(page, size);
            Page<PointTransaction> transactions = loyaltyService.getTransactionHistory(userDetails.getId(), pageable);
            return ResponseEntity.ok(successPage(transactions));
        } catch (Exception e) {
            log.error("Error getting transaction history", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/transactions/recent")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get recent transactions", description = "Get user's recent transactions")
    public ResponseEntity<ApiResponse<List<PointTransaction>>> getRecentTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            List<PointTransaction> transactions = loyaltyService.getRecentTransactions(userDetails.getId(), limit);
            return ResponseEntity.ok(success(transactions));
        } catch (Exception e) {
            log.error("Error getting recent transactions", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    // ================================
    // USER ENDPOINTS - VOUCHERS
    // ================================
    
    @GetMapping("/vouchers")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get user vouchers", description = "Get all vouchers owned by user")
    public ResponseEntity<ApiResponse<List<PointVoucher>>> getUserVouchers(Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            List<PointVoucher> vouchers = voucherService.getUserVouchers(userDetails.getId());
            return ResponseEntity.ok(success(vouchers));
        } catch (Exception e) {
            log.error("Error getting user vouchers", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/vouchers/active")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get active vouchers", description = "Get user's active vouchers")
    public ResponseEntity<ApiResponse<List<PointVoucher>>> getActiveVouchers(Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            List<PointVoucher> vouchers = voucherService.getActiveVouchers(userDetails.getId());
            return ResponseEntity.ok(success(vouchers));
        } catch (Exception e) {
            log.error("Error getting active vouchers", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/redemption-options")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get redemption options", description = "Get available point redemption options")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRedemptionOptions(
            Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            List<Map<String, Object>> options = voucherService.getRedemptionOptions(userDetails.getId());
            return ResponseEntity.ok(success(options));
        } catch (Exception e) {
            log.error("Error getting redemption options", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @PostMapping("/redeem")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Redeem points for voucher", description = "Exchange points for discount voucher")
    public ResponseEntity<ApiResponse<PointVoucher>> redeemPoints(
            Authentication authentication,
            @Valid @RequestBody RedeemRequest request) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            PointVoucher voucher = voucherService.redeemPointsForVoucher(
                userDetails.getId(),
                request.getPoints(),
                request.getVoucherValue(),
                request.getValidDays()
            );
            return ResponseEntity.ok(success("Đổi điểm thành công!", voucher));
        } catch (Exception e) {
            log.error("Error redeeming points", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @PostMapping("/vouchers/{voucherId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Cancel voucher", description = "Cancel voucher and refund points")
    public ResponseEntity<ApiResponse<String>> cancelVoucher(
            Authentication authentication,
            @PathVariable Long voucherId) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            voucherService.cancelVoucher(voucherId, userDetails.getId());
            return ResponseEntity.ok(success("Đã hủy voucher và hoàn điểm"));
        } catch (Exception e) {
            log.error("Error cancelling voucher", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/vouchers/validate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Validate voucher", description = "Check if voucher is valid for booking")
    public ResponseEntity<ApiResponse<VoucherValidationResponse>> validateVoucher(
            Authentication authentication,
            @RequestParam String voucherCode,
            @RequestParam BigDecimal bookingAmount) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            boolean isValid = voucherService.validateVoucher(voucherCode, userDetails.getId(), bookingAmount);
            
            VoucherValidationResponse response = new VoucherValidationResponse();
            response.setValid(isValid);
            
            if (isValid) {
                BigDecimal discount = voucherService.calculateVoucherDiscount(voucherCode, bookingAmount);
                response.setDiscount(discount);
            }
            
            return ResponseEntity.ok(success(response));
        } catch (Exception e) {
            log.error("Error validating voucher", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    // ================================
    // USER ENDPOINTS - REFERRAL
    // ================================
    
    @GetMapping("/referral/code")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get referral code", description = "Get user's referral code")
    public ResponseEntity<ApiResponse<ReferralCodeResponse>> getReferralCode(Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            String referralCode = referralService.getUserReferralCode(userDetails.getId());
            
            ReferralCodeResponse response = new ReferralCodeResponse();
            response.setReferralCode(referralCode);
            response.setReferralLink("http://localhost:3000/register?ref=" + referralCode);
            
            return ResponseEntity.ok(success(response));
        } catch (Exception e) {
            log.error("Error getting referral code", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/referral/stats")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get referral statistics", description = "Get user's referral statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReferralStats(Authentication authentication) {
        try {
            backend.security.UserDetailsImpl userDetails = (backend.security.UserDetailsImpl) authentication.getPrincipal();
            Map<String, Object> stats = referralService.getReferralStats(userDetails.getId());
            return ResponseEntity.ok(success(stats));
        } catch (Exception e) {
            log.error("Error getting referral stats", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    // ================================
    // ADMIN ENDPOINTS
    // ================================
    
    @GetMapping("/admin/top-users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get top users by points", description = "Get users with highest points (Admin only)")
    public ResponseEntity<ApiResponse<List<LoyaltyPoints>>> getTopUsers(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<LoyaltyPoints> topUsers = loyaltyService.getTopUsersByPoints(limit);
            return ResponseEntity.ok(success(topUsers));
        } catch (Exception e) {
            log.error("Error getting top users", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @PostMapping("/admin/users/{userId}/points")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Adjust user points", description = "Manually add/deduct points (Admin only)")
    public ResponseEntity<ApiResponse<PointTransaction>> adjustPoints(
            @PathVariable Long userId,
            @Valid @RequestBody AdjustPointsRequest request) {
        try {
            PointTransaction transaction;
            if (request.getPoints() > 0) {
                transaction = loyaltyService.addPoints(
                    userId,
                    request.getPoints(),
                    PointTransaction.SourceType.ADMIN,
                    null,
                    request.getReason()
                );
            } else {
                transaction = loyaltyService.deductPoints(
                    userId,
                    Math.abs(request.getPoints()),
                    PointTransaction.SourceType.ADMIN,
                    null,
                    request.getReason()
                );
            }
            return ResponseEntity.ok(success("Đã điều chỉnh điểm", transaction));
        } catch (Exception e) {
            log.error("Error adjusting points", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    // ================================
    // REQUEST/RESPONSE CLASSES
    // ================================
    
    @Data
    public static class RedeemRequest {
        private Integer points;
        private BigDecimal voucherValue;
        private Integer validDays;
    }
    
    @Data
    public static class VoucherValidationResponse {
        private Boolean valid;
        private BigDecimal discount;
    }
    
    @Data
    public static class ReferralCodeResponse {
        private String referralCode;
        private String referralLink;
    }
    
    @Data
    public static class AdjustPointsRequest {
        private Integer points;
        private String reason;
    }
}

