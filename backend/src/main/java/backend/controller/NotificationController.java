package backend.controller;

import backend.dto.response.ApiResponse;
import backend.entity.Notification;
import backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Management", description = "APIs for real-time notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class NotificationController {

    private final NotificationService notificationService;
    private final ConcurrentHashMap<Long, SseEmitter> userConnections = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatExecutor = Executors.newScheduledThreadPool(1);

    @GetMapping(value = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to real-time notifications via Server-Sent Events")
    public SseEmitter streamNotifications(@Parameter(description = "User ID") @PathVariable Long userId) {
        
        log.info("User {} subscribing to notification stream", userId);
        
        // Create SSE emitter with 30-minute timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 minutes
        
        // Store user connection
        userConnections.put(userId, emitter);
        
        // Handle completion and cleanup
        emitter.onCompletion(() -> {
            log.info("SSE connection completed for user {}", userId);
            userConnections.remove(userId);
        });
        
        emitter.onTimeout(() -> {
            log.info("SSE connection timeout for user {}", userId);
            userConnections.remove(userId);
        });
        
        emitter.onError(throwable -> {
            log.error("SSE connection error for user {}: {}", userId, throwable.getMessage());
            userConnections.remove(userId);
        });
        
        try {
            // Send initial connection confirmation
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"message\":\"Connected to notification stream\",\"userId\":" + userId + ",\"timestamp\":\"" + java.time.LocalDateTime.now() + "\"}")
                .id(String.valueOf(System.currentTimeMillis())));
            
            // Start heartbeat to keep connection alive
            startHeartbeat(userId, emitter);
            
        } catch (IOException e) {
            log.error("Error sending initial notification to user {}: {}", userId, e.getMessage());
            userConnections.remove(userId);
            emitter.completeWithError(e);
        }
        
        return emitter;
    }
    
    @PostMapping("/send/{userId}")
    @Operation(summary = "Send notification to specific user")
    public ResponseEntity<ApiResponse<String>> sendNotification(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @RequestParam String message,
            @RequestParam(defaultValue = "info") String type) {
        
        SseEmitter emitter = userConnections.get(userId);
        
        if (emitter == null) {
            return ResponseEntity.ok(ApiResponse.success("User not connected to notification stream"));
        }
        
        try {
            String notificationData = String.format(
                "{\"message\":\"%s\",\"type\":\"%s\",\"userId\":%d,\"timestamp\":\"%s\"}", 
                message, type, userId, java.time.LocalDateTime.now()
            );
            
            emitter.send(SseEmitter.event()
                .name("notification")
                .data(notificationData)
                .id(String.valueOf(System.currentTimeMillis())));
            
            log.info("Notification sent to user {}: {}", userId, message);
            
            return ResponseEntity.ok(ApiResponse.success("Notification sent successfully"));
            
        } catch (IOException e) {
            log.error("Error sending notification to user {}: {}", userId, e.getMessage());
            userConnections.remove(userId);
            return ResponseEntity.ok(ApiResponse.error("Failed to send notification: " + e.getMessage()));
        }
    }
    
    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast notification to all connected users")
    public ResponseEntity<ApiResponse<String>> broadcastNotification(
            @RequestParam String message,
            @RequestParam(defaultValue = "info") String type) {
        
        int sentCount = 0;
        int errorCount = 0;
        
        for (Long userId : userConnections.keySet()) {
            SseEmitter emitter = userConnections.get(userId);
            
            if (emitter != null) {
                try {
                    String notificationData = String.format(
                        "{\"message\":\"%s\",\"type\":\"%s\",\"userId\":%d,\"timestamp\":\"%s\"}", 
                        message, type, userId, java.time.LocalDateTime.now()
                    );
                    
                    emitter.send(SseEmitter.event()
                        .name("broadcast")
                        .data(notificationData)
                        .id(String.valueOf(System.currentTimeMillis())));
                    
                    sentCount++;
                    
                } catch (IOException e) {
                    log.error("Error broadcasting to user {}: {}", userId, e.getMessage());
                    userConnections.remove(userId);
                    errorCount++;
                }
            }
        }
        
        log.info("Broadcast notification sent to {} users, {} errors", sentCount, errorCount);
        
        return ResponseEntity.ok(ApiResponse.success(
            String.format("Broadcast sent to %d users (%d errors)", sentCount, errorCount)
        ));
    }
    
    @GetMapping("/connections")
    @Operation(summary = "Get count of active connections")
    public ResponseEntity<ApiResponse<Integer>> getActiveConnections() {
        
        int activeConnections = userConnections.size();
        
        return ResponseEntity.ok(ApiResponse.success("Active connections retrieved", activeConnections));
    }
    
    @DeleteMapping("/disconnect/{userId}")
    @Operation(summary = "Disconnect user from notification stream")
    public ResponseEntity<ApiResponse<String>> disconnectUser(@Parameter(description = "User ID") @PathVariable Long userId) {
        
        SseEmitter emitter = userConnections.remove(userId);
        
        if (emitter != null) {
            emitter.complete();
            log.info("User {} disconnected from notification stream", userId);
            return ResponseEntity.ok(ApiResponse.success("User disconnected successfully"));
        } else {
            return ResponseEntity.ok(ApiResponse.success("User was not connected"));
        }
    }
    
    private void startHeartbeat(Long userId, SseEmitter emitter) {
        heartbeatExecutor.scheduleAtFixedRate(() -> {
            try {
                if (userConnections.containsKey(userId)) {
                    emitter.send(SseEmitter.event()
                        .name("heartbeat")
                        .data("{\"type\":\"heartbeat\",\"timestamp\":\"" + java.time.LocalDateTime.now() + "\"}")
                        .id(String.valueOf(System.currentTimeMillis())));
                }
            } catch (IOException e) {
                log.error("Heartbeat failed for user {}: {}", userId, e.getMessage());
                userConnections.remove(userId);
            }
        }, 30, 30, TimeUnit.SECONDS); // Send heartbeat every 30 seconds
    }
    
    @GetMapping("/user/{userId}/stats")
    @Operation(summary = "Get notification statistics for user")
    public ResponseEntity<ApiResponse<Object>> getNotificationStats(@PathVariable Long userId) {
        // Mock stats response
        return ResponseEntity.ok(ApiResponse.success("Notification stats retrieved", java.util.Map.of(
            "totalNotifications", 0,
            "unreadCount", 0,
            "readCount", 0
        )));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get notifications for user")
    public ResponseEntity<ApiResponse<Object>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        
        try {
            Page<Notification> notificationPage = notificationService.getUserNotifications(
                userId, 
                PageRequest.of(page, size)
            );
            
            // Convert to DTOs to avoid lazy loading issues
            java.util.List<java.util.Map<String, Object>> notificationDTOs = notificationPage.getContent().stream()
                .map(n -> {
                    java.util.Map<String, Object> dto = new java.util.HashMap<>();
                    dto.put("id", n.getId());
                    dto.put("title", n.getTitle());
                    dto.put("message", n.getMessage());
                    dto.put("type", n.getType().name());
                    dto.put("link", n.getLink() != null ? n.getLink() : "");
                    dto.put("isRead", n.getIsRead());
                    dto.put("createdAt", n.getCreatedAt());
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", java.util.Map.of(
                "notifications", notificationDTOs,
                "total", notificationPage.getTotalElements(),
                "unread", notificationService.getUnreadCount(userId)
            )));
        } catch (Exception e) {
            log.error("Error getting notifications for user {}", userId, e);
            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", java.util.Map.of(
                "notifications", java.util.Collections.emptyList(),
                "total", 0,
                "unread", 0
            )));
        }
    }
    
    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", notificationId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to mark notification as read: " + e.getMessage()));
        }
    }
    
    @PutMapping("/user/{userId}/read-all")
    @Operation(summary = "Mark all notifications as read for user")
    public ResponseEntity<ApiResponse<String>> markAllNotificationsAsRead(@PathVariable Long userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to mark all notifications as read: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting notification: {}", notificationId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete notification: " + e.getMessage()));
        }
    }
}

