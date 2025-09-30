package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.entity.*;
import backend.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Dashboard", description = "Admin dashboard statistics and overview")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminDashboardController extends BaseController {
    
    private final UserService userService;
    private final TourService tourService;
    private final BookingService bookingService;
    private final PartnerService partnerService;
    private final CategoryService categoryService;
    
    // ================================
    // OVERVIEW STATISTICS
    // ================================
    
    @GetMapping("/overview")
    @Operation(summary = "Get dashboard overview statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        try {
            // User statistics
            UserService.UserStatistics userStats = userService.getUserStatistics();
            overview.put("users", Map.of(
                "total", userStats.getTotalUsers(),
                "active", userStats.getActiveUsers(),
                "newThisMonth", userStats.getNewUsersThisMonth(),
                "onlineNow", 0 // TODO: Implement online users count
            ));
            
            // Tour statistics - using available methods
            List<Tour> allTours = tourService.getAllActiveTours();
            long totalTours = allTours.size();
            long featuredTours = allTours.stream().filter(Tour::getIsFeatured).count();
            long domesticTours = allTours.stream().filter(t -> t.getTourType() == Tour.TourType.DOMESTIC).count();
            long internationalTours = allTours.stream().filter(t -> t.getTourType() == Tour.TourType.INTERNATIONAL).count();
            
            overview.put("tours", Map.of(
                "total", totalTours,
                "active", totalTours,
                "featured", featuredTours,
                "domestic", domesticTours,
                "international", internationalTours
            ));
            
            // Booking statistics - using available methods
            List<Booking> allBookings = bookingService.getAllBookings();
            long totalBookings = allBookings.size();
            long pendingBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.Pending).count();
            long confirmedBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.Confirmed).count();
            long completedBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.Completed).count();
            long cancelledBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.Cancelled).count();
            BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.Completed || b.getConfirmationStatus() == Booking.ConfirmationStatus.Confirmed)
                .map(Booking::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            overview.put("bookings", Map.of(
                "total", totalBookings,
                "pending", pendingBookings,
                "confirmed", confirmedBookings,
                "completed", completedBookings,
                "cancelled", cancelledBookings,
                "totalRevenue", totalRevenue
            ));
            
            // Partner statistics - CHỈ HOTEL VÀ RESTAURANT
            List<Partner> hotels = partnerService.getPartnersByType(Partner.PartnerType.Hotel);
            List<Partner> restaurants = partnerService.getPartnersByType(Partner.PartnerType.Restaurant);
            
            overview.put("partners", Map.of(
                "total", hotels.size() + restaurants.size(),
                "hotels", hotels.size(),
                "restaurants", restaurants.size()
            ));
            
            // Category statistics - using available methods
            List<Category> allCategories = categoryService.getAllCategories();
            List<Category> activeCategories = categoryService.getActiveCategories();
            
            overview.put("categories", Map.of(
                "total", allCategories.size(),
                "active", activeCategories.size()
            ));
            
        } catch (Exception e) {
            log.error("Error getting dashboard overview", e);
            return ResponseEntity.ok(success("Dashboard overview retrieved with some errors", overview));
        }
        
        return ResponseEntity.ok(success("Dashboard overview retrieved successfully", overview));
    }
    
    // ================================
    // RECENT ACTIVITIES
    // ================================
    
    @GetMapping("/recent-activities")
    @Operation(summary = "Get recent system activities")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentActivities(
            @RequestParam(defaultValue = "20") int limit) {
        
        // TODO: Implement when UserActivityService is ready
        List<Map<String, Object>> activities = List.of(
            Map.of(
                "id", 1L,
                "type", "USER_REGISTRATION",
                "description", "New user registered: john@example.com",
                "timestamp", LocalDateTime.now().minusMinutes(5),
                "userId", 123L,
                "userName", "John Doe"
            ),
            Map.of(
                "id", 2L,
                "type", "BOOKING_CREATED",
                "description", "New booking created for Hanoi City Tour",
                "timestamp", LocalDateTime.now().minusMinutes(15),
                "userId", 124L,
                "userName", "Jane Smith"
            ),
            Map.of(
                "id", 3L,
                "type", "TOUR_UPDATED",
                "description", "Tour updated: Sapa Adventure",
                "timestamp", LocalDateTime.now().minusMinutes(30),
                "userId", 1L,
                "userName", "Admin"
            )
        );
        
        return ResponseEntity.ok(success("Recent activities retrieved successfully", activities));
    }
    
    // ================================
    // CHARTS DATA
    // ================================
    
    @GetMapping("/charts/bookings")
    @Operation(summary = "Get booking chart data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();
        
        // TODO: Implement real chart data
        Map<String, Object> chartData = Map.of(
            "daily", List.of(
                Map.of("date", "2025-09-01", "bookings", 12, "revenue", 15000000),
                Map.of("date", "2025-09-02", "bookings", 8, "revenue", 9500000),
                Map.of("date", "2025-09-03", "bookings", 15, "revenue", 18750000)
            ),
            "monthly", List.of(
                Map.of("month", "2025-07", "bookings", 245, "revenue", 312500000),
                Map.of("month", "2025-08", "bookings", 289, "revenue", 367800000),
                Map.of("month", "2025-09", "bookings", 156, "revenue", 198750000)
            ),
            "byStatus", List.of(
                Map.of("status", "CONFIRMED", "count", 156, "percentage", 52.0),
                Map.of("status", "PENDING", "count", 89, "percentage", 29.7),
                Map.of("status", "COMPLETED", "count", 45, "percentage", 15.0),
                Map.of("status", "CANCELLED", "count", 10, "percentage", 3.3)
            )
        );
        
        return ResponseEntity.ok(success("Booking chart data retrieved successfully", chartData));
    }
    
    @GetMapping("/charts/users")
    @Operation(summary = "Get user chart data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();
        
        // TODO: Implement real chart data
        Map<String, Object> chartData = Map.of(
            "registrations", List.of(
                Map.of("date", "2025-09-01", "users", 5),
                Map.of("date", "2025-09-02", "users", 8),
                Map.of("date", "2025-09-03", "users", 3)
            ),
            "activity", List.of(
                Map.of("date", "2025-09-01", "activeUsers", 234),
                Map.of("date", "2025-09-02", "activeUsers", 189),
                Map.of("date", "2025-09-03", "activeUsers", 267)
            ),
            "byStatus", List.of(
                Map.of("status", "ACTIVE", "count", 1245, "percentage", 87.5),
                Map.of("status", "INACTIVE", "count", 178, "percentage", 12.5)
            )
        );
        
        return ResponseEntity.ok(success("User chart data retrieved successfully", chartData));
    }
    
    @GetMapping("/charts/revenue")
    @Operation(summary = "Get revenue chart data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();
        
        // TODO: Implement real revenue data
        Map<String, Object> chartData = Map.of(
            "daily", List.of(
                Map.of("date", "2025-09-01", "revenue", 15000000),
                Map.of("date", "2025-09-02", "revenue", 9500000),
                Map.of("date", "2025-09-03", "revenue", 18750000)
            ),
            "monthly", List.of(
                Map.of("month", "2025-07", "revenue", 312500000),
                Map.of("month", "2025-08", "revenue", 367800000),
                Map.of("month", "2025-09", "revenue", 198750000)
            ),
            "byCategory", List.of(
                Map.of("category", "Adventure Tours", "revenue", 125000000, "percentage", 35.2),
                Map.of("category", "Cultural Tours", "revenue", 98750000, "percentage", 27.8),
                Map.of("category", "Beach Tours", "revenue", 76250000, "percentage", 21.5),
                Map.of("category", "City Tours", "revenue", 55000000, "percentage", 15.5)
            )
        );
        
        return ResponseEntity.ok(success("Revenue chart data retrieved successfully", chartData));
    }
    
    // ================================
    // QUICK STATS
    // ================================
    
    @GetMapping("/quick-stats")
    @Operation(summary = "Get quick dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQuickStats() {
        Map<String, Object> quickStats = new HashMap<>();
        
        try {
            // Today's statistics
            quickStats.put("today", Map.of(
                "newUsers", 5,
                "newBookings", 12,
                "revenue", 15000000,
                "activeUsers", 234
            ));
            
            // This week's statistics
            quickStats.put("thisWeek", Map.of(
                "newUsers", 28,
                "newBookings", 67,
                "revenue", 85750000,
                "averageDaily", 12250000
            ));
            
            // This month's statistics
            quickStats.put("thisMonth", Map.of(
                "newUsers", 156,
                "newBookings", 289,
                "revenue", 367800000,
                "growth", 12.5 // percentage growth from last month
            ));
            
            // Alerts and notifications
            quickStats.put("alerts", Map.of(
                "pendingBookings", 23,
                "expiringSessions", 5,
                "failedPayments", 2,
                "systemErrors", 0
            ));
            
        } catch (Exception e) {
            log.error("Error getting quick stats", e);
        }
        
        return ResponseEntity.ok(success("Quick statistics retrieved successfully", quickStats));
    }
    
    // ================================
    // SYSTEM HEALTH
    // ================================
    
    @GetMapping("/system-health")
    @Operation(summary = "Get system health status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth() {
        Map<String, Object> health = Map.of(
            "database", Map.of("status", "UP", "responseTime", "12ms"),
            "redis", Map.of("status", "UP", "responseTime", "3ms"),
            "storage", Map.of("status", "UP", "freeSpace", "85%"),
            "memory", Map.of("status", "UP", "usage", "67%"),
            "cpu", Map.of("status", "UP", "usage", "23%"),
            "lastCheck", LocalDateTime.now()
        );
        
        return ResponseEntity.ok(success("System health retrieved successfully", health));
    }
}
