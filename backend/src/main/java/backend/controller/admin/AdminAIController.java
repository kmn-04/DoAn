package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.entity.Booking;
import backend.entity.User;
import backend.repository.BookingRepository;
import backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin AI Features", description = "AI-powered features for admin panel")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminAIController extends BaseController {
    
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    
    // ================================
    // AI INSIGHTS & PREDICTIONS
    // ================================
    
    @GetMapping("/insights")
    @Operation(summary = "Get AI insights and predictions", description = "Get revenue predictions, booking forecasts, churn predictions, and alerts")
    // @Cacheable(value = "aiInsights", key = "'insights'", cacheManager = "aiInsightsCacheManager") // Temporarily disabled for debugging
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAIInsights() {
        try {
            log.info("Starting AI insights calculation...");
            Map<String, Object> insights = new HashMap<>();
            
            // Get revenue prediction
            log.debug("Calculating revenue prediction...");
            Map<String, Object> revenueForecast = calculateRevenuePrediction();
            insights.put("revenueForecast", revenueForecast);
            log.debug("Revenue prediction completed");
            
            // Get booking forecast
            log.debug("Calculating booking forecast...");
            Map<String, Object> bookingForecast = calculateBookingForecast();
            insights.put("bookingForecast", bookingForecast);
            log.debug("Booking forecast completed");
            
            // Get churn prediction
            log.debug("Calculating churn prediction...");
            Map<String, Object> churnPrediction = calculateChurnPrediction();
            insights.put("churnPrediction", churnPrediction);
            log.debug("Churn prediction completed");
            
            // Generate alerts based on predictions
            log.debug("Generating alerts...");
            List<Map<String, Object>> alerts = generateAlerts(revenueForecast, bookingForecast, churnPrediction);
            insights.put("alerts", alerts);
            log.debug("Alerts generated: {}", alerts.size());
            
            log.info("AI insights retrieved successfully");
            return ResponseEntity.ok(success("AI insights retrieved successfully", insights));
        } catch (Exception e) {
            log.error("Error getting AI insights", e);
            e.printStackTrace(); // Print full stack trace for debugging
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get AI insights: " + e.getMessage()));
        }
    }
    
    /**
     * Calculate revenue prediction using Linear Regression
     * Based on last 12 months of revenue data
     */
    private Map<String, Object> calculateRevenuePrediction() {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            if (bookings == null || bookings.isEmpty()) {
                log.warn("No bookings found for revenue prediction");
                return createEmptyRevenueForecast();
            }
            
            YearMonth currentMonth = YearMonth.now();
        
        // Get revenue for last 12 months
        List<Double> revenues = new ArrayList<>();
        List<Integer> months = new ArrayList<>();
        
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
                           b.getConfirmationStatus() != null &&
                           (b.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED || 
                            b.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED);
                })
                .map(Booking::getFinalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            revenues.add(revenue.doubleValue());
            months.add(12 - i); // 1, 2, 3, ..., 12
        }
        
        // Calculate Linear Regression: y = mx + b
        // m = slope, b = intercept
        double n = revenues.size();
        double sumX = months.stream().mapToInt(Integer::intValue).sum();
        double sumY = revenues.stream().mapToDouble(Double::doubleValue).sum();
        double sumXY = 0.0;
        double sumX2 = 0.0;
        
        for (int i = 0; i < months.size(); i++) {
            sumXY += months.get(i) * revenues.get(i);
            sumX2 += months.get(i) * months.get(i);
        }
        
        // Calculate slope (m) and intercept (b)
        double denominator = n * sumX2 - sumX * sumX;
        if (denominator == 0 || Double.isNaN(denominator) || Double.isInfinite(denominator)) {
            log.warn("Cannot calculate linear regression: denominator is zero or invalid");
            return createEmptyRevenueForecast();
        }
        
        double m = (n * sumXY - sumX * sumY) / denominator;
        double b = (sumY - m * sumX) / n;
        
        // Check for NaN or Infinity
        if (Double.isNaN(m) || Double.isInfinite(m) || Double.isNaN(b) || Double.isInfinite(b)) {
            log.warn("Linear regression produced invalid values (NaN or Infinity)");
            return createEmptyRevenueForecast();
        }
        
        // Predict next month (month 13)
        double predictedRevenue = m * 13 + b;
        
        // Calculate average of recent months for fallback
        double recentAvg = revenues.stream()
            .skip(Math.max(0, revenues.size() - 3))
            .mapToDouble(r -> r)
            .average()
            .orElse(0.0);
        double overallAvg = revenues.stream().mapToDouble(r -> r).average().orElse(0.0);
        
        // If prediction is negative or too low, use average-based forecast
        if (predictedRevenue < 0 || (overallAvg > 0 && predictedRevenue < overallAvg * 0.3)) {
            log.debug("Linear regression revenue prediction ({}) is too low, using average-based forecast", predictedRevenue);
            if (recentAvg > 0) {
                predictedRevenue = Math.max(overallAvg * 0.8, recentAvg * 0.9); // Conservative estimate
            } else {
                predictedRevenue = Math.max(0, overallAvg * 0.8);
            }
        }
        
        // Ensure non-negative
        predictedRevenue = Math.max(0, predictedRevenue);
        
        log.debug("Next month revenue prediction: {} (from LR: {}, avg: {}, recent avg: {})", 
            predictedRevenue, m * 13 + b, overallAvg, recentAvg);
        
        // Calculate growth rate (compared to last month)
        double lastMonthRevenue = revenues.get(revenues.size() - 1);
        double growthRate = lastMonthRevenue > 0 ? 
            ((predictedRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0.0;
        
        // Calculate confidence based on data quality and variance
        // Better formula: consider both variance and data availability
        double mean = sumY / n;
        
        // Count non-zero months (actual data points)
        long nonZeroMonths = revenues.stream().mapToLong(r -> r > 0 ? 1 : 0).sum();
        double dataAvailabilityFactor = (double) nonZeroMonths / n; // 0-1 scale
        
        // Calculate variance only for non-zero values if possible
        double variance = 0.0;
        if (nonZeroMonths > 1) {
            double nonZeroMean = revenues.stream().filter(r -> r > 0).mapToDouble(r -> r).sum() / nonZeroMonths;
            variance = revenues.stream()
                .filter(r -> r > 0)
                .mapToDouble(r -> Math.pow(r - nonZeroMean, 2))
                .sum() / nonZeroMonths;
        }
        double stdDev = Math.sqrt(variance);
        
        // Improved confidence calculation
        // Consider: data availability (30%), trend consistency (30%), variance (40%)
        double coefficientOfVariation = (nonZeroMonths > 0 && mean > 0) ? (stdDev / mean) * 100 : 100.0;
        
        // Base confidence from data availability
        double availabilityConfidence = dataAvailabilityFactor * 40.0; // Max 40% from availability
        
        // Variance confidence (lower variance = higher confidence)
        double varianceConfidence = Math.max(0, Math.min(40, 40 - (coefficientOfVariation / 2.5)));
        
        // Trend confidence (check if there's a consistent trend)
        double trendConfidence = 20.0; // Default 20%
        if (revenues.size() >= 3) {
            // Check if last 3 months show a trend
            double recentTrend = revenues.get(revenues.size() - 1) - revenues.get(Math.max(0, revenues.size() - 4));
            if (Math.abs(recentTrend) > 0) {
                trendConfidence = Math.min(20, 10 + Math.abs(m) * 100); // Reward positive trend
            }
        }
        
        double confidence = availabilityConfidence + varianceConfidence + trendConfidence;
        confidence = Math.max(10, Math.min(100, confidence)); // Min 10%, max 100%
        
        // Prepare historical data for chart
        List<Map<String, Object>> historicalData = new ArrayList<>();
        for (int i = 0; i < revenues.size(); i++) {
            Map<String, Object> dataPoint = new HashMap<>();
            YearMonth month = currentMonth.minusMonths(11 - i);
            dataPoint.put("month", month.toString()); // "YYYY-MM"
            try {
                dataPoint.put("monthName", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")));
            } catch (Exception e) {
                // Fallback to English if Vietnamese locale is not available
                dataPoint.put("monthName", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            }
            BigDecimal revenueValue = BigDecimal.valueOf(revenues.get(i)).setScale(2, RoundingMode.HALF_UP);
            dataPoint.put("revenue", revenueValue.doubleValue()); // Convert to double for JSON serialization
            historicalData.add(dataPoint);
        }
        
        // Add prediction data point - use the same predictedRevenue value
        Map<String, Object> predictionPoint = new HashMap<>();
        YearMonth nextMonth = currentMonth.plusMonths(1);
        predictionPoint.put("month", nextMonth.toString());
        try {
            predictionPoint.put("monthName", nextMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")));
        } catch (Exception e) {
            // Fallback to English if Vietnamese locale is not available
            predictionPoint.put("monthName", nextMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
        }
        // Ensure we use the same predictedRevenue value that's used in nextMonth
        BigDecimal predictedRevenueBD = BigDecimal.valueOf(predictedRevenue).setScale(2, RoundingMode.HALF_UP);
        predictionPoint.put("revenue", predictedRevenueBD.doubleValue()); // Convert to double for JSON serialization
        predictionPoint.put("isPrediction", true);
        historicalData.add(predictionPoint);
        
        log.debug("Added prediction point to historical data: month={}, revenue={}, isPrediction=true", 
            nextMonth, predictedRevenueBD.doubleValue());
        
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("nextMonth", predictedRevenueBD); // Keep as BigDecimal for precision in summary
        forecast.put("growthRate", BigDecimal.valueOf(growthRate).setScale(2, RoundingMode.HALF_UP));
        forecast.put("confidence", BigDecimal.valueOf(confidence).setScale(2, RoundingMode.HALF_UP));
        forecast.put("lastMonthRevenue", BigDecimal.valueOf(lastMonthRevenue).setScale(2, RoundingMode.HALF_UP));
        forecast.put("historicalData", historicalData);
        
        log.info("Revenue prediction: Next month = {}, Growth = {}%, Confidence = {}%", 
            predictedRevenue, growthRate, confidence);
        
        return forecast;
        } catch (Exception e) {
            log.error("Error calculating revenue prediction", e);
            return createEmptyRevenueForecast();
        }
    }
    
    private Map<String, Object> createEmptyRevenueForecast() {
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("nextMonth", BigDecimal.ZERO);
        forecast.put("growthRate", BigDecimal.ZERO);
        forecast.put("confidence", BigDecimal.ZERO);
        forecast.put("lastMonthRevenue", BigDecimal.ZERO);
        forecast.put("historicalData", new ArrayList<>());
        return forecast;
    }
    
    /**
     * Calculate booking forecast using Linear Regression and trend analysis
     * Based on last 12 months of booking data
     */
    private Map<String, Object> calculateBookingForecast() {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            if (bookings == null || bookings.isEmpty()) {
                log.warn("No bookings found for booking forecast");
                return createEmptyBookingForecast();
            }
            
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime now = LocalDateTime.now();
        
        // Get booking counts for last 12 months
        List<Long> monthlyBookings = new ArrayList<>();
        List<Integer> months = new ArrayList<>();
        
        for (int i = 11; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            int year = month.getYear();
            int monthValue = month.getMonthValue();
            
            long count = bookings.stream()
                .filter(b -> {
                    LocalDateTime createdAt = b.getCreatedAt();
                    return createdAt != null &&
                           createdAt.getYear() == year && 
                           createdAt.getMonthValue() == monthValue;
                })
                .count();
            
            monthlyBookings.add(count);
            months.add(12 - i); // 1, 2, 3, ..., 12
        }
        
        // Calculate average bookings per month
        double avgMonthlyBookings = monthlyBookings.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
        
        // Calculate Linear Regression for monthly forecast
        double n = monthlyBookings.size();
        double sumX = months.stream().mapToInt(Integer::intValue).sum();
        double sumY = monthlyBookings.stream().mapToLong(Long::longValue).sum();
        double sumXY = 0.0;
        double sumX2 = 0.0;
        
        for (int i = 0; i < months.size(); i++) {
            sumXY += months.get(i) * monthlyBookings.get(i);
            sumX2 += months.get(i) * months.get(i);
        }
        
        double denominator = n * sumX2 - sumX * sumX;
        if (denominator == 0 || Double.isNaN(denominator) || Double.isInfinite(denominator)) {
            log.warn("Cannot calculate linear regression for bookings: denominator is zero or invalid");
            return createEmptyBookingForecast();
        }
        
        double m = (n * sumXY - sumX * sumY) / denominator;
        double intercept = (sumY - m * sumX) / n;
        
        // Check for NaN or Infinity
        if (Double.isNaN(m) || Double.isInfinite(m) || Double.isNaN(intercept) || Double.isInfinite(intercept)) {
            log.warn("Linear regression for bookings produced invalid values (NaN or Infinity)");
            return createEmptyBookingForecast();
        }
        
        // Predict next month bookings (month 13)
        double predictedNextMonth = m * 13 + intercept;
        
        // If prediction is negative or very small, use average of recent months as fallback
        if (predictedNextMonth < 0 || predictedNextMonth < avgMonthlyBookings * 0.3) {
            log.debug("Linear regression prediction ({}) is too low, using average-based forecast", predictedNextMonth);
            // Use average of last 3 months if available, otherwise use overall average
            if (monthlyBookings.size() >= 3) {
                double lastThreeMonthsAvg = monthlyBookings.subList(monthlyBookings.size() - 3, monthlyBookings.size())
                    .stream()
                    .mapToLong(Long::longValue)
                    .average()
                    .orElse(avgMonthlyBookings);
                predictedNextMonth = Math.max(avgMonthlyBookings * 0.8, lastThreeMonthsAvg * 0.9); // Conservative estimate
            } else {
                predictedNextMonth = avgMonthlyBookings * 0.8; // Conservative estimate
            }
        }
        
        long nextMonthBookings = Math.max(0, Math.round(predictedNextMonth));
        log.debug("Next month bookings prediction: {} (from LR: {}, avg: {})", 
            nextMonthBookings, m * 13 + intercept, avgMonthlyBookings);
        
        // Calculate weekly forecast based on current month's average
        // Get bookings for current month so far
        LocalDateTime startOfCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long currentMonthBookingsSoFar = bookings.stream()
            .filter(booking -> {
                LocalDateTime createdAt = booking.getCreatedAt();
                return createdAt != null && createdAt.isAfter(startOfCurrentMonth) && createdAt.isBefore(now);
            })
            .count();
        
        // Calculate days passed in current month
        int daysPassed = now.getDayOfMonth();
        
        // Estimate average daily bookings for this month
        double avgDailyBookings = daysPassed > 0 ? (double) currentMonthBookingsSoFar / daysPassed : 0.0;
        
        // If no bookings this month yet, use average from recent months
        if (avgDailyBookings == 0 && avgMonthlyBookings > 0) {
            int daysInMonth = now.toLocalDate().lengthOfMonth();
            avgDailyBookings = avgMonthlyBookings / daysInMonth;
        }
        
        // Predict next week bookings (7 days ahead)
        // Based on average daily bookings and trend
        double nextWeekBookings = avgDailyBookings * 7;
        
        // Apply trend factor from monthly forecast
        if (avgMonthlyBookings > 0 && predictedNextMonth > 0) {
            double monthlyTrendFactor = predictedNextMonth / avgMonthlyBookings;
            if (monthlyTrendFactor > 0 && !Double.isNaN(monthlyTrendFactor) && !Double.isInfinite(monthlyTrendFactor)) {
                nextWeekBookings *= Math.min(2.0, Math.max(0.5, monthlyTrendFactor)); // Limit to 0.5x - 2x
            }
        }
        
        // If still 0, use monthly forecast divided by 4 weeks
        if (nextWeekBookings == 0 && predictedNextMonth > 0) {
            nextWeekBookings = predictedNextMonth / 4.0;
        }
        
        long nextWeekBookingsRounded = Math.max(0, Math.round(nextWeekBookings));
        
        // Calculate confidence based on data quality and variance (same improved formula)
        double mean = sumY / n;
        
        // Count non-zero months (actual data points)
        long nonZeroMonths = monthlyBookings.stream().mapToLong(count -> count > 0 ? 1 : 0).sum();
        double dataAvailabilityFactor = (double) nonZeroMonths / n;
        
        // Calculate variance only for non-zero values
        double variance = 0.0;
        if (nonZeroMonths > 1) {
            double nonZeroMean = monthlyBookings.stream().filter(count -> count > 0).mapToLong(Long::longValue).average().orElse(0.0);
            variance = monthlyBookings.stream()
                .filter(count -> count > 0)
                .mapToDouble(count -> Math.pow(count - nonZeroMean, 2))
                .sum() / nonZeroMonths;
        }
        double stdDev = Math.sqrt(variance);
        
        // Improved confidence calculation
        double coefficientOfVariation = (nonZeroMonths > 0 && mean > 0) ? (stdDev / mean) * 100 : 100.0;
        
        double availabilityConfidence = dataAvailabilityFactor * 40.0;
        double varianceConfidence = Math.max(0, Math.min(40, 40 - (coefficientOfVariation / 2.5)));
        
        double trendConfidence = 20.0;
        if (monthlyBookings.size() >= 3) {
            long recentTrend = monthlyBookings.get(monthlyBookings.size() - 1) - monthlyBookings.get(Math.max(0, monthlyBookings.size() - 4));
            if (Math.abs(recentTrend) > 0) {
                trendConfidence = Math.min(20, 10 + Math.abs(m) * 10);
            }
        }
        
        double confidence = availabilityConfidence + varianceConfidence + trendConfidence;
        confidence = Math.max(10, Math.min(100, confidence)); // Min 10%, max 100%
        
        // Prepare historical data for chart
        List<Map<String, Object>> historicalData = new ArrayList<>();
        for (int i = 0; i < monthlyBookings.size(); i++) {
            Map<String, Object> dataPoint = new HashMap<>();
            YearMonth month = currentMonth.minusMonths(11 - i);
            dataPoint.put("month", month.toString());
            try {
                dataPoint.put("monthName", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")));
            } catch (Exception e) {
                // Fallback to English if Vietnamese locale is not available
                dataPoint.put("monthName", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            }
            dataPoint.put("bookings", monthlyBookings.get(i));
            historicalData.add(dataPoint);
        }
        
        // Add prediction data point
        Map<String, Object> predictionPoint = new HashMap<>();
        YearMonth nextMonth = currentMonth.plusMonths(1);
        predictionPoint.put("month", nextMonth.toString());
        try {
            predictionPoint.put("monthName", nextMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("vi")));
        } catch (Exception e) {
            // Fallback to English if Vietnamese locale is not available
            predictionPoint.put("monthName", nextMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
        }
        
        // Ensure prediction is not 0 - use minimum value based on average if needed
        long finalPrediction = nextMonthBookings;
        if (finalPrediction == 0 && avgMonthlyBookings > 0) {
            finalPrediction = Math.max(1, Math.round(avgMonthlyBookings * 0.5)); // At least 50% of average
            log.debug("Prediction was 0, adjusted to {} based on average {}", finalPrediction, avgMonthlyBookings);
        }
        
        // Update nextMonthBookings to use the adjusted value (must be done before creating forecast)
        nextMonthBookings = finalPrediction;
        
        // Add prediction data point - ensure it uses the same value as nextMonth
        predictionPoint.put("bookings", (long) nextMonthBookings); // Explicitly cast to long for JSON serialization
        predictionPoint.put("isPrediction", true);
        historicalData.add(predictionPoint);
        
        log.debug("Added prediction point to historical data: month={}, bookings={}, isPrediction=true", 
            nextMonth, nextMonthBookings);
        
        // Weekly confidence is lower than monthly
        double weeklyConfidence = Math.max(0, confidence - 15);
        
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("nextWeek", nextWeekBookingsRounded);
        forecast.put("nextMonth", nextMonthBookings); // Use the adjusted value
        forecast.put("confidence", BigDecimal.valueOf(confidence).setScale(2, RoundingMode.HALF_UP));
        forecast.put("weeklyConfidence", BigDecimal.valueOf(weeklyConfidence).setScale(2, RoundingMode.HALF_UP));
        forecast.put("currentMonthSoFar", currentMonthBookingsSoFar);
        forecast.put("avgDailyBookings", BigDecimal.valueOf(avgDailyBookings).setScale(2, RoundingMode.HALF_UP));
        forecast.put("historicalData", historicalData);
        
        log.info("Booking forecast: Next week = {}, Next month = {}, Confidence = {}%", 
            nextWeekBookingsRounded, nextMonthBookings, confidence);
        
        return forecast;
        } catch (Exception e) {
            log.error("Error calculating booking forecast", e);
            return createEmptyBookingForecast();
        }
    }
    
    private Map<String, Object> createEmptyBookingForecast() {
        Map<String, Object> forecast = new HashMap<>();
        forecast.put("nextWeek", 0L);
        forecast.put("nextMonth", 0L);
        forecast.put("confidence", BigDecimal.ZERO);
        forecast.put("weeklyConfidence", BigDecimal.ZERO);
        forecast.put("currentMonthSoFar", 0L);
        forecast.put("avgDailyBookings", BigDecimal.ZERO);
        forecast.put("historicalData", new ArrayList<>());
        return forecast;
    }
    
    /**
     * Calculate churn prediction: Identify users at risk of leaving
     * Users are at risk if they haven't booked a tour for > 60 days
     */
    private Map<String, Object> calculateChurnPrediction() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Get all active users (excluding admins)
            List<User> allUsers = userRepository.findAll().stream()
            .filter(u -> u.getDeletedAt() == null && 
                        u.getStatus() == User.UserStatus.ACTIVE &&
                        (u.getRole() == null || !u.getRole().getName().equalsIgnoreCase("ADMIN")))
            .toList();
        
        List<Map<String, Object>> atRiskUsers = new ArrayList<>();
        int lowRiskCount = 0;
        int mediumRiskCount = 0;
        int highRiskCount = 0;
        
        for (User user : allUsers) {
            // Find user's last booking
            List<Booking> userBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getUser() != null && b.getUser().getId().equals(user.getId()) && b.getCreatedAt() != null)
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
            
            if (userBookings.isEmpty()) {
                // User never booked - skip (they are new users or not engaged yet)
                continue;
            }
            
            Booking lastBooking = userBookings.get(0);
            LocalDateTime lastBookingDate = lastBooking.getCreatedAt();
            if (lastBookingDate == null) {
                continue; // Skip if no booking date
            }
            
            // Calculate days since last booking
            long daysSinceLastBooking = java.time.temporal.ChronoUnit.DAYS.between(lastBookingDate, now);
            
            String riskLevel = "LOW";
            if (daysSinceLastBooking > 90) {
                riskLevel = "HIGH";
                highRiskCount++;
            } else if (daysSinceLastBooking > 60) {
                riskLevel = "MEDIUM";
                mediumRiskCount++;
            } else {
                lowRiskCount++;
                continue; // Not at risk
            }
            
            // Add to at-risk users list (limit to top 10 for response size)
            if (atRiskUsers.size() < 10) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", user.getId());
                userInfo.put("userName", user.getName());
                userInfo.put("userEmail", user.getEmail());
                userInfo.put("daysSinceLastBooking", daysSinceLastBooking);
                userInfo.put("lastBookingDate", lastBookingDate);
                userInfo.put("totalBookings", userBookings.size());
                userInfo.put("riskLevel", riskLevel);
                atRiskUsers.add(userInfo);
            }
        }
        
        // Determine overall risk level
        int totalAtRisk = mediumRiskCount + highRiskCount;
        String overallRiskLevel = "LOW";
        if (totalAtRisk > 0) {
            double highRiskPercentage = (double) highRiskCount / totalAtRisk * 100;
            if (highRiskPercentage >= 50) {
                overallRiskLevel = "HIGH";
            } else if (highRiskPercentage >= 20 || totalAtRisk >= 10) {
                overallRiskLevel = "MEDIUM";
            } else {
                overallRiskLevel = "LOW";
            }
        }
        
        Map<String, Object> churnPrediction = new HashMap<>();
        churnPrediction.put("atRiskUsers", totalAtRisk);
        churnPrediction.put("lowRisk", lowRiskCount);
        churnPrediction.put("mediumRisk", mediumRiskCount);
        churnPrediction.put("highRisk", highRiskCount);
        churnPrediction.put("riskLevel", overallRiskLevel);
        churnPrediction.put("topAtRiskUsers", atRiskUsers);
        
        log.info("Churn prediction: {} users at risk ({} HIGH, {} MEDIUM), Overall risk: {}", 
            totalAtRisk, highRiskCount, mediumRiskCount, overallRiskLevel);
        
        return churnPrediction;
        } catch (Exception e) {
            log.error("Error calculating churn prediction", e);
            // Return empty churn prediction on error
            Map<String, Object> emptyChurn = new HashMap<>();
            emptyChurn.put("atRiskUsers", 0);
            emptyChurn.put("lowRisk", 0);
            emptyChurn.put("mediumRisk", 0);
            emptyChurn.put("highRisk", 0);
            emptyChurn.put("riskLevel", "LOW");
            emptyChurn.put("topAtRiskUsers", new ArrayList<>());
            return emptyChurn;
        }
    }
    
    /**
     * Generate alerts based on AI predictions
     * Alerts for anomalies, churn risks, and significant changes
     */
    private List<Map<String, Object>> generateAlerts(
            Map<String, Object> revenueForecast,
            Map<String, Object> bookingForecast,
            Map<String, Object> churnPrediction) {
        
        try {
            List<Map<String, Object>> alerts = new ArrayList<>();
        
        // Check revenue forecast
        if (revenueForecast != null) {
            BigDecimal growthRate = (BigDecimal) revenueForecast.get("growthRate");
            if (growthRate != null && growthRate.doubleValue() < -10) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("type", "WARNING");
                alert.put("severity", "MEDIUM");
                alert.put("title", "Doanh thu dự đoán giảm");
                alert.put("message", String.format("Dự đoán doanh thu tháng tới giảm %.2f%%", growthRate.doubleValue()));
                alert.put("icon", "📉");
                alerts.add(alert);
            } else if (growthRate != null && growthRate.doubleValue() > 20) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("type", "SUCCESS");
                alert.put("severity", "LOW");
                alert.put("title", "Doanh thu dự đoán tăng mạnh");
                alert.put("message", String.format("Dự đoán doanh thu tháng tới tăng %.2f%%", growthRate.doubleValue()));
                alert.put("icon", "📈");
                alerts.add(alert);
            }
        }
        
        // Check churn prediction
        if (churnPrediction != null) {
            Integer atRiskUsers = (Integer) churnPrediction.get("atRiskUsers");
            String riskLevel = (String) churnPrediction.get("riskLevel");
            
            if (atRiskUsers != null && atRiskUsers > 0) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("type", "WARNING");
                alert.put("severity", riskLevel.equals("HIGH") ? "HIGH" : "MEDIUM");
                alert.put("title", "Users có nguy cơ rời bỏ");
                alert.put("message", String.format("Có %d users có nguy cơ rời bỏ (Risk level: %s)", atRiskUsers, riskLevel));
                alert.put("icon", "⚠️");
                alerts.add(alert);
            }
        }
        
        // Check booking forecast
        if (bookingForecast != null) {
            Long nextWeek = (Long) bookingForecast.get("nextWeek");
            Long currentMonthSoFar = (Long) bookingForecast.get("currentMonthSoFar");
            
            if (nextWeek != null && currentMonthSoFar != null && currentMonthSoFar > 0) {
                // Estimate weekly average from current month
                int daysPassed = LocalDateTime.now().getDayOfMonth();
                double avgWeekly = daysPassed > 0 ? (double) currentMonthSoFar / daysPassed * 7 : currentMonthSoFar.doubleValue();
                
                if (nextWeek < avgWeekly * 0.7) {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("type", "WARNING");
                    alert.put("severity", "MEDIUM");
                    alert.put("title", "Booking dự đoán giảm");
                    alert.put("message", String.format("Dự đoán booking tuần tới (%d) thấp hơn mức trung bình", nextWeek));
                    alert.put("icon", "📅");
                    alerts.add(alert);
                }
            }
        }
        
        return alerts;
        } catch (Exception e) {
            log.error("Error generating alerts", e);
            // Return empty alerts list on error
            return new ArrayList<>();
        }
    }
    
    // ================================
    // AI CONTENT GENERATION
    // ================================
    
    @PostMapping("/generate-content")
    @Operation(summary = "Generate content using AI", description = "Generate tour descriptions, email templates, SEO meta, or promotion copy")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateContent(
            @RequestBody Map<String, Object> request) {
        try {
            String type = (String) request.get("type");
            Map<String, Object> data = request.get("data") != null ? 
                (Map<String, Object>) request.get("data") : new HashMap<>();
            
            // TODO: Implement actual AI content generation
            // For now, return mock response
            Map<String, Object> response = new HashMap<>();
            response.put("type", type);
            response.put("content", "AI generated content will be here");
            response.put("status", "success");
            response.put("dataUsed", data); // Use data to avoid warning
            
            log.info("AI content generated for type: {}, data keys: {}", type, data.keySet());
            return ResponseEntity.ok(success("Content generated successfully", response));
        } catch (Exception e) {
            log.error("Error generating AI content", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to generate content: " + e.getMessage()));
        }
    }
}

