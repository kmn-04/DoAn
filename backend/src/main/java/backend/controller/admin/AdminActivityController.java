package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.entity.Booking;
import backend.entity.Review;
import backend.entity.User;
import backend.repository.BookingRepository;
import backend.repository.ReviewRepository;
import backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/activities")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Activities", description = "Admin APIs for recent activities")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminActivityController extends BaseController {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @GetMapping("/recent")
    @Operation(summary = "Get recent activities", description = "Get recent system activities for dashboard")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> activities = new ArrayList<>();

            // Get recent bookings
            List<Booking> recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

            for (Booking booking : recentBookings) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "booking");
                activity.put("icon", "📦");
                activity.put("title", "Booking mới");
                activity.put("description", 
                    (booking.getCustomerName() != null ? booking.getCustomerName() : "Khách hàng") + 
                    " đặt " + 
                    (booking.getTour() != null ? booking.getTour().getName() : "tour"));
                activity.put("time", booking.getCreatedAt());
                activity.put("timeAgo", getTimeAgo(booking.getCreatedAt()));
                activity.put("status", booking.getConfirmationStatus() != null ? booking.getConfirmationStatus().name() : "");
                activities.add(activity);
            }

            // Get recent reviews
            List<Review> recentReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .collect(Collectors.toList());

            for (Review review : recentReviews) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "review");
                activity.put("icon", "⭐");
                activity.put("title", "Đánh giá mới");
                activity.put("description", 
                    (review.getUser() != null && review.getUser().getName() != null ? review.getUser().getName() : "Khách") + 
                    " đánh giá " + review.getRating() + "/5");
                activity.put("time", review.getCreatedAt());
                activity.put("timeAgo", getTimeAgo(review.getCreatedAt()));
                activity.put("status", review.getStatus() != null ? review.getStatus().name() : "");
                activities.add(activity);
            }

            // Get recent users
            List<User> recentUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(3)
                .collect(Collectors.toList());

            for (User user : recentUsers) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "user");
                activity.put("icon", "👤");
                activity.put("title", "User mới");
                activity.put("description", 
                    (user.getName() != null ? user.getName() : user.getEmail()) + 
                    " đăng ký tài khoản");
                activity.put("time", user.getCreatedAt());
                activity.put("timeAgo", getTimeAgo(user.getCreatedAt()));
                activity.put("status", "new");
                activities.add(activity);
            }

            // Sort all activities by time and limit
            List<Map<String, Object>> sortedActivities = activities.stream()
                .sorted((a, b) -> {
                    LocalDateTime timeA = (LocalDateTime) a.get("time");
                    LocalDateTime timeB = (LocalDateTime) b.get("time");
                    return timeB.compareTo(timeA);
                })
                .limit(limit)
                .collect(Collectors.toList());

            return ResponseEntity.ok(success("Recent activities retrieved successfully", sortedActivities));
        } catch (Exception e) {
            log.error("Error getting recent activities", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get recent activities: " + e.getMessage()));
        }
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Vừa xong";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (minutes < 1) {
            return "Vừa xong";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else if (hours < 24) {
            return hours + " giờ trước";
        } else if (days < 7) {
            return days + " ngày trước";
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return dateTime.format(formatter);
        }
    }
}

