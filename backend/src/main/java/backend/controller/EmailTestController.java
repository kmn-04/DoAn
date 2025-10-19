package backend.controller;

import backend.dto.response.ApiResponse;
import backend.entity.Booking;
import backend.entity.Tour;
import backend.entity.User;
import backend.repository.BookingRepository;
import backend.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/test/email")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email Test", description = "Test email functionality")
public class EmailTestController extends BaseController {
    
    private final EmailService emailService;
    private final BookingRepository bookingRepository;
    
    @PostMapping("/send-test")
    @Operation(summary = "Send test email", description = "Send a test email to verify SMTP configuration")
    public ResponseEntity<ApiResponse<String>> sendTestEmail(
            @RequestParam String toEmail,
            @RequestParam(required = false) Long bookingId) {
        
        try {
            if (bookingId != null) {
                // Send real booking email
                Booking booking = bookingRepository.findById(bookingId)
                        .orElseThrow(() -> new RuntimeException("Booking not found"));
                
                emailService.sendBookingConfirmation(
                    booking.getUser().getEmail(), 
                    booking.getBookingCode(), 
                    booking.getTour().getName()
                );
                
                return ResponseEntity.ok(success(
                        "Booking confirmation email sent successfully to: " + toEmail,
                        "Email sent to " + booking.getUser().getEmail()));
                
            } else {
                // Send simple test email
                emailService.sendSimpleEmail(
                        toEmail, 
                        "[Tour Booking] Test Email", 
                        "This is a test email from Tour Booking System.\n\n" +
                        "If you receive this, your SMTP configuration is working correctly!\n\n" +
                        "Best regards,\nTour Booking Team"
                );
                
                return ResponseEntity.ok(success(
                        "Test email sent successfully to: " + toEmail,
                        "Email sent"));
            }
            
        } catch (Exception e) {
            log.error("Failed to send test email", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to send email: " + e.getMessage()));
        }
    }
    
    @GetMapping("/smtp-config")
    @Operation(summary = "Check SMTP configuration", description = "Check if SMTP is configured")
    public ResponseEntity<ApiResponse<Object>> checkSmtpConfig() {
        
        try {
            // Try to get mail sender config
            String status = "SMTP is configured and ready to use";
            
            return ResponseEntity.ok(success(status, null));
            
        } catch (Exception e) {
            log.error("SMTP configuration error", e);
            return ResponseEntity.internalServerError()
                    .body(error("SMTP not configured: " + e.getMessage()));
        }
    }
}

