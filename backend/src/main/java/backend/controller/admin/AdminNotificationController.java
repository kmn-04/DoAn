package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.request.NotificationRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.NotificationResponse;
import backend.entity.Notification;
import backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Notification Management", description = "Admin APIs for managing notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminNotificationController extends BaseController {
    
    private final NotificationService notificationService;
    
    @GetMapping
    @Operation(summary = "Get all notifications", description = "Get all notifications with pagination (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<Notification> notifications = notificationService.getAllNotifications(pageable);
            Page<NotificationResponse> response = notifications.map(notification -> {
                // Initialize lazy-loaded user within transaction
                if (notification.getUser() != null) {
                    notification.getUser().getName(); // Force initialization
                }
                return toResponse(notification);
            });
            
            return ResponseEntity.ok(success("Notifications retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get notifications: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID", description = "Get notification details by ID (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(@PathVariable Long id) {
        try {
            Notification notification = notificationService.getNotificationById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
            
            // Initialize lazy-loaded user within transaction
            if (notification.getUser() != null) {
                notification.getUser().getName(); // Force initialization
            }
            
            NotificationResponse response = toResponse(notification);
            return ResponseEntity.ok(success("Notification retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting notification with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get notification: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create notification", description = "Create new notification (Admin only)")
    public ResponseEntity<ApiResponse<String>> createNotification(@Valid @RequestBody NotificationRequest request) {
        try {
            String recipientType = request.getRecipientType() != null ? request.getRecipientType() : "ALL";
            Notification.NotificationType type = request.getType() != null ? request.getType() : Notification.NotificationType.INFO;
            
            String title = request.getTitle();
            String message = request.getMessage();
            String link = request.getLink();
            
            // Create notifications based on recipient type
            switch (recipientType.toUpperCase()) {
                case "ADMIN" -> {
                    notificationService.createNotificationForAdmins(title, message, type, link);
                    log.info("Notification sent to all admins");
                    return ResponseEntity.ok(success("Thông báo đã được gửi đến tất cả quản trị viên", "Notification sent"));
                }
                case "USER" -> {
                    notificationService.createNotificationForUsers(title, message, type, link);
                    log.info("Notification sent to all users (customers)");
                    return ResponseEntity.ok(success("Thông báo đã được gửi đến tất cả người dùng", "Notification sent"));
                }
                default -> {
                    notificationService.createNotificationForAllUsers(title, message, type);
                    log.info("Notification sent to ALL users (admins + customers)");
                    return ResponseEntity.ok(success("Thông báo đã được gửi đến tất cả người dùng", "Notification sent"));
                }
            }
        } catch (Exception e) {
            log.error("Error creating notification", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to create notification: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update notification", description = "Update notification by ID (Admin only)")
    public ResponseEntity<ApiResponse<String>> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationRequest request
    ) {
        try {
            Notification notification = notificationService.getNotificationById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
            
            // Update fields
            notification.setTitle(request.getTitle());
            notification.setMessage(request.getMessage());
            notification.setType(request.getType() != null ? request.getType() : Notification.NotificationType.INFO);
            notification.setLink(request.getLink());
            notification.setRecipientType(request.getRecipientType() != null ? request.getRecipientType() : "ALL");
            
            notificationService.createNotification(notification); // Save updates
            
            log.info("Notification updated: {}", id);
            return ResponseEntity.ok(success("Notification updated successfully", "Updated"));
        } catch (Exception e) {
            log.error("Error updating notification with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update notification: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Delete notification by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(success("Notification deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting notification with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete notification: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total notifications count", description = "Get total number of notifications (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalNotificationsCount() {
        try {
            long count = notificationService.getTotalNotifications();
            return ResponseEntity.ok(success("Total notifications count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting notifications count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get notifications count: " + e.getMessage()));
        }
    }
    
    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUser() != null ? notification.getUser().getId() : null);
        response.setUserName(notification.getUser() != null ? notification.getUser().getName() : null);
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setLink(notification.getLink());
        response.setRecipientType(notification.getRecipientType());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}

