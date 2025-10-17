package backend.controller;

import backend.dto.response.ApiResponse;
import backend.service.impl.BookingCompletionScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for manually triggering booking completion jobs
 */
@RestController
@RequestMapping("/api/bookings/completion")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Completion", description = "APIs for booking auto-completion")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class BookingCompletionController extends BaseController {
    
    private final BookingCompletionScheduler completionScheduler;
    
    /**
     * Manually trigger booking completion job (Admin only)
     */
    @PostMapping("/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually trigger booking auto-completion (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerCompletion() {
        log.info("🔧 Manual trigger: booking completion job");
        
        int completedCount = completionScheduler.manualTrigger();
        
        return ResponseEntity.ok(success(
                "Booking completion job executed successfully",
                Map.of(
                        "completedCount", completedCount,
                        "message", "Auto-completed " + completedCount + " bookings"
                )
        ));
    }
}

