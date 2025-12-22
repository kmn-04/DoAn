package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.entity.Booking;
import backend.entity.Booking.ConfirmationStatus;
import backend.entity.Booking.PaymentStatus;
import backend.entity.LoyaltyConfig;
import backend.entity.PointTransaction;
import backend.entity.PointTransaction.TransactionType;
import backend.repository.BookingRepository;
import backend.repository.LoyaltyConfigRepository;
import backend.repository.PointTransactionRepository;
import backend.service.LoyaltyService;
import backend.service.impl.BookingCompletionScheduler;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/loyalty")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Loyalty", description = "Admin APIs for loyalty program management")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminLoyaltyController extends BaseController {

    private final BookingCompletionScheduler scheduler;
    private final LoyaltyService loyaltyService;
    private final BookingRepository bookingRepository;
    private final LoyaltyConfigRepository configRepository;
    private final PointTransactionRepository transactionRepository;

    @PostMapping("/test-scheduler")
    public ResponseEntity<Map<String, Object>> testScheduler() {
        try {
            int completedCount = scheduler.manualTrigger();
            Map<String, Object> result = new HashMap<>();
            result.put("completedCount", completedCount);
            result.put("message", "Scheduler test completed successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error testing scheduler", e);
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @PostMapping("/award-points/{bookingId}")
    public ResponseEntity<Map<String, Object>> awardPointsForBooking(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getConfirmationStatus() != ConfirmationStatus.COMPLETED) {
                Map<String, Object> result = new HashMap<>();
                result.put("error", "Booking is not completed");
                return ResponseEntity.badRequest().body(result);
            }

            if (booking.getPaymentStatus() != PaymentStatus.PAID) {
                Map<String, Object> result = new HashMap<>();
                result.put("error", "Booking is not paid");
                return ResponseEntity.badRequest().body(result);
            }

            String tourType = booking.getTour().getTourType() != null 
                ? booking.getTour().getTourType().name() 
                : "DOMESTIC";

            PointTransaction transaction = loyaltyService.awardBookingPoints(
                booking.getUser().getId(),
                booking.getId(),
                booking.getFinalAmount(),
                tourType
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("pointsAwarded", transaction.getPoints());
            result.put("message", "Points awarded successfully");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error awarding points for booking {}", bookingId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @GetMapping("/booking-status/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBookingStatus(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

            Map<String, Object> result = new HashMap<>();
            result.put("bookingId", booking.getId());
            result.put("bookingCode", booking.getBookingCode());
            result.put("confirmationStatus", booking.getConfirmationStatus());
            result.put("paymentStatus", booking.getPaymentStatus());
            result.put("startDate", booking.getStartDate());
            result.put("finalAmount", booking.getFinalAmount());
            result.put("tourType", booking.getTour().getTourType());
            result.put("userId", booking.getUser().getId());
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error getting booking status {}", bookingId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    // ================================
    // CONFIG MANAGEMENT
    // ================================

    @GetMapping("/configs")
    @Operation(summary = "Get all loyalty configs", description = "Get all loyalty configuration settings")
    public ResponseEntity<ApiResponse<List<LoyaltyConfig>>> getAllConfigs() {
        try {
            List<LoyaltyConfig> configs = configRepository.findAll();
            return ResponseEntity.ok(success(configs));
        } catch (Exception e) {
            log.error("Error getting configs", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @GetMapping("/configs/{configKey}")
    @Operation(summary = "Get config by key", description = "Get loyalty config by key")
    public ResponseEntity<ApiResponse<LoyaltyConfig>> getConfigByKey(@PathVariable String configKey) {
        try {
            LoyaltyConfig config = configRepository.findByConfigKey(configKey)
                .orElseThrow(() -> new RuntimeException("Config not found: " + configKey));
            return ResponseEntity.ok(success(config));
        } catch (Exception e) {
            log.error("Error getting config {}", configKey, e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PutMapping("/configs/{configId}")
    @Operation(summary = "Update config", description = "Update loyalty configuration")
    public ResponseEntity<ApiResponse<LoyaltyConfig>> updateConfig(
            @PathVariable Long configId,
            @Valid @RequestBody UpdateConfigRequest request) {
        try {
            LoyaltyConfig config = configRepository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Config not found"));

            if (request.getConfigValue() != null) {
                config.setConfigValue(request.getConfigValue());
            }
            if (request.getDescription() != null) {
                config.setDescription(request.getDescription());
            }
            if (request.getIsActive() != null) {
                config.setIsActive(request.getIsActive());
            }
            config.setUpdatedAt(LocalDateTime.now());

            LoyaltyConfig saved = configRepository.save(config);
            log.info("Updated config {}: {}", configId, config.getConfigKey());
            return ResponseEntity.ok(success("Cập nhật cấu hình thành công", saved));
        } catch (Exception e) {
            log.error("Error updating config {}", configId, e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PostMapping("/configs")
    @Operation(summary = "Create config", description = "Create new loyalty configuration")
    public ResponseEntity<ApiResponse<LoyaltyConfig>> createConfig(
            @Valid @RequestBody CreateConfigRequest request) {
        try {
            if (configRepository.existsByConfigKey(request.getConfigKey())) {
                return ResponseEntity.badRequest().body(error("Config key already exists: " + request.getConfigKey()));
            }

            LoyaltyConfig config = new LoyaltyConfig();
            config.setConfigKey(request.getConfigKey());
            config.setConfigValue(request.getConfigValue());
            config.setConfigType(request.getConfigType());
            config.setDescription(request.getDescription());
            config.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

            LoyaltyConfig saved = configRepository.save(config);
            log.info("Created config: {}", request.getConfigKey());
            return ResponseEntity.ok(success("Tạo cấu hình thành công", saved));
        } catch (Exception e) {
            log.error("Error creating config", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    // ================================
    // TRANSACTION MANAGEMENT
    // ================================

    @GetMapping("/transactions")
    @Operation(summary = "Get transactions with filters", description = "Get point transactions with pagination and filters")
    public ResponseEntity<ApiResponse<PageResponse<PointTransaction>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Pageable pageable = createPageable(page, size, "createdAt", "desc");
            
            Page<PointTransaction> transactions;
            if (userId != null) {
                if (transactionType != null) {
                    transactions = transactionRepository.findByUserIdAndTransactionTypeOrderByCreatedAtDesc(
                        userId, transactionType, pageable);
                } else {
                    transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
                }
            } else {
                // If no filters, get all with pagination (need to add findAll with Pageable to repository)
                transactions = transactionRepository.findAll(pageable);
            }

            // Apply date range filter if provided (would need custom query for this)
            // For now, filter in memory (not ideal for large datasets)
            // TODO: Add proper JPA query for date range filtering

            return ResponseEntity.ok(successPage(transactions));
        } catch (Exception e) {
            log.error("Error getting transactions", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @GetMapping("/transactions/stats")
    @Operation(summary = "Get transaction statistics", description = "Get statistics about point transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactionStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Total transactions
            long totalTransactions = transactionRepository.count();
            stats.put("totalTransactions", totalTransactions);
            
            // Count by type
            long earnedCount = transactionRepository.countByTransactionType(TransactionType.EARNED);
            long redeemedCount = transactionRepository.countByTransactionType(TransactionType.REDEEMED);
            long expiredCount = transactionRepository.countByTransactionType(TransactionType.EXPIRED);
            
            stats.put("earnedCount", earnedCount);
            stats.put("redeemedCount", redeemedCount);
            stats.put("expiredCount", expiredCount);
            
            // Total points earned/redeemed
            Integer totalEarned = transactionRepository.getTotalEarnedSum();
            Integer totalRedeemed = transactionRepository.getTotalRedeemedSum();
            
            stats.put("totalPointsEarned", totalEarned != null ? totalEarned : 0);
            stats.put("totalPointsRedeemed", totalRedeemed != null ? totalRedeemed : 0);
            
            return ResponseEntity.ok(success(stats));
        } catch (Exception e) {
            log.error("Error getting transaction stats", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    // ================================
    // REQUEST/RESPONSE CLASSES
    // ================================

    @Data
    public static class UpdateConfigRequest {
        private String configValue;
        private String description;
        private Boolean isActive;
    }

    @Data
    public static class CreateConfigRequest {
        private String configKey;
        private String configValue;
        private LoyaltyConfig.ConfigType configType;
        private String description;
        private Boolean isActive;
    }
}
