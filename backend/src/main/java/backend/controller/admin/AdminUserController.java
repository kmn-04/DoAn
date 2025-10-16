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
    @Operation(summary = "Delete user permanently")
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
                if (status == User.UserStatus.ACTIVE) {
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
        try {
            List<Map<String, Object>> suspiciousUsers = new java.util.ArrayList<>();
            
            // Get all users
            Pageable pageable = PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt"));
            List<User> allUsers = userService.getAllUsers(pageable).getContent();
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime last7Days = now.minusDays(7);
            LocalDateTime last24Hours = now.minusDays(1);
            
            for (User user : allUsers) {
                List<String> suspiciousReasons = new java.util.ArrayList<>();
                int suspicionScore = 0;
                
                // Check 1: Banned or Suspended status
                if (user.getStatus() == User.UserStatus.BANNED) {
                    suspiciousReasons.add("Account banned");
                    suspicionScore += 100;
                } else if (user.getStatus() == User.UserStatus.INACTIVE) {
                    suspiciousReasons.add("Account inactive");
                    suspicionScore += 20;
                }
                
                // Check 2: Multiple active sessions from different IPs
                List<UserSession> userSessions = userSessionService.getActiveSessions().stream()
                        .filter(s -> s.getUser() != null && s.getUser().getId().equals(user.getId()))
                        .toList();
                
                if (userSessions.size() > 3) {
                    suspiciousReasons.add(String.format("Multiple active sessions (%d)", userSessions.size()));
                    suspicionScore += 30;
                }
                
                // Check 3: Multiple different IP locations
                long distinctIPs = userSessions.stream()
                        .filter(s -> s.getIpAddress() != null)
                        .map(UserSession::getIpAddress)
                        .distinct()
                        .count();
                
                if (distinctIPs > 3) {
                    suspiciousReasons.add(String.format("Multiple IP addresses (%d)", distinctIPs));
                    suspicionScore += 40;
                }
                
                // Check 4: Recent account creation (new accounts are often flagged for review)
                if (user.getCreatedAt() != null && user.getCreatedAt().isAfter(last7Days)) {
                    suspiciousReasons.add("Recently created account");
                    suspicionScore += 15;
                }
                
                // Check 5: Multiple sessions from same IP or device
                // (We can expand this check later with booking data if needed)
                long sameIPCount = userSessions.stream()
                        .filter(s -> s.getIpAddress() != null)
                        .collect(java.util.stream.Collectors.groupingBy(UserSession::getIpAddress, java.util.stream.Collectors.counting()))
                        .values().stream()
                        .max(Long::compareTo)
                        .orElse(0L);
                
                if (sameIPCount > 5) {
                    suspiciousReasons.add(String.format("Multiple sessions from same IP (%d)", sameIPCount));
                    suspicionScore += 25;
                }
                
                // Only add users with suspicion score >= 30
                if (suspicionScore >= 30) {
                    Map<String, Object> suspiciousUser = new java.util.HashMap<>();
                    suspiciousUser.put("userId", user.getId());
                    suspiciousUser.put("email", user.getEmail());
                    suspiciousUser.put("name", user.getName());
                    suspiciousUser.put("status", user.getStatus().toString());
                    suspiciousUser.put("createdAt", user.getCreatedAt());
                    suspiciousUser.put("suspicionScore", suspicionScore);
                    suspiciousUser.put("reasons", suspiciousReasons);
                    suspiciousUser.put("activeSessions", userSessions.size());
                    suspiciousUser.put("distinctIPs", distinctIPs);
                    
                    suspiciousUsers.add(suspiciousUser);
                }
            }
            
            // Sort by suspicion score DESC
            suspiciousUsers.sort((a, b) -> 
                Integer.compare((Integer) b.get("suspicionScore"), (Integer) a.get("suspicionScore"))
            );
            
            log.info("Found {} users with suspicious activity", suspiciousUsers.size());
            return ResponseEntity.ok(success("Suspicious activity retrieved", suspiciousUsers));
            
        } catch (Exception e) {
            log.error("Error detecting suspicious activity", e);
            return ResponseEntity.ok(success("Suspicious activity retrieved (error)", List.of()));
        }
    }
    
    @GetMapping("/login-attempts")
    @Operation(summary = "Get failed login attempts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFailedLoginAttempts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "100") int limit) {
        
        final LocalDateTime finalStartDate = (startDate == null) ? LocalDateTime.now().minusDays(7) : startDate;
        final LocalDateTime finalEndDate = (endDate == null) ? LocalDateTime.now() : endDate;
        
        try {
            List<Map<String, Object>> failedAttempts = new java.util.ArrayList<>();
            
            // Get failed login activities
            List<UserActivity> failedLogins = userActivityService
                    .getActivitiesByType(UserActivity.ActivityType.FAILED_LOGIN).stream()
                    .filter(a -> a.getCreatedAt() != null && 
                                 a.getCreatedAt().isAfter(finalStartDate) && 
                                 a.getCreatedAt().isBefore(finalEndDate))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(limit)
                    .toList();
            
            // Group by email/IP to detect patterns
            Map<String, Long> attemptsByEmail = new java.util.HashMap<>();
            Map<String, Long> attemptsByIP = new java.util.HashMap<>();
            
            for (UserActivity activity : failedLogins) {
                Map<String, Object> attempt = new java.util.HashMap<>();
                attempt.put("id", activity.getId());
                attempt.put("timestamp", activity.getCreatedAt());
                attempt.put("ipAddress", activity.getIpAddress());
                attempt.put("userAgent", activity.getUserAgent());
                
                // Parse activity data (JSON) to get email
                String activityData = activity.getActivityData();
                String email = null;
                if (activityData != null && activityData.contains("email")) {
                    try {
                        // Simple JSON parsing for email
                        int emailStart = activityData.indexOf("\"email\"");
                        if (emailStart > 0) {
                            int valueStart = activityData.indexOf(":", emailStart) + 1;
                            int valueEnd = activityData.indexOf(",", valueStart);
                            if (valueEnd < 0) valueEnd = activityData.indexOf("}", valueStart);
                            if (valueStart > 0 && valueEnd > valueStart) {
                                email = activityData.substring(valueStart, valueEnd)
                                        .trim()
                                        .replace("\"", "")
                                        .replace("'", "");
                            }
                        }
                    } catch (Exception e) {
                        log.debug("Could not parse email from activity data: {}", e.getMessage());
                    }
                }
                
                attempt.put("email", email);
                attempt.put("reason", "Invalid credentials");
                
                // Count attempts
                if (email != null) {
                    attemptsByEmail.merge(email, 1L, Long::sum);
                    attempt.put("emailAttemptCount", attemptsByEmail.get(email));
                }
                
                if (activity.getIpAddress() != null) {
                    attemptsByIP.merge(activity.getIpAddress(), 1L, Long::sum);
                    attempt.put("ipAttemptCount", attemptsByIP.get(activity.getIpAddress()));
                }
                
                // Flag suspicious patterns
                boolean suspicious = false;
                List<String> flags = new java.util.ArrayList<>();
                
                if (email != null && attemptsByEmail.get(email) > 5) {
                    suspicious = true;
                    flags.add("Multiple attempts on same email");
                }
                
                if (activity.getIpAddress() != null && attemptsByIP.get(activity.getIpAddress()) > 10) {
                    suspicious = true;
                    flags.add("Multiple attempts from same IP");
                }
                
                attempt.put("suspicious", suspicious);
                attempt.put("flags", flags);
                
                failedAttempts.add(attempt);
            }
            
            // Add summary statistics
            Map<String, Object> summary = new java.util.HashMap<>();
            summary.put("totalAttempts", failedLogins.size());
            summary.put("uniqueEmails", attemptsByEmail.size());
            summary.put("uniqueIPs", attemptsByIP.size());
            summary.put("dateRange", Map.of(
                    "start", finalStartDate,
                    "end", finalEndDate
            ));
            
            // Find top offenders
            List<Map<String, Object>> topEmails = attemptsByEmail.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(5)
                    .map(e -> Map.of("email", (Object) e.getKey(), "attempts", e.getValue()))
                    .toList();
            
            List<Map<String, Object>> topIPs = attemptsByIP.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(5)
                    .map(e -> Map.of("ip", (Object) e.getKey(), "attempts", e.getValue()))
                    .toList();
            
            summary.put("topEmails", topEmails);
            summary.put("topIPs", topIPs);
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("attempts", failedAttempts);
            response.put("summary", summary);
            
            log.info("Retrieved {} failed login attempts", failedLogins.size());
            return ResponseEntity.ok(success("Failed login attempts retrieved", response));
            
        } catch (Exception e) {
            log.error("Error retrieving failed login attempts", e);
            Map<String, Object> emptyResponse = Map.of(
                    "attempts", List.of(),
                    "summary", Map.of("totalAttempts", 0)
            );
            return ResponseEntity.ok(success("Failed login attempts retrieved (error)", emptyResponse));
        }
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
