package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserStats userStats;
    private TourStats tourStats;
    private BookingStats bookingStats;
    private RevenueStats revenueStats;
    private List<RecentActivity> recentActivities;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long activeUsers;
        private long newUsersThisMonth;
        private long verifiedUsers;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourStats {
        private long totalTours;
        private long activeTours;
        private long featuredTours;
        private double averageRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingStats {
        private long totalBookings;
        private long pendingBookings;
        private long confirmedBookings;
        private long completedBookings;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private BigDecimal dailyRevenue;
        private double growthRate;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;
        private String description;
        private String timestamp;
        private String userInfo;
    }
}
