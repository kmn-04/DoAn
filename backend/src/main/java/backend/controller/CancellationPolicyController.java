package backend.controller;

import backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cancellation-policies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cancellation Policy Management", description = "APIs for managing cancellation policies")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class CancellationPolicyController extends BaseController {

    @GetMapping
    @Operation(summary = "Get all cancellation policies")
    public ResponseEntity<ApiResponse<List<Object>>> getAllCancellationPolicies() {
        try {
            log.info("Getting all cancellation policies");
            
            // Return mock policies for now
            List<Object> policies = List.of(
                Map.of(
                    "id", 1L,
                    "name", "Standard Policy",
                    "description", "Standard cancellation policy for all tours",
                    "daysBeforeDeparture", 7,
                    "refundPercentage", 80,
                    "processingFee", 50000
                ),
                Map.of(
                    "id", 2L,
                    "name", "Premium Policy", 
                    "description", "Premium cancellation policy with better refund rates",
                    "daysBeforeDeparture", 3,
                    "refundPercentage", 90,
                    "processingFee", 30000
                ),
                Map.of(
                    "id", 3L,
                    "name", "Last Minute Policy",
                    "description", "Policy for last minute cancellations",
                    "daysBeforeDeparture", 1,
                    "refundPercentage", 50,
                    "processingFee", 100000
                )
            );
            
            return ResponseEntity.ok(success("Cancellation policies retrieved successfully", policies));
            
        } catch (Exception e) {
            log.error("Error getting cancellation policies", e);
            return ResponseEntity.ok(success("Cancellation policies retrieved", List.of()));
        }
    }

    @GetMapping("/{policyId}")
    @Operation(summary = "Get cancellation policy by ID")
    public ResponseEntity<ApiResponse<Object>> getCancellationPolicy(@PathVariable Long policyId) {
        try {
            log.info("Getting cancellation policy: {}", policyId);
            
            // Return mock policy
            Object policy = Map.of(
                "id", policyId,
                "name", "Standard Policy",
                "description", "Standard cancellation policy for all tours",
                "daysBeforeDeparture", 7,
                "refundPercentage", 80,
                "processingFee", 50000,
                "terms", List.of(
                    "Cancellation must be made at least 7 days before departure",
                    "80% refund will be provided after deducting processing fee",
                    "Processing fee is non-refundable",
                    "Refund will be processed within 7-10 business days"
                )
            );
            
            return ResponseEntity.ok(success("Cancellation policy retrieved successfully", policy));
            
        } catch (Exception e) {
            log.error("Error getting cancellation policy: {}", policyId, e);
            return ResponseEntity.ok(success("Cancellation policy retrieved", Map.of()));
        }
    }

    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Get cancellation policy for specific tour")
    public ResponseEntity<ApiResponse<Object>> getTourCancellationPolicy(@PathVariable Long tourId) {
        try {
            log.info("Getting cancellation policy for tour: {}", tourId);
            
            // Return mock policy for tour
            Object policy = Map.of(
                "id", 1L,
                "tourId", tourId,
                "name", "Tour Specific Policy",
                "description", "Cancellation policy specific to this tour",
                "daysBeforeDeparture", 5,
                "refundPercentage", 75,
                "processingFee", 75000,
                "emergencyContactRequired", true,
                "documentsRequired", List.of("Booking confirmation", "Valid ID")
            );
            
            return ResponseEntity.ok(success("Tour cancellation policy retrieved successfully", policy));
            
        } catch (Exception e) {
            log.error("Error getting tour cancellation policy: {}", tourId, e);
            return ResponseEntity.ok(success("Tour cancellation policy retrieved", Map.of()));
        }
    }

    @PostMapping("/calculate-refund")
    @Operation(summary = "Calculate refund amount for cancellation")
    public ResponseEntity<ApiResponse<Object>> calculateRefund(@RequestBody Map<String, Object> request) {
        try {
            log.info("Calculating refund for cancellation request");
            
            Long bookingId = ((Number) request.get("bookingId")).longValue();
            // String cancellationDate = (String) request.get("cancellationDate"); // Not used for now
            
            // Mock refund calculation
            Object refundCalculation = Map.of(
                "bookingId", bookingId,
                "originalAmount", 2500000,
                "refundPercentage", 80,
                "refundAmount", 2000000,
                "processingFee", 50000,
                "netRefundAmount", 1950000,
                "refundEligible", true,
                "refundReason", "Cancellation made within policy terms",
                "estimatedRefundDays", 7
            );
            
            return ResponseEntity.ok(success("Refund calculated successfully", refundCalculation));
            
        } catch (Exception e) {
            log.error("Error calculating refund", e);
            return ResponseEntity.ok(success("Refund calculation failed", Map.of("refundEligible", false)));
        }
    }
}
