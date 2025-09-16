package backend.controller;

import backend.model.ActivityLog;
import backend.model.ActionType;
import backend.model.User;
import backend.repository.ActivityLogRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityLogController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get activity logs for a specific user
     * Admin can view any user's logs, users can only view their own logs
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or (#userId == authentication.principal.id)")
    public ResponseEntity<?> getUserActivityLogs(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) ActionType actionType,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        try {
            System.out.println("🔍 Getting activity logs for user: " + userId);
            System.out.println("📊 Filters - actionType: " + actionType + ", fromDate: " + fromDate + ", toDate: " + toDate);

            // Find user
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();

            // Create pageable
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            // Parse date strings to LocalDateTime
            LocalDateTime fromDateTime = null;
            LocalDateTime toDateTime = null;

            try {
                if (fromDate != null && !fromDate.isEmpty()) {
                    System.out.println("📅 Parsing fromDate: " + fromDate);
                    fromDateTime = LocalDate.parse(fromDate).atStartOfDay();
                    System.out.println("📅 Parsed fromDateTime: " + fromDateTime);
                }
                if (toDate != null && !toDate.isEmpty()) {
                    System.out.println("📅 Parsing toDate: " + toDate);
                    toDateTime = LocalDate.parse(toDate).atTime(23, 59, 59);
                    System.out.println("📅 Parsed toDateTime: " + toDateTime);
                }
            } catch (Exception e) {
                System.err.println("❌ Date parsing error: " + e.getMessage());
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid date format. Use YYYY-MM-DD"));
            }

            // Get activity logs with filters
            Page<ActivityLog> logPage = activityLogRepository.findByUserWithFilters(
                user, actionType, fromDateTime, toDateTime, pageable);

            System.out.println("📊 Found " + logPage.getTotalElements() + " activity logs");

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("logs", logPage.getContent());
            response.put("currentPage", page);
            response.put("totalItems", logPage.getTotalElements());
            response.put("totalPages", logPage.getTotalPages());
            response.put("pageSize", size);
            response.put("hasNext", logPage.hasNext());
            response.put("hasPrevious", logPage.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error getting activity logs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Internal server error"));
        }
    }

    /**
     * Get all activity logs (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        try {
            // Create pageable
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            // Parse dates
            LocalDateTime fromDateTime = null;
            LocalDateTime toDateTime = null;

            if (fromDate != null && !fromDate.isEmpty()) {
                fromDateTime = LocalDate.parse(fromDate).atStartOfDay();
            }
            if (toDate != null && !toDate.isEmpty()) {
                toDateTime = LocalDate.parse(toDate).atTime(23, 59, 59);
            }

            // Get all logs with date filter
            Page<ActivityLog> logPage = activityLogRepository.findAllWithDateRange(
                fromDateTime, toDateTime, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("logs", logPage.getContent());
            response.put("currentPage", page);
            response.put("totalItems", logPage.getTotalElements());
            response.put("totalPages", logPage.getTotalPages());
            response.put("pageSize", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error getting all activity logs: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Internal server error"));
        }
    }

    /**
     * Create activity log (for system tracking)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> createActivityLog(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            ActionType actionType = ActionType.valueOf(request.get("actionType").toString());
            String targetObject = (String) request.get("targetObject");
            String details = (String) request.get("details");
            String ipAddress = (String) request.get("ipAddress");
            String location = (String) request.get("location");
            String device = (String) request.get("device");

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "User not found"));
            }

            ActivityLog log = new ActivityLog(userOpt.get(), actionType, targetObject, details, 
                                            ipAddress, location, device);
            
            ActivityLog savedLog = activityLogRepository.save(log);
            
            return ResponseEntity.ok(savedLog);

        } catch (Exception e) {
            System.err.println("❌ Error creating activity log: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Error creating activity log: " + e.getMessage()));
        }
    }

    /**
     * Get activity statistics for a user
     */
    @GetMapping("/user/{userId}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or (#userId == authentication.principal.id)")
    public ResponseEntity<?> getUserActivityStats(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalLogs", activityLogRepository.countByUser(user));
            stats.put("loginCount", activityLogRepository.countByUserAndActionType(user, ActionType.LOGIN));
            stats.put("bookingCount", activityLogRepository.countByUserAndActionType(user, ActionType.CREATE_BOOKING));
            stats.put("profileUpdateCount", activityLogRepository.countByUserAndActionType(user, ActionType.UPDATE_PROFILE));

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("❌ Error getting activity stats: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Internal server error"));
        }
    }

    /**
     * Get available action types
     */
    @GetMapping("/action-types")
    public ResponseEntity<?> getActionTypes() {
        try {
            Map<String, String> actionTypes = new HashMap<>();
            for (ActionType type : ActionType.values()) {
                actionTypes.put(type.name(), type.getDisplayName());
            }
            return ResponseEntity.ok(actionTypes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error getting action types"));
        }
    }
}
