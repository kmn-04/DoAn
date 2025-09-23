package backend.controller;

import backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        // Mock notifications response
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", java.util.Map.of(
            "content", java.util.Collections.emptyList(),
            "totalElements", 0,
            "totalPages", 0,
            "size", size,
            "number", page
        )));
    }
}

