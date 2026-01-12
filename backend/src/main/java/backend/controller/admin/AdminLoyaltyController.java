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
import backend.repository.LoyaltyPointsRepository;
import backend.repository.PointTransactionRepository;
import backend.service.ExportService;
import backend.service.LoyaltyService;
import backend.service.impl.BookingCompletionScheduler;
import backend.entity.LoyaltyPoints;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final ExportService exportService;

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
            
            // Parse date range if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            boolean hasDateRange = false;
            
            if (startDate != null && !startDate.trim().isEmpty()) {
                try {
                    startDateTime = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    hasDateRange = true;
                } catch (DateTimeParseException e) {
                    // Try parsing as date only (set to start of day)
                    try {
                        startDateTime = java.time.LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE)
                            .atStartOfDay();
                        hasDateRange = true;
                    } catch (DateTimeParseException ex) {
                        log.warn("Invalid startDate format: {}", startDate);
                    }
                }
            }
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                try {
                    endDateTime = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    hasDateRange = true;
                } catch (DateTimeParseException e) {
                    // Try parsing as date only (set to end of day)
                    try {
                        endDateTime = java.time.LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE)
                            .atTime(23, 59, 59);
                        hasDateRange = true;
                    } catch (DateTimeParseException ex) {
                        log.warn("Invalid endDate format: {}", endDate);
                    }
                }
            }
            
            // Validate date range
            if (hasDateRange && startDateTime != null && endDateTime != null && startDateTime.isAfter(endDateTime)) {
                return ResponseEntity.badRequest().body(error("Start date must be before end date"));
            }
            
            // If date range is provided but only one date, set default for the other
            if (startDateTime != null && endDateTime == null) {
                endDateTime = LocalDateTime.now();
            }
            if (endDateTime != null && startDateTime == null) {
                // Default to 1 year ago if only end date provided
                startDateTime = endDateTime.minusYears(1);
            }
            
            Page<PointTransaction> transactions;
            
            // Use date range queries if date range is provided
            if (hasDateRange && startDateTime != null && endDateTime != null) {
                if (userId != null) {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByUserIdAndTransactionTypeAndDateRange(
                            userId, transactionType, startDateTime, endDateTime, pageable);
                    } else {
                        transactions = transactionRepository.findByUserIdAndDateRange(
                            userId, startDateTime, endDateTime, pageable);
                    }
                } else {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByTransactionTypeAndDateRange(
                            transactionType, startDateTime, endDateTime, pageable);
                    } else {
                        transactions = transactionRepository.findByDateRange(
                            startDateTime, endDateTime, pageable);
                    }
                }
            } else {
                // No date range - use existing queries
                if (userId != null) {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByUserIdAndTransactionTypeOrderByCreatedAtDesc(
                            userId, transactionType, pageable);
                    } else {
                        transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
                    }
                } else {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByTransactionTypeOrderByCreatedAtDesc(
                            transactionType, pageable);
                    } else {
                        transactions = transactionRepository.findAll(pageable);
                    }
                }
            }

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
    // ANALYTICS & EXPORT
    // ================================
    
    @GetMapping("/analytics/monthly")
    @Operation(summary = "Get monthly analytics", description = "Get earned/redeemed/expired points by month")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMonthlyAnalytics(
            @RequestParam(defaultValue = "12") int months) {
        try {
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusMonths(months);
            
            List<Map<String, Object>> analytics = new java.util.ArrayList<>();
            
            // Group by month
            for (int i = months - 1; i >= 0; i--) {
                LocalDateTime monthStart = endDate.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
                
                // Get transactions for this month
                List<PointTransaction> monthTransactions = transactionRepository.findByDateRange(
                    monthStart, monthEnd, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                ).getContent();
                
                int earned = monthTransactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.EARNED)
                    .mapToInt(PointTransaction::getPoints)
                    .sum();
                
                int redeemed = monthTransactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.REDEEMED)
                    .mapToInt(tx -> Math.abs(tx.getPoints()))
                    .sum();
                
                int expired = monthTransactions.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.EXPIRED)
                    .mapToInt(tx -> Math.abs(tx.getPoints()))
                    .sum();
                
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MM/yyyy")));
                monthData.put("monthLabel", getVietnameseMonthName(monthStart.getMonthValue()) + " " + monthStart.getYear());
                monthData.put("earned", earned);
                monthData.put("redeemed", redeemed);
                monthData.put("expired", expired);
                monthData.put("net", earned - redeemed - expired);
                
                analytics.add(monthData);
            }
            
            return ResponseEntity.ok(success(analytics));
        } catch (Exception e) {
            log.error("Error getting monthly analytics", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/top-users")
    @Operation(summary = "Get top users by points", description = "Get users with highest points balance")
    public ResponseEntity<ApiResponse<List<LoyaltyPoints>>> getTopUsers(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<LoyaltyPoints> topUsers = loyaltyPointsRepository.findTopByPointsBalance();
            // Limit results
            if (topUsers.size() > limit) {
                topUsers = topUsers.subList(0, limit);
            }
            return ResponseEntity.ok(success(topUsers));
        } catch (Exception e) {
            log.error("Error getting top users", e);
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/transactions/export/{format}")
    @Operation(summary = "Export transactions", description = "Export point transactions to CSV or Excel")
    public ResponseEntity<byte[]> exportTransactions(
            @PathVariable String format,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            // Parse date range if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            
            if (startDate != null && !startDate.trim().isEmpty()) {
                try {
                    startDateTime = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    startDateTime = java.time.LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE)
                        .atStartOfDay();
                }
            }
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                try {
                    endDateTime = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    endDateTime = java.time.LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE)
                        .atTime(23, 59, 59);
                }
            }
            
            // Fetch all matching transactions (no pagination for export)
            List<PointTransaction> transactions;
            if (startDateTime != null && endDateTime != null) {
                if (userId != null) {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByUserIdAndTransactionTypeAndDateRange(
                            userId, transactionType, startDateTime, endDateTime,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    } else {
                        transactions = transactionRepository.findByUserIdAndDateRange(
                            userId, startDateTime, endDateTime,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    }
                } else {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByTransactionTypeAndDateRange(
                            transactionType, startDateTime, endDateTime,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    } else {
                        transactions = transactionRepository.findByDateRange(
                            startDateTime, endDateTime,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    }
                }
            } else {
                if (userId != null) {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByUserIdAndTransactionTypeOrderByCreatedAtDesc(
                            userId, transactionType,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    } else {
                        transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(
                            userId,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    }
                } else {
                    if (transactionType != null) {
                        transactions = transactionRepository.findByTransactionTypeOrderByCreatedAtDesc(
                            transactionType,
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    } else {
                        transactions = transactionRepository.findAll(
                            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
                        ).getContent();
                    }
                }
            }
            
            byte[] data;
            String filename;
            String contentType;
            
            if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                data = exportService.exportPointTransactionsToExcel(transactions);
                filename = "point_transactions_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else {
                data = exportService.exportPointTransactionsToCsv(transactions);
                filename = "point_transactions_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
                contentType = "text/csv";
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(data);
        } catch (Exception e) {
            log.error("Error exporting transactions", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/top-users/export/{format}")
    @Operation(summary = "Export top users", description = "Export top users by points to CSV or Excel")
    public ResponseEntity<byte[]> exportTopUsers(
            @PathVariable String format,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<LoyaltyPoints> topUsers = loyaltyPointsRepository.findTopByPointsBalance();
            if (topUsers.size() > limit) {
                topUsers = topUsers.subList(0, limit);
            }
            
            byte[] data;
            String filename;
            String contentType;
            
            if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                data = exportService.exportTopUsersToExcel(topUsers);
                filename = "top_users_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else {
                data = exportService.exportTopUsersToCsv(topUsers);
                filename = "top_users_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
                contentType = "text/csv";
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(data);
        } catch (Exception e) {
            log.error("Error exporting top users", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String getVietnameseMonthName(int month) {
        String[] months = {
            "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
            "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        };
        return months[month];
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
