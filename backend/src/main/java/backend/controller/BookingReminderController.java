package backend.controller;

import backend.dto.response.ApiResponse;
import backend.service.BookingReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for testing booking reminder functionality
 */
@RestController
@RequestMapping("/api/booking-reminders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Reminders", description = "APIs for booking reminder emails")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class BookingReminderController extends BaseController {
    
    private final BookingReminderService bookingReminderService;
    
    /**
     * Manually trigger reminder job (for testing)
     */
    @PostMapping("/send-all")
    @Operation(summary = "Manually send all pending reminders", description = "Triggers the reminder job manually for testing purposes")
    public ResponseEntity<ApiResponse<String>> sendAllReminders() {
        log.info("Manual trigger: Send all booking reminders");
        
        try {
            bookingReminderService.sendUpcomingTourReminders();
            return ResponseEntity.ok(success("Reminder job executed successfully. Check logs for details."));
        } catch (Exception e) {
            log.error("Error executing reminder job", e);
            return ResponseEntity.ok(error("Failed to execute reminder job: " + e.getMessage()));
        }
    }
    
    /**
     * Send reminder for specific booking
     */
    @PostMapping("/send/{bookingId}")
    @Operation(summary = "Send reminder for specific booking", description = "Manually send reminder email for a specific booking")
    public ResponseEntity<ApiResponse<String>> sendReminderForBooking(@PathVariable Long bookingId) {
        log.info("Manual trigger: Send reminder for booking ID: {}", bookingId);
        
        try {
            bookingReminderService.sendReminderForBooking(bookingId);
            return ResponseEntity.ok(success("Reminder sent successfully for booking ID: " + bookingId));
        } catch (Exception e) {
            log.error("Error sending reminder for booking: {}", bookingId, e);
            return ResponseEntity.ok(error("Failed to send reminder: " + e.getMessage()));
        }
    }
}

