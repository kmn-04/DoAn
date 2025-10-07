package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.dto.response.UserResponse;
import backend.entity.Role;
import backend.entity.User;
import backend.entity.UserActivity;
import backend.entity.UserSession;
import backend.mapper.EntityMapper;
import backend.repository.RoleRepository;
import backend.service.UserService;
import backend.service.UserActivityService;
import backend.service.UserSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin User Management", description = "Admin APIs for managing users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminUserController extends BaseController {
    
    private final UserService userService;
    private final UserActivityService userActivityService;
    private final UserSessionService userSessionService;
    private final EntityMapper mapper;
    private final RoleRepository roleRepository;
    
    // ================================
    // USER MANAGEMENT
    // ================================
    
    @GetMapping
    @Operation(summary = "Get all users with pagination and filters")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role) {
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userService.searchUsers(search.trim(), pageable);
        } else {
            users = userService.getAllUsers(pageable);
        }
        
        // Force load roles to avoid LazyInitializationException
        users.forEach(user -> {
            if (user.getRole() != null) {
                user.getRole().getName();
            }
        });
        
        return ResponseEntity.ok(successPage(users));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(success("User retrieved successfully", user)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create new user")
    @Transactional
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody Map<String, Object> requestData) {
        try {
            log.info("Creating new user with data: {}", requestData);
            
            User user = new User();
            user.setName((String) requestData.get("name"));
            user.setEmail((String) requestData.get("email"));
            user.setPassword((String) requestData.get("password"));
            user.setPhone((String) requestData.get("phone"));
            
            // Set role
            if (requestData.containsKey("roleId")) {
                Long roleId = Long.valueOf(requestData.get("roleId").toString());
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Role not found with ID: " + roleId));
                user.setRole(role);
            }
            
            // Set status
            if (requestData.containsKey("status")) {
                String statusStr = (String) requestData.get("status");
                user.setStatus(User.UserStatus.valueOf(statusStr));
            }
            
            User createdUser = userService.createUser(user);
            
            // Force load role to avoid LazyInitializationException
            if (createdUser.getRole() != null) {
                createdUser.getRole().getName();
            }
            
            return ResponseEntity.ok(success("User created successfully", createdUser));
        } catch (Exception e) {
            log.error("Error creating user", e);
            return ResponseEntity.badRequest().body(error("Failed to create user: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    @Transactional
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> requestData) {
        try {
            log.info("Updating user {} with data: {}", id, requestData);
            
            User user = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
            
            // Update basic fields
            if (requestData.containsKey("name")) {
                user.setName((String) requestData.get("name"));
            }
            if (requestData.containsKey("email")) {
                user.setEmail((String) requestData.get("email"));
            }
            if (requestData.containsKey("password") && !((String) requestData.get("password")).isEmpty()) {
                user.setPassword((String) requestData.get("password"));
            }
            if (requestData.containsKey("phone")) {
                user.setPhone((String) requestData.get("phone"));
            }
            
            // Set role
            if (requestData.containsKey("roleId")) {
                Long roleId = Long.valueOf(requestData.get("roleId").toString());
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Role not found with ID: " + roleId));
                user.setRole(role);
            }
            
            // Set status
            if (requestData.containsKey("status")) {
                String statusStr = (String) requestData.get("status");
                user.setStatus(User.UserStatus.valueOf(statusStr));
            }
            
            User updatedUser = userService.updateUser(id, user);
            
            // Force load role to avoid LazyInitializationException
            if (updatedUser.getRole() != null) {
                updatedUser.getRole().getName();
            }
            
            return ResponseEntity.ok(success("User updated successfully", updatedUser));
        } catch (Exception e) {
            log.error("Error updating user", e);
            return ResponseEntity.badRequest().body(error("Failed to update user: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user status")
    @Transactional
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam User.UserStatus status) {
        
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        user.setStatus(status);
        User updatedUser = userService.updateUser(id, user);
        
        // Force load role to avoid lazy loading
        if (updatedUser.getRole() != null) {
            updatedUser.getRole().getName(); // Initialize proxy
        }
        
        // Convert to DTO
        UserResponse response = mapper.toUserResponse(updatedUser);
        
        return ResponseEntity.ok(success("User status updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete user")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            log.info("Deleting user with ID: {}", id);
            userService.deleteUser(id);
            return ResponseEntity.ok(success("User deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting user ID: {}", id, e);
            return ResponseEntity.badRequest().body(error("Failed to delete user: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/bulk/status")
    @Operation(summary = "Bulk update user status")
    public ResponseEntity<ApiResponse<String>> bulkUpdateStatus(
            @RequestBody List<Long> userIds,
            @RequestParam User.UserStatus status) {
        
        int updatedCount = 0;
        for (Long userId : userIds) {
            try {
                if (status == User.UserStatus.Active) {
                    userService.activateUser(userId);
                } else {
                    userService.deactivateUser(userId);
                }
                updatedCount++;
            } catch (Exception e) {
                log.error("Failed to update user status for ID: {}", userId, e);
            }
        }
        
        return ResponseEntity.ok(success("Updated status for " + updatedCount + " users"));
    }
    
    @DeleteMapping("/bulk")
    @Operation(summary = "Bulk delete users")
    public ResponseEntity<ApiResponse<String>> bulkDeleteUsers(@RequestBody List<Long> userIds) {
        int deletedCount = 0;
        for (Long userId : userIds) {
            try {
                userService.deleteUser(userId);
                deletedCount++;
            } catch (Exception e) {
                log.error("Failed to delete user ID: {}", userId, e);
            }
        }
        
        return ResponseEntity.ok(success("Deleted " + deletedCount + " users"));
    }
    
    // ================================
    // USER STATISTICS
    // ================================
    
    @GetMapping("/stats")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<ApiResponse<UserService.UserStatistics>> getUserStats() {
        UserService.UserStatistics stats = userService.getUserStatistics();
        return ResponseEntity.ok(success("User statistics retrieved successfully", stats));
    }
    
    @GetMapping("/stats/activity")
    @Operation(summary = "Get user activity statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserActivityStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();
        
        // Get activity statistics using UserActivityService
        UserActivityService.ActivityStatistics activityStats = userActivityService.getActivityStatistics();
        
        Map<String, Object> stats = Map.of(
            "totalActivities", activityStats.getTotalActivities(),
            "todayActivities", activityStats.getTodayActivities(),
            "weekActivities", activityStats.getWeekActivities(),
            "monthActivities", activityStats.getMonthActivities(),
            "loginCount", activityStats.getLoginCount(),
            "pageViewCount", activityStats.getPageViewCount(),
            "bookingCount", activityStats.getBookingCount(),
            "searchCount", activityStats.getSearchCount()
        );
        
        return ResponseEntity.ok(success("User activity statistics retrieved", stats));
    }
    
    @GetMapping("/stats/sessions")
    @Operation(summary = "Get user session statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserSessionStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
        if (endDate == null) endDate = LocalDateTime.now();
        
        // Get session statistics using UserSessionService
        UserSessionService.SessionStatistics sessionStats = userSessionService.getSessionStatistics();
        
        Map<String, Object> stats = Map.of(
            "totalSessions", sessionStats.getTotalSessions(),
            "activeSessions", sessionStats.getActiveSessions(),
            "todaySessions", sessionStats.getTodaySessions(),
            "weekSessions", sessionStats.getWeekSessions(),
            "monthSessions", sessionStats.getMonthSessions(),
            "uniqueUsers", sessionStats.getUniqueUsers(),
            "desktopSessions", sessionStats.getDesktopSessions(),
            "mobileSessions", sessionStats.getMobileSessions(),
            "tabletSessions", sessionStats.getTabletSessions(),
            "averageSessionDuration", sessionStats.getAverageSessionDuration()
        );
        
        return ResponseEntity.ok(success("User session statistics retrieved", stats));
    }
    
    // ================================
    // USER ACTIVITIES
    // ================================
    
    @GetMapping("/{id}/activities")
    @Operation(summary = "Get user activities")
    public ResponseEntity<ApiResponse<PageResponse<UserActivity>>> getUserActivities(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // Get user activities using UserActivityService
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserActivity> activities = userActivityService.getActivitiesByUserId(id, pageable);
        return ResponseEntity.ok(successPage(activities));
    }
    
    @GetMapping("/{id}/sessions")
    @Operation(summary = "Get user sessions")
    public ResponseEntity<ApiResponse<PageResponse<UserSession>>> getUserSessions(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // Get user sessions using UserSessionService
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserSession> sessions = userSessionService.getSessionsByUserId(id, pageable);
        return ResponseEntity.ok(successPage(sessions));
    }
    
    @PostMapping("/{id}/sessions/force-logout")
    @Operation(summary = "Force logout all user sessions")
    public ResponseEntity<ApiResponse<String>> forceLogoutUser(@PathVariable Long id) {
        // Force logout user sessions using UserSessionService
        int loggedOutSessions = userSessionService.forceLogoutUser(id, "ADMIN_FORCE");
        return ResponseEntity.ok(success("Logged out " + loggedOutSessions + " sessions"));
    }
    
    // ================================
    // ONLINE USERS
    // ================================
    
    @GetMapping("/online")
    @Operation(summary = "Get online users")
    public ResponseEntity<ApiResponse<List<User>>> getOnlineUsers() {
        // TODO: Implement based on lastActivityAt field
        List<User> onlineUsers = List.of(); // userService.getOnlineUsers();
        return ResponseEntity.ok(success("Online users retrieved", onlineUsers));
    }
    
    @GetMapping("/recent-activity")
    @Operation(summary = "Get users with recent activity")
    public ResponseEntity<ApiResponse<List<User>>> getRecentActiveUsers(
            @RequestParam(defaultValue = "50") int limit) {
        
        // TODO: Implement based on lastActivityAt field
        List<User> recentUsers = List.of(); // userService.getRecentActiveUsers(limit);
        return ResponseEntity.ok(success("Recent active users retrieved", recentUsers));
    }
    
    // ================================
    // SECURITY & MONITORING
    // ================================
    
    @GetMapping("/suspicious-activity")
    @Operation(summary = "Get users with suspicious activity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSuspiciousActivity() {
        // TODO: Implement suspicious activity detection
        List<Map<String, Object>> suspiciousUsers = List.of();
        return ResponseEntity.ok(success("Suspicious activity retrieved", suspiciousUsers));
    }
    
    @GetMapping("/login-attempts")
    @Operation(summary = "Get failed login attempts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFailedLoginAttempts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (startDate == null) startDate = LocalDateTime.now().minusDays(7);
        if (endDate == null) endDate = LocalDateTime.now();
        
        // TODO: Implement failed login tracking
        List<Map<String, Object>> failedAttempts = List.of();
        return ResponseEntity.ok(success("Failed login attempts retrieved", failedAttempts));
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total users count", description = "Get total number of users")
    public ResponseEntity<ApiResponse<Long>> getTotalUsersCount() {
        try {
            long count = userService.getTotalUsers();
            return ResponseEntity.ok(success("Total users count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting users count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get users count: " + e.getMessage()));
        }
    }
}
