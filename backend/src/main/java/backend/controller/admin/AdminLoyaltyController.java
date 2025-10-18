package backend.controller.admin;

import backend.service.impl.BookingCompletionScheduler;
import backend.service.LoyaltyService;
import backend.entity.Booking;
import backend.repository.BookingRepository;
import backend.entity.Booking.ConfirmationStatus;
import backend.entity.Booking.PaymentStatus;
import backend.entity.PointTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/loyalty")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminLoyaltyController {

    private final BookingCompletionScheduler scheduler;
    private final LoyaltyService loyaltyService;
    private final BookingRepository bookingRepository;

    @PostMapping("/test-scheduler")
    public ResponseEntity<Map<String, Object>> testScheduler() {
        try {
            int completedCount = scheduler.manualTrigger();
            Map<String, Object> result = new HashMap<>();
            result.put("completedCount", completedCount);
            result.put("message", "Scheduler test completed successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error testing scheduler", e);
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @PostMapping("/award-points/{bookingId}")
    public ResponseEntity<Map<String, Object>> awardPointsForBooking(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getConfirmationStatus() != ConfirmationStatus.COMPLETED) {
                Map<String, Object> result = new HashMap<>();
                result.put("error", "Booking is not completed");
                return ResponseEntity.badRequest().body(result);
            }

            if (booking.getPaymentStatus() != PaymentStatus.PAID) {
                Map<String, Object> result = new HashMap<>();
                result.put("error", "Booking is not paid");
                return ResponseEntity.badRequest().body(result);
            }

            String tourType = booking.getTour().getTourType() != null 
                ? booking.getTour().getTourType().name() 
                : "DOMESTIC";

            PointTransaction transaction = loyaltyService.awardBookingPoints(
                booking.getUser().getId(),
                booking.getId(),
                booking.getFinalAmount(),
                tourType
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("pointsAwarded", transaction.getPoints());
            result.put("message", "Points awarded successfully");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error awarding points for booking {}", bookingId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @GetMapping("/booking-status/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBookingStatus(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

            Map<String, Object> result = new HashMap<>();
            result.put("bookingId", booking.getId());
            result.put("bookingCode", booking.getBookingCode());
            result.put("confirmationStatus", booking.getConfirmationStatus());
            result.put("paymentStatus", booking.getPaymentStatus());
            result.put("startDate", booking.getStartDate());
            result.put("finalAmount", booking.getFinalAmount());
            result.put("tourType", booking.getTour().getTourType());
            result.put("userId", booking.getUser().getId());
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error getting booking status {}", bookingId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}
