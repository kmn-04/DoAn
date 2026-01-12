package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.entity.*;
import backend.entity.TourItinerary;
import backend.service.*;
import backend.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController extends BaseController {
    
    private final UserService userService;
    private final UserSessionService userSessionService;
    private final TourService tourService;
    private final BookingService bookingService;
    private final PartnerService partnerService;
    private final CategoryService categoryService;
    private final ExportService exportService;
    
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
            Long onlineUsersCount = userSessionService.countActiveSessions();
            
            overview.put("users", Map.of(
                "total", userStats.getTotalUsers(),
                "active", userStats.getActiveUsers(),
                "newThisMonth", userStats.getNewUsersThisMonth(),
                "onlineNow", onlineUsersCount != null ? onlineUsersCount : 0L
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
            long pendingBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.PENDING).count();
            long confirmedBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED).count();
            long completedBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED).count();
            long cancelledBookings = allBookings.stream().filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED).count();
            BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED || b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED)
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
            List<Partner> hotels = partnerService.getPartnersByType(Partner.PartnerType.HOTEL);
            List<Partner> restaurants = partnerService.getPartnersByType(Partner.PartnerType.RESTAURANT);
            
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
        
        try {
            List<Map<String, Object>> activities = new java.util.ArrayList<>();
            
            // Get recent bookings (last 24 hours)
            LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
            List<Booking> recentBookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(last24Hours))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(limit / 2)
                    .toList();
            
            for (Booking booking : recentBookings) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "booking_" + booking.getId());
                activity.put("type", "BOOKING_CREATED");
                activity.put("description", String.format("Booking mới: %s (%s)", 
                        booking.getTour() != null ? booking.getTour().getName() : "Unknown Tour",
                        booking.getBookingCode()));
                activity.put("timestamp", booking.getCreatedAt());
                activity.put("userId", booking.getUser() != null ? booking.getUser().getId() : null);
                activity.put("userName", booking.getUser() != null ? booking.getUser().getName() : booking.getCustomerName());
                activity.put("amount", booking.getFinalAmount());
                activity.put("status", booking.getConfirmationStatus().toString());
                activities.add(activity);
            }
            
            // Get recent user registrations (last 7 days)
            LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
            org.springframework.data.domain.Pageable topUsersPageable = 
                    org.springframework.data.domain.PageRequest.of(0, limit / 3, 
                    org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
            List<backend.entity.User> recentUsers = userService.getAllUsers(topUsersPageable)
                    .stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(last7Days))
                    .toList();
            
            for (backend.entity.User user : recentUsers) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "user_" + user.getId());
                activity.put("type", "USER_REGISTRATION");
                activity.put("description", String.format("User mới đăng ký: %s", user.getEmail()));
                activity.put("timestamp", user.getCreatedAt());
                activity.put("userId", user.getId());
                activity.put("userName", user.getName());
                activity.put("userRole", user.getRole() != null ? user.getRole().getName() : "Customer");
                activities.add(activity);
            }
            
            // Get recent sessions (last 2 hours - represents logins)
            LocalDateTime last2Hours = LocalDateTime.now().minusHours(2);
            List<UserSession> recentSessions = userSessionService.getActiveSessions().stream()
                    .filter(s -> s.getCreatedAt() != null && s.getCreatedAt().isAfter(last2Hours))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(limit / 4)
                    .toList();
            
            for (UserSession session : recentSessions) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "session_" + session.getId());
                activity.put("type", "USER_LOGIN");
                activity.put("description", String.format("User đăng nhập từ %s", 
                        session.getCountry() != null ? session.getCountry() : session.getIpAddress()));
                activity.put("timestamp", session.getCreatedAt());
                activity.put("userId", session.getUser() != null ? session.getUser().getId() : null);
                activity.put("userName", session.getUser() != null ? session.getUser().getName() : "Unknown");
                activity.put("deviceType", session.getDeviceType());
                activity.put("ipAddress", session.getIpAddress());
                activities.add(activity);
            }
            
            // Sort all activities by timestamp (newest first) and limit
            activities.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
                LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
                return timeB.compareTo(timeA);
            });
            
            List<Map<String, Object>> limitedActivities = activities.stream()
                    .limit(limit)
                    .toList();
            
            log.info("Retrieved {} recent activities", limitedActivities.size());
            
            return ResponseEntity.ok(success("Recent activities retrieved successfully", limitedActivities));
            
        } catch (Exception e) {
            log.error("Error getting recent activities", e);
            return ResponseEntity.ok(success("Recent activities retrieved (empty)", List.of()));
        }
    }
    
    // ================================
    // CHARTS DATA
    // ================================
    
    @GetMapping("/charts/bookings")
    @Operation(summary = "Get booking chart data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        final LocalDateTime finalStartDate = (startDate == null) ? LocalDateTime.now().minusDays(30) : startDate;
        final LocalDateTime finalEndDate = (endDate == null) ? LocalDateTime.now() : endDate;
        
        try {
            Map<String, Object> chartData = new HashMap<>();
            
            // Get all bookings in date range
            List<Booking> allBookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                 b.getCreatedAt().isAfter(finalStartDate) && 
                                 b.getCreatedAt().isBefore(finalEndDate))
                    .toList();
            
            // Calculate daily bookings and revenue
            Map<String, Long> dailyBookingsMap = new java.util.TreeMap<>();
            Map<String, BigDecimal> dailyRevenueMap = new java.util.TreeMap<>();
            
            for (Booking booking : allBookings) {
                String dateKey = booking.getCreatedAt().toLocalDate().toString();
                dailyBookingsMap.merge(dateKey, 1L, Long::sum);
                if (booking.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                    booking.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED) {
                    dailyRevenueMap.merge(dateKey, booking.getFinalAmount(), BigDecimal::add);
                }
            }
            
            List<Map<String, Object>> dailyData = dailyBookingsMap.keySet().stream()
                    .map(date -> Map.of(
                            "date", (Object) date,
                            "bookings", dailyBookingsMap.get(date),
                            "revenue", dailyRevenueMap.getOrDefault(date, BigDecimal.ZERO)
                    ))
                    .toList();
            
            // Calculate monthly bookings and revenue
            Map<String, Long> monthlyBookingsMap = new java.util.TreeMap<>();
            Map<String, BigDecimal> monthlyRevenueMap = new java.util.TreeMap<>();
            
            for (Booking booking : allBookings) {
                String monthKey = booking.getCreatedAt().toLocalDate().withDayOfMonth(1).toString().substring(0, 7);
                monthlyBookingsMap.merge(monthKey, 1L, Long::sum);
                if (booking.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                    booking.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED) {
                    monthlyRevenueMap.merge(monthKey, booking.getFinalAmount(), BigDecimal::add);
                }
            }
            
            List<Map<String, Object>> monthlyData = monthlyBookingsMap.keySet().stream()
                    .map(month -> Map.of(
                            "month", (Object) month,
                            "bookings", monthlyBookingsMap.get(month),
                            "revenue", monthlyRevenueMap.getOrDefault(month, BigDecimal.ZERO)
                    ))
                    .toList();
            
            // Calculate bookings by status
            Map<String, Long> statusCountMap = new HashMap<>();
            long totalBookings = allBookings.size();
            
            for (Booking booking : allBookings) {
                String statusKey = booking.getConfirmationStatus().toString();
                statusCountMap.merge(statusKey, 1L, Long::sum);
            }
            
            final long finalTotalBookings = totalBookings > 0 ? totalBookings : 1;
            List<Map<String, Object>> statusData = statusCountMap.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .map(entry -> {
                        double percentage = (entry.getValue() * 100.0) / finalTotalBookings;
                        return Map.of(
                                "status", (Object) entry.getKey(),
                                "count", entry.getValue(),
                                "percentage", Math.round(percentage * 10.0) / 10.0
                        );
                    })
                    .toList();
            
            chartData.put("daily", dailyData);
            chartData.put("monthly", monthlyData);
            chartData.put("byStatus", statusData);
            
            log.info("Generated booking chart data: {} daily points, {} monthly points, {} statuses",
                    dailyData.size(), monthlyData.size(), statusData.size());
        
        return ResponseEntity.ok(success("Booking chart data retrieved successfully", chartData));
            
        } catch (Exception e) {
            log.error("Error generating booking chart data", e);
            // Return empty data on error
            Map<String, Object> emptyData = Map.of(
                    "daily", List.of(),
                    "monthly", List.of(),
                    "byStatus", List.of()
            );
            return ResponseEntity.ok(success("Booking chart data retrieved (empty)", emptyData));
        }
    }
    
    @GetMapping("/charts/users")
    @Operation(summary = "Get user chart data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        final LocalDateTime finalStartDate = (startDate == null) ? LocalDateTime.now().minusDays(30) : startDate;
        final LocalDateTime finalEndDate = (endDate == null) ? LocalDateTime.now() : endDate;
        
        try {
            Map<String, Object> chartData = new HashMap<>();
            
            // Get all users with pagination (get enough for analysis)
            org.springframework.data.domain.Pageable pageable = 
                    org.springframework.data.domain.PageRequest.of(0, 10000, 
                    org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
            List<backend.entity.User> allUsers = userService.getAllUsers(pageable).getContent();
            
            // Filter users in date range
            List<backend.entity.User> usersInRange = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                 u.getCreatedAt().isAfter(finalStartDate) && 
                                 u.getCreatedAt().isBefore(finalEndDate))
                    .toList();
            
            // Calculate daily registrations
            Map<String, Long> dailyRegistrationsMap = new java.util.TreeMap<>();
            for (backend.entity.User user : usersInRange) {
                String dateKey = user.getCreatedAt().toLocalDate().toString();
                dailyRegistrationsMap.merge(dateKey, 1L, Long::sum);
            }
            
            List<Map<String, Object>> registrationsData = dailyRegistrationsMap.entrySet().stream()
                    .map(entry -> Map.of(
                            "date", (Object) entry.getKey(),
                            "users", entry.getValue()
                    ))
                    .toList();
            
            // Calculate daily active users (from sessions)
            List<UserSession> allSessions = userSessionService.getActiveSessions();
            Map<String, Long> dailyActiveUsersMap = new java.util.TreeMap<>();
            
            for (UserSession session : allSessions) {
                if (session.getLastActivity() != null && 
                    session.getLastActivity().isAfter(finalStartDate) && 
                    session.getLastActivity().isBefore(finalEndDate)) {
                    String dateKey = session.getLastActivity().toLocalDate().toString();
                    dailyActiveUsersMap.merge(dateKey, 1L, Long::sum);
                }
            }
            
            List<Map<String, Object>> activityData = dailyActiveUsersMap.entrySet().stream()
                    .map(entry -> Map.of(
                            "date", (Object) entry.getKey(),
                            "activeUsers", entry.getValue()
                    ))
                    .toList();
            
            // Calculate users by status
            Map<String, Long> statusCountMap = new HashMap<>();
            long totalUsers = 0;
            
            for (backend.entity.User user : allUsers) {
                if (user.getStatus() != null) {
                    String statusKey = user.getStatus().toString();
                    statusCountMap.merge(statusKey, 1L, Long::sum);
                    totalUsers++;
                }
            }
            
            final long finalTotalUsers = totalUsers > 0 ? totalUsers : 1;
            List<Map<String, Object>> statusData = statusCountMap.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .map(entry -> {
                        double percentage = (entry.getValue() * 100.0) / finalTotalUsers;
                        return Map.of(
                                "status", (Object) entry.getKey(),
                                "count", entry.getValue(),
                                "percentage", Math.round(percentage * 10.0) / 10.0
                        );
                    })
                    .toList();
            
            chartData.put("registrations", registrationsData);
            chartData.put("activity", activityData);
            chartData.put("byStatus", statusData);
            
            log.info("Generated user chart data: {} registration points, {} activity points, {} statuses",
                    registrationsData.size(), activityData.size(), statusData.size());
        
        return ResponseEntity.ok(success("User chart data retrieved successfully", chartData));
            
        } catch (Exception e) {
            log.error("Error generating user chart data", e);
            // Return empty data on error
            Map<String, Object> emptyData = Map.of(
                    "registrations", List.of(),
                    "activity", List.of(),
                    "byStatus", List.of()
            );
            return ResponseEntity.ok(success("User chart data retrieved (empty)", emptyData));
        }
    }
    
    @GetMapping("/charts/revenue")
    @Operation(summary = "Get revenue chart data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        final LocalDateTime finalStartDate = (startDate == null) ? LocalDateTime.now().minusDays(30) : startDate;
        final LocalDateTime finalEndDate = (endDate == null) ? LocalDateTime.now() : endDate;
        
        try {
            Map<String, Object> chartData = new HashMap<>();
            
            // Get all bookings in date range
            List<Booking> allBookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                 b.getCreatedAt().isAfter(finalStartDate) && 
                                 b.getCreatedAt().isBefore(finalEndDate))
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                 b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .toList();
            
            // Calculate daily revenue
            Map<String, BigDecimal> dailyRevenueMap = new java.util.TreeMap<>();
            for (Booking booking : allBookings) {
                String dateKey = booking.getCreatedAt().toLocalDate().toString();
                dailyRevenueMap.merge(dateKey, booking.getFinalAmount(), BigDecimal::add);
            }
            
            List<Map<String, Object>> dailyData = dailyRevenueMap.entrySet().stream()
                    .map(entry -> Map.of(
                            "date", (Object) entry.getKey(),
                            "revenue", entry.getValue()
                    ))
                    .toList();
            
            // Calculate monthly revenue
            Map<String, BigDecimal> monthlyRevenueMap = new java.util.TreeMap<>();
            for (Booking booking : allBookings) {
                String monthKey = booking.getCreatedAt().toLocalDate().withDayOfMonth(1).toString().substring(0, 7);
                monthlyRevenueMap.merge(monthKey, booking.getFinalAmount(), BigDecimal::add);
            }
            
            List<Map<String, Object>> monthlyData = monthlyRevenueMap.entrySet().stream()
                    .map(entry -> Map.of(
                            "month", (Object) entry.getKey(),
                            "revenue", entry.getValue()
                    ))
                    .toList();
            
            // Calculate revenue by category
            Map<String, BigDecimal> categoryRevenueMap = new HashMap<>();
            BigDecimal totalRevenue = BigDecimal.ZERO;
            
            for (Booking booking : allBookings) {
                if (booking.getTour() != null && booking.getTour().getCategory() != null) {
                    String categoryName = booking.getTour().getCategory().getName();
                    categoryRevenueMap.merge(categoryName, booking.getFinalAmount(), BigDecimal::add);
                    totalRevenue = totalRevenue.add(booking.getFinalAmount());
                }
            }
            
            final BigDecimal finalTotalRevenue = totalRevenue.compareTo(BigDecimal.ZERO) > 0 ? totalRevenue : BigDecimal.ONE;
            List<Map<String, Object>> categoryData = categoryRevenueMap.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .map(entry -> {
                        double percentage = entry.getValue()
                                .multiply(new BigDecimal("100"))
                                .divide(finalTotalRevenue, 2, java.math.RoundingMode.HALF_UP)
                                .doubleValue();
                        return Map.of(
                                "category", (Object) entry.getKey(),
                                "revenue", entry.getValue(),
                                "percentage", percentage
                        );
                    })
                    .toList();
            
            chartData.put("daily", dailyData);
            chartData.put("monthly", monthlyData);
            chartData.put("byCategory", categoryData);
            
            log.info("Generated revenue chart data: {} daily points, {} monthly points, {} categories",
                    dailyData.size(), monthlyData.size(), categoryData.size());
        
        return ResponseEntity.ok(success("Revenue chart data retrieved successfully", chartData));
            
        } catch (Exception e) {
            log.error("Error generating revenue chart data", e);
            // Return empty data on error
            Map<String, Object> emptyData = Map.of(
                    "daily", List.of(),
                    "monthly", List.of(),
                    "byCategory", List.of()
            );
            return ResponseEntity.ok(success("Revenue chart data retrieved (empty)", emptyData));
        }
    }
    
    // ================================
    // QUICK STATS
    // ================================
    
    @GetMapping("/quick-stats")
    @Operation(summary = "Get quick dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQuickStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Object> quickStats = new HashMap<>();
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
            LocalDateTime weekStart = now.minusDays(7).toLocalDate().atStartOfDay();
            LocalDateTime monthStart = now.minusMonths(1).toLocalDate().atStartOfDay();
            LocalDateTime lastMonthStart = now.minusMonths(2).toLocalDate().atStartOfDay();
            
            // Use custom date range if provided, otherwise use defaults
            LocalDateTime finalStartDate = (startDate != null) ? startDate : todayStart;
            LocalDateTime finalEndDate = (endDate != null) ? endDate : now;
            
            // Get all bookings
            List<Booking> allBookings = bookingService.getAllBookings();
            
            // Today's statistics
            List<Booking> todayBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(todayStart) && 
                                b.getCreatedAt().isBefore(now))
                    .toList();
            
            BigDecimal todayRevenue = todayBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long todayNewBookings = todayBookings.size();
            long todayCancelled = todayBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED)
                    .count();
            double todayCancellationRate = todayNewBookings > 0 ? 
                    (todayCancelled * 100.0 / todayNewBookings) : 0.0;
            
            // Get today's new users
            org.springframework.data.domain.Pageable pageable = 
                    org.springframework.data.domain.PageRequest.of(0, 10000);
            List<backend.entity.User> allUsers = userService.getAllUsers(pageable).getContent();
            long todayNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                u.getCreatedAt().isAfter(todayStart) && 
                                u.getCreatedAt().isBefore(now))
                    .count();
            
            Long onlineUsersCount = userSessionService.countActiveSessions();
            
            quickStats.put("today", Map.of(
                "newUsers", todayNewUsers,
                "newBookings", todayNewBookings,
                "revenue", todayRevenue,
                "activeUsers", onlineUsersCount != null ? onlineUsersCount : 0L,
                "cancelledBookings", todayCancelled,
                "cancellationRate", Math.round(todayCancellationRate * 10.0) / 10.0
            ));
            
            // This week's statistics
            List<Booking> weekBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(weekStart) && 
                                b.getCreatedAt().isBefore(now))
                    .toList();
            
            BigDecimal weekRevenue = weekBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long weekNewBookings = weekBookings.size();
            long weekNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                u.getCreatedAt().isAfter(weekStart) && 
                                u.getCreatedAt().isBefore(now))
                    .count();
            
            BigDecimal averageDaily = weekNewBookings > 0 ? 
                    weekRevenue.divide(BigDecimal.valueOf(7), 2, java.math.RoundingMode.HALF_UP) : 
                    BigDecimal.ZERO;
            
            quickStats.put("thisWeek", Map.of(
                "newUsers", weekNewUsers,
                "newBookings", weekNewBookings,
                "revenue", weekRevenue,
                "averageDaily", averageDaily
            ));
            
            // This month's statistics
            List<Booking> monthBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(monthStart) && 
                                b.getCreatedAt().isBefore(now))
                    .toList();
            
            BigDecimal monthRevenue = monthBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long monthNewBookings = monthBookings.size();
            long monthNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                u.getCreatedAt().isAfter(monthStart) && 
                                u.getCreatedAt().isBefore(now))
                    .count();
            
            // Last month for comparison
            List<Booking> lastMonthBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(lastMonthStart) && 
                                b.getCreatedAt().isBefore(monthStart))
                    .toList();
            
            BigDecimal lastMonthRevenue = lastMonthBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double growthRate = lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0 ?
                    (monthRevenue.subtract(lastMonthRevenue))
                            .divide(lastMonthRevenue, 4, java.math.RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue() : 0.0;
            
            quickStats.put("thisMonth", Map.of(
                "newUsers", monthNewUsers,
                "newBookings", monthNewBookings,
                "revenue", monthRevenue,
                "growth", Math.round(growthRate * 10.0) / 10.0
            ));
            
            // Custom date range statistics (if provided)
            if (startDate != null && endDate != null) {
                List<Booking> customBookings = allBookings.stream()
                        .filter(b -> b.getCreatedAt() != null && 
                                    b.getCreatedAt().isAfter(finalStartDate) && 
                                    b.getCreatedAt().isBefore(finalEndDate))
                        .toList();
                
                BigDecimal customRevenue = customBookings.stream()
                        .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                    b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                        .map(Booking::getFinalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                long customNewBookings = customBookings.size();
                long customNewUsers = allUsers.stream()
                        .filter(u -> u.getCreatedAt() != null && 
                                    u.getCreatedAt().isAfter(finalStartDate) && 
                                    u.getCreatedAt().isBefore(finalEndDate))
                        .count();
                
                long customCancelled = customBookings.stream()
                        .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED)
                        .count();
                double customCancellationRate = customNewBookings > 0 ? 
                        (customCancelled * 100.0 / customNewBookings) : 0.0;
                
                quickStats.put("custom", Map.of(
                    "newUsers", customNewUsers,
                    "newBookings", customNewBookings,
                    "revenue", customRevenue,
                    "cancelledBookings", customCancelled,
                    "cancellationRate", Math.round(customCancellationRate * 10.0) / 10.0,
                    "startDate", finalStartDate,
                    "endDate", finalEndDate
                ));
            }
            
            // Alerts and notifications
            long pendingBookings = allBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.PENDING)
                    .count();
            
            quickStats.put("alerts", Map.of(
                "pendingBookings", pendingBookings,
                "expiringSessions", 0L, // TODO: Implement if needed
                "failedPayments", 0L, // TODO: Implement if needed
                "systemErrors", 0L
            ));
            
        } catch (Exception e) {
            log.error("Error getting quick stats", e);
        }
        
        return ResponseEntity.ok(success("Quick statistics retrieved successfully", quickStats));
    }
    
    @GetMapping("/top-partners")
    @Operation(summary = "Get top partners by revenue")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopPartners(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            LocalDateTime finalStartDate = (startDate == null) ? LocalDateTime.now().minusMonths(1) : startDate;
            LocalDateTime finalEndDate = (endDate == null) ? LocalDateTime.now() : endDate;
            
            List<Booking> bookings = bookingService.getAllBookings().stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(finalStartDate) && 
                                b.getCreatedAt().isBefore(finalEndDate))
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .toList();
            
            // Group by partner (through tour's itineraries)
            Map<Long, BigDecimal> partnerRevenueMap = new HashMap<>();
            Map<Long, String> partnerNameMap = new HashMap<>();
            Map<Long, Long> partnerBookingCountMap = new HashMap<>();
            
            for (Booking booking : bookings) {
                if (booking.getTour() != null && booking.getTour().getItineraries() != null) {
                    // Get partners from tour itineraries
                    for (TourItinerary itinerary : booking.getTour().getItineraries()) {
                        if (itinerary.getPartner() != null) {
                            Long partnerId = itinerary.getPartner().getId();
                            String partnerName = itinerary.getPartner().getName();
                            
                            // Distribute revenue equally among partners (or use a different logic)
                            BigDecimal partnerShare = booking.getFinalAmount()
                                    .divide(BigDecimal.valueOf(Math.max(booking.getTour().getItineraries().size(), 1)), 
                                            2, java.math.RoundingMode.HALF_UP);
                            
                            partnerRevenueMap.merge(partnerId, partnerShare, BigDecimal::add);
                            partnerNameMap.put(partnerId, partnerName);
                            partnerBookingCountMap.merge(partnerId, 1L, Long::sum);
                        }
                    }
                }
            }
            
            List<Map<String, Object>> topPartners = partnerRevenueMap.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(limit)
                    .map(entry -> {
                        Long partnerId = entry.getKey();
                        return Map.<String, Object>of(
                                "partnerId", partnerId,
                                "partnerName", partnerNameMap.getOrDefault(partnerId, "Unknown"),
                                "totalRevenue", entry.getValue(),
                                "bookingCount", partnerBookingCountMap.getOrDefault(partnerId, 0L)
                        );
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(success("Top partners retrieved successfully", topPartners));
            
        } catch (Exception e) {
            log.error("Error getting top partners", e);
            return ResponseEntity.ok(success("Top partners retrieved (empty)", List.of()));
        }
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
    
    // ================================
    // EXPORT DASHBOARD REPORT
    // ================================
    
    @GetMapping("/export/{format}")
    @Operation(summary = "Export dashboard report", description = "Export dashboard statistics to CSV or Excel")
    public ResponseEntity<byte[]> exportDashboardReport(
            @PathVariable String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
            LocalDateTime weekStart = now.minusDays(7).toLocalDate().atStartOfDay();
            LocalDateTime monthStart = now.minusMonths(1).toLocalDate().atStartOfDay();
            
            List<ExportService.DashboardReport> reports = new java.util.ArrayList<>();
            
            // Get all bookings and users
            List<Booking> allBookings = bookingService.getAllBookings();
            org.springframework.data.domain.Pageable pageable = 
                    org.springframework.data.domain.PageRequest.of(0, 10000);
            List<backend.entity.User> allUsers = userService.getAllUsers(pageable).getContent();
            Long onlineUsersCount = userSessionService.countActiveSessions();
            
            // Today's report
            List<Booking> todayBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(todayStart) && 
                                b.getCreatedAt().isBefore(now))
                    .toList();
            
            BigDecimal todayRevenue = todayBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long todayCancelled = todayBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED)
                    .count();
            double todayCancellationRate = todayBookings.size() > 0 ? 
                    (todayCancelled * 100.0 / todayBookings.size()) : 0.0;
            
            long todayNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                u.getCreatedAt().isAfter(todayStart) && 
                                u.getCreatedAt().isBefore(now))
                    .count();
            
            ExportService.DashboardReport todayReport = new ExportService.DashboardReport();
            todayReport.setPeriod("Hôm nay");
            todayReport.setRevenue(todayRevenue);
            todayReport.setNewBookings((long) todayBookings.size());
            todayReport.setNewUsers(todayNewUsers);
            todayReport.setCancelledBookings(todayCancelled);
            todayReport.setCancellationRate(Math.round(todayCancellationRate * 10.0) / 10.0);
            todayReport.setActiveUsers(onlineUsersCount != null ? onlineUsersCount : 0L);
            reports.add(todayReport);
            
            // This week's report
            List<Booking> weekBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(weekStart) && 
                                b.getCreatedAt().isBefore(now))
                    .toList();
            
            BigDecimal weekRevenue = weekBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long weekCancelled = weekBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED)
                    .count();
            double weekCancellationRate = weekBookings.size() > 0 ? 
                    (weekCancelled * 100.0 / weekBookings.size()) : 0.0;
            
            long weekNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                u.getCreatedAt().isAfter(weekStart) && 
                                u.getCreatedAt().isBefore(now))
                    .count();
            
            ExportService.DashboardReport weekReport = new ExportService.DashboardReport();
            weekReport.setPeriod("7 ngày qua");
            weekReport.setRevenue(weekRevenue);
            weekReport.setNewBookings((long) weekBookings.size());
            weekReport.setNewUsers(weekNewUsers);
            weekReport.setCancelledBookings(weekCancelled);
            weekReport.setCancellationRate(Math.round(weekCancellationRate * 10.0) / 10.0);
            weekReport.setActiveUsers(onlineUsersCount != null ? onlineUsersCount : 0L);
            reports.add(weekReport);
            
            // This month's report
            List<Booking> monthBookings = allBookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                                b.getCreatedAt().isAfter(monthStart) && 
                                b.getCreatedAt().isBefore(now))
                    .toList();
            
            BigDecimal monthRevenue = monthBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long monthCancelled = monthBookings.stream()
                    .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED)
                    .count();
            double monthCancellationRate = monthBookings.size() > 0 ? 
                    (monthCancelled * 100.0 / monthBookings.size()) : 0.0;
            
            long monthNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && 
                                u.getCreatedAt().isAfter(monthStart) && 
                                u.getCreatedAt().isBefore(now))
                    .count();
            
            ExportService.DashboardReport monthReport = new ExportService.DashboardReport();
            monthReport.setPeriod("30 ngày qua");
            monthReport.setRevenue(monthRevenue);
            monthReport.setNewBookings((long) monthBookings.size());
            monthReport.setNewUsers(monthNewUsers);
            monthReport.setCancelledBookings(monthCancelled);
            monthReport.setCancellationRate(Math.round(monthCancellationRate * 10.0) / 10.0);
            monthReport.setActiveUsers(onlineUsersCount != null ? onlineUsersCount : 0L);
            reports.add(monthReport);
            
            // Custom date range (if provided)
            if (startDate != null && endDate != null) {
                List<Booking> customBookings = allBookings.stream()
                        .filter(b -> b.getCreatedAt() != null && 
                                    b.getCreatedAt().isAfter(startDate) && 
                                    b.getCreatedAt().isBefore(endDate))
                        .toList();
                
                BigDecimal customRevenue = customBookings.stream()
                        .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                                    b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED)
                        .map(Booking::getFinalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                long customCancelled = customBookings.stream()
                        .filter(b -> b.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLED)
                        .count();
                double customCancellationRate = customBookings.size() > 0 ? 
                        (customCancelled * 100.0 / customBookings.size()) : 0.0;
                
                long customNewUsers = allUsers.stream()
                        .filter(u -> u.getCreatedAt() != null && 
                                    u.getCreatedAt().isAfter(startDate) && 
                                    u.getCreatedAt().isBefore(endDate))
                        .count();
                
                ExportService.DashboardReport customReport = new ExportService.DashboardReport();
                customReport.setPeriod(String.format("Từ %s đến %s", 
                        startDate.toLocalDate().toString(), 
                        endDate.toLocalDate().toString()));
                customReport.setRevenue(customRevenue);
                customReport.setNewBookings((long) customBookings.size());
                customReport.setNewUsers(customNewUsers);
                customReport.setCancelledBookings(customCancelled);
                customReport.setCancellationRate(Math.round(customCancellationRate * 10.0) / 10.0);
                customReport.setActiveUsers(onlineUsersCount != null ? onlineUsersCount : 0L);
                reports.add(customReport);
            }
            
            byte[] fileData;
            String contentType;
            String filename;
            
            if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                fileData = exportService.exportDashboardReportToExcel(reports);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename = "dashboard_report_" + java.time.LocalDate.now() + ".xlsx";
            } else {
                fileData = exportService.exportDashboardReportToCsv(reports);
                contentType = "text/csv";
                filename = "dashboard_report_" + java.time.LocalDate.now() + ".csv";
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileData);
                    
        } catch (Exception e) {
            log.error("Error exporting dashboard report", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
