package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.entity.Booking;
import backend.repository.BookingRepository;
import backend.repository.TourRepository;
import backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Statistics", description = "Admin APIs for statistics and analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController extends BaseController {
    
    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    
    @GetMapping("/revenue/monthly")
    @Operation(summary = "Get monthly revenue", description = "Get revenue statistics by month for the last 12 months")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMonthlyRevenue() {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            
            // Get last 12 months
            List<Map<String, Object>> monthlyData = new ArrayList<>();
            YearMonth currentMonth = YearMonth.now();
            
            for (int i = 11; i >= 0; i--) {
                YearMonth month = currentMonth.minusMonths(i);
                int year = month.getYear();
                int monthValue = month.getMonthValue();
                
                BigDecimal revenue = bookings.stream()
                    .filter(b -> {
                        LocalDateTime createdAt = b.getCreatedAt();
                        return createdAt != null &&
                               createdAt.getYear() == year && 
                               createdAt.getMonthValue() == monthValue &&
                               b.getPaymentStatus() != null &&
                               b.getPaymentStatus().name().equalsIgnoreCase("Paid");
                    })
                    .map(Booking::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                long count = bookings.stream()
                    .filter(b -> {
                        LocalDateTime createdAt = b.getCreatedAt();
                        return createdAt != null &&
                               createdAt.getYear() == year && 
                               createdAt.getMonthValue() == monthValue;
                    })
                    .count();
                
                Map<String, Object> data = new HashMap<>();
                data.put("month", month.toString());
                data.put("monthName", getVietnameseMonthName(monthValue) + " " + year);
                data.put("revenue", revenue);
                data.put("bookingCount", count);
                
                monthlyData.add(data);
            }
            
            return ResponseEntity.ok(success("Monthly revenue retrieved successfully", monthlyData));
        } catch (Exception e) {
            log.error("Error getting monthly revenue", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get monthly revenue: " + e.getMessage()));
        }
    }
    
    @GetMapping("/revenue/summary")
    @Operation(summary = "Get revenue summary", description = "Get revenue summary for current month, year, and total")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueSummary() {
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            LocalDateTime now = LocalDateTime.now();
            
            // This month
            BigDecimal thisMonthRevenue = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == now.getYear() &&
                           createdAt.getMonthValue() == now.getMonthValue() &&
                           b.getPaymentStatus() != null &&
                           b.getPaymentStatus().name().equalsIgnoreCase("Paid");
                })
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            long thisMonthBookings = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == now.getYear() &&
                           createdAt.getMonthValue() == now.getMonthValue();
                })
                .count();

            // This year
            BigDecimal thisYearRevenue = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == now.getYear() &&
                           b.getPaymentStatus() != null &&
                           b.getPaymentStatus().name().equalsIgnoreCase("Paid");
                })
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Total revenue
            BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getPaymentStatus() != null && 
                           b.getPaymentStatus().name().equalsIgnoreCase("Paid"))
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Last month for comparison
            BigDecimal lastMonthRevenue = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    YearMonth lastMonth = YearMonth.now().minusMonths(1);
                    return createdAt != null &&
                           createdAt.getYear() == lastMonth.getYear() &&
                           createdAt.getMonthValue() == lastMonth.getMonthValue() &&
                           b.getPaymentStatus() != null &&
                           b.getPaymentStatus().name().equalsIgnoreCase("Paid");
                })
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate growth
            double growthRate = 0.0;
            if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
                growthRate = thisMonthRevenue.subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            }
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("thisMonthRevenue", thisMonthRevenue);
            summary.put("thisMonthBookings", thisMonthBookings);
            summary.put("thisYearRevenue", thisYearRevenue);
            summary.put("totalRevenue", totalRevenue);
            summary.put("lastMonthRevenue", lastMonthRevenue);
            summary.put("growthRate", growthRate);
            
            return ResponseEntity.ok(success("Revenue summary retrieved successfully", summary));
        } catch (Exception e) {
            log.error("Error getting revenue summary", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get revenue summary: " + e.getMessage()));
        }
    }
    
    @GetMapping("/tours/top")
    @Operation(summary = "Get top tours", description = "Get top 10 tours by booking count")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopTours() {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            
            // Group by tour and count
            Map<Long, Long> tourBookingCounts = bookings.stream()
                .filter(b -> b.getTour() != null)
                .collect(Collectors.groupingBy(
                    b -> b.getTour().getId(),
                    Collectors.counting()
                ));
            
            // Sort and get top 10
            List<Map<String, Object>> topTours = tourBookingCounts.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .map(entry -> {
                    Booking sampleBooking = bookings.stream()
                        .filter(b -> b.getTour() != null && b.getTour().getId().equals(entry.getKey()))
                        .findFirst()
                        .orElse(null);
                    
                    Map<String, Object> data = new HashMap<>();
                    if (sampleBooking != null && sampleBooking.getTour() != null) {
                        // Force initialization of Tour proxy
                        String tourName = sampleBooking.getTour().getName();
                        data.put("tourId", entry.getKey());
                        data.put("tourName", tourName);
                        data.put("bookingCount", entry.getValue());
                        
                        BigDecimal totalRevenue = bookings.stream()
                            .filter(b -> b.getTour() != null && 
                                       b.getTour().getId().equals(entry.getKey()) &&
                                       b.getPaymentStatus() != null &&
                                       b.getPaymentStatus().name().equalsIgnoreCase("Paid"))
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                        data.put("totalRevenue", totalRevenue);
                    }
                    return data;
                })
                .filter(map -> !map.isEmpty())
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(success("Top tours retrieved successfully", topTours));
        } catch (Exception e) {
            log.error("Error getting top tours", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get top tours: " + e.getMessage()));
        }
    }
    
    @GetMapping("/users/growth")
    @Operation(summary = "Get user growth", description = "Get user registration growth by month for the last 12 months")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserGrowth() {
        try {
            List<backend.entity.User> users = userRepository.findAll();
            
            List<Map<String, Object>> monthlyData = new ArrayList<>();
            YearMonth currentMonth = YearMonth.now();
            
            for (int i = 11; i >= 0; i--) {
                YearMonth month = currentMonth.minusMonths(i);
                int year = month.getYear();
                int monthValue = month.getMonthValue();
                
                long newUsers = users.stream()
                    .filter(u -> {
                        LocalDateTime createdAt = u.getCreatedAt();
                        return createdAt != null &&
                               createdAt.getYear() == year && 
                               createdAt.getMonthValue() == monthValue;
                    })
                    .count();
                
                Map<String, Object> data = new HashMap<>();
                data.put("month", month.toString());
                data.put("monthName", getVietnameseMonthName(monthValue) + " " + year);
                data.put("newUsers", newUsers);
                
                monthlyData.add(data);
            }
            
            return ResponseEntity.ok(success("User growth retrieved successfully", monthlyData));
        } catch (Exception e) {
            log.error("Error getting user growth", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get user growth: " + e.getMessage()));
        }
    }
    
    @GetMapping("/overview")
    @Operation(summary = "Get overview statistics", description = "Get overall system statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Booking> allBookings = bookingRepository.findAll();
            
            // This month statistics
            long thisMonthNewUsers = userRepository.findAll().stream()
                .filter(u -> {
                    LocalDateTime createdAt = u.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == now.getYear() &&
                           createdAt.getMonthValue() == now.getMonthValue();
                })
                .count();
            
            long thisMonthBookings = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == now.getYear() &&
                           createdAt.getMonthValue() == now.getMonthValue();
                })
                .count();
            
            BigDecimal thisMonthRevenue = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == now.getYear() &&
                           createdAt.getMonthValue() == now.getMonthValue() &&
                           b.getPaymentStatus() != null &&
                           b.getPaymentStatus().name().equalsIgnoreCase("Paid");
                })
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Last month for comparison
            YearMonth lastMonth = YearMonth.now().minusMonths(1);
            long lastMonthBookings = allBookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == lastMonth.getYear() &&
                           createdAt.getMonthValue() == lastMonth.getMonthValue();
                })
                .count();
            
            double bookingGrowth = 0.0;
            if (lastMonthBookings > 0) {
                bookingGrowth = ((double) (thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100;
            }
            
            Map<String, Object> overview = new HashMap<>();
            overview.put("thisMonthRevenue", thisMonthRevenue);
            overview.put("thisMonthBookings", thisMonthBookings);
            overview.put("thisMonthNewUsers", thisMonthNewUsers);
            overview.put("bookingGrowth", bookingGrowth);
            overview.put("activeTours", tourRepository.findAll().stream()
                .filter(t -> t.getStatus() != null && 
                           t.getStatus().name().equalsIgnoreCase("Active"))
                .count());
            
            return ResponseEntity.ok(success("Overview retrieved successfully", overview));
        } catch (Exception e) {
            log.error("Error getting overview", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get overview: " + e.getMessage()));
        }
    }
    
    private String getVietnameseMonthName(int month) {
        String[] months = {
            "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
            "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        };
        return months[month - 1];
    }
}

