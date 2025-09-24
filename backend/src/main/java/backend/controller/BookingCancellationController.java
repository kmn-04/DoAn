package backend.controller;

import backend.dto.request.BookingCancellationRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.BookingCancellationResponse;
import backend.dto.response.PageResponse;
import backend.entity.BookingCancellation;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.service.BookingCancellationService;
import backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/cancellations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Cancellation Management", description = "APIs for managing booking cancellations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class BookingCancellationController extends BaseController {

    private final BookingCancellationService cancellationService;
    private final UserRepository userRepository;

    // ================================
    // TEST ENDPOINT (NO AUTH)
    // ================================
    
    @GetMapping("/test")
    @Operation(summary = "Test cancellation system (No auth required)")
    public ResponseEntity<ApiResponse<String>> testCancellationSystem() {
        return ResponseEntity.ok(
            success("Cancellation system is working!")
        );
    }

    @GetMapping("/test-db")
    @Operation(summary = "Test database connection (No auth required)")
    public ResponseEntity<ApiResponse<String>> testDatabase() {
        try {
            long count = cancellationService.countAllCancellations();
            return ResponseEntity.ok(
                success("Database connected! Found " + count + " cancellations")
            );
        } catch (Exception e) {
            return ResponseEntity.ok(
                success("Database error: " + e.getMessage())
            );
        }
    }

    @PostMapping("/test-request")
    @Operation(summary = "Test cancellation request with debug info (No auth required)")
    public ResponseEntity<ApiResponse<String>> testCancellationRequest(
            @Valid @RequestBody BookingCancellationRequest request) {
        try {
            log.info("🧪 Testing cancellation request: {}", request);
            
            // Try to process the cancellation
            BookingCancellationResponse response = cancellationService.requestCancellation(request, 1L);
            
            return ResponseEntity.ok(
                success("✅ Cancellation SUCCESS! ID: " + response.getId() + " Status: " + response.getStatus())
            );
        } catch (Exception e) {
            log.error("❌ Cancellation test failed: ", e);
            return ResponseEntity.ok(
                success("❌ FAILED: " + e.getMessage() + " - Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "Unknown"))
            );
        }
    }

    // ================================
    // CUSTOMER ENDPOINTS
    // ================================

    @PostMapping("/request")
    @Operation(summary = "Request booking cancellation (Customer)")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> requestCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingCancellationRequest request) {

        // Get user ID from email
        Long userId = getUserIdFromUserDetails(userDetails);
        
        // Submit cancellation request to database
        BookingCancellationResponse response = cancellationService.requestCancellation(request, userId);
        
        return ResponseEntity.ok(
            success("Cancellation request submitted successfully", response)
        );
    }

    @GetMapping("/my-cancellations")
    @Operation(summary = "Get user's cancellation history (Customer)")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> getMyCancellations(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        // Get user ID from email  
        Long userId = getUserIdFromUserDetails(userDetails);
        
        Page<BookingCancellationResponse> cancellations = 
                cancellationService.getUserCancellations(userId, pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    @GetMapping("/my-cancellations/{cancellationId}")
    @Operation(summary = "Get specific cancellation details (Customer)")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> getMyCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "Cancellation ID") @PathVariable Long cancellationId) {

        // Note: In production, add ownership check
        BookingCancellationResponse response = cancellationService.getCancellationById(cancellationId);
        
        return ResponseEntity.ok(
            success("Cancellation details retrieved successfully", response)
        );
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get cancellation by booking ID")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> getCancellationByBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {

        BookingCancellationResponse response = cancellationService.getCancellationByBookingId(bookingId);
        
        return ResponseEntity.ok(
            success("Cancellation details retrieved successfully", response)
        );
    }

    @GetMapping("/booking/{bookingId}/can-cancel")
    @Operation(summary = "Check if booking can be cancelled")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Boolean>> canCancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {

        Long userId = Long.valueOf(userDetails.getUsername());
        
        boolean canCancel = cancellationService.canUserCancelBooking(bookingId, userId);
        
        return ResponseEntity.ok(
            success("Cancellation eligibility checked", canCancel)
        );
    }

    @PostMapping("/booking/{bookingId}/evaluate")
    @Operation(summary = "Evaluate cancellation impact (refund calculation)")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingCancellationService.CancellationEvaluation>> evaluateCancellation(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @Valid @RequestBody BookingCancellationRequest request) {

        log.info("🔍 Evaluating cancellation for booking ID: {} with request: {}", bookingId, request);
        
        BookingCancellationService.CancellationEvaluation evaluation = 
                cancellationService.evaluateCancellation(bookingId, request);
        
        log.info("✅ Cancellation evaluation completed: {}", evaluation);
        
        return ResponseEntity.ok(
            success("Cancellation evaluation completed", evaluation)
        );
    }

    // ================================
    // ADMIN ENDPOINTS
    // ================================

    @GetMapping("/admin/pending")
    @Operation(summary = "Get pending cancellations for review (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> getPendingCancellations(
            Pageable pageable) {

        Page<BookingCancellationResponse> cancellations = 
                cancellationService.getPendingCancellations(pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    @GetMapping("/admin/emergency")
    @Operation(summary = "Get emergency cancellations (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> getEmergencyCancellations(
            Pageable pageable) {

        Page<BookingCancellationResponse> cancellations = 
                cancellationService.getEmergencyCancellations(pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    @PutMapping("/admin/{cancellationId}/approve")
    @Operation(summary = "Approve cancellation request (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> approveCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "Cancellation ID") @PathVariable Long cancellationId,
            @RequestParam(required = false) String adminNotes) {

        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingCancellationResponse response = 
                cancellationService.approveCancellation(cancellationId, adminId, adminNotes);
        
        return ResponseEntity.ok(
            success("Cancellation approved successfully", response)
        );
    }

    @PutMapping("/admin/{cancellationId}/reject")
    @Operation(summary = "Reject cancellation request (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> rejectCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "Cancellation ID") @PathVariable Long cancellationId,
            @RequestParam String adminNotes) {

        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingCancellationResponse response = 
                cancellationService.rejectCancellation(cancellationId, adminId, adminNotes);
        
        return ResponseEntity.ok(
            success("Cancellation rejected", response)
        );
    }

    @PutMapping("/admin/{cancellationId}/expedite")
    @Operation(summary = "Expedite emergency cancellation (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> expediteEmergencyCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "Cancellation ID") @PathVariable Long cancellationId) {

        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingCancellationResponse response = 
                cancellationService.expediteEmergencyCancellation(cancellationId, adminId);
        
        return ResponseEntity.ok(
            success("Emergency cancellation expedited", response)
        );
    }

    // ================================
    // REFUND MANAGEMENT
    // ================================

    @GetMapping("/admin/awaiting-refund")
    @Operation(summary = "Get cancellations awaiting refund processing (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> getCancellationsAwaitingRefund(
            Pageable pageable) {

        Page<BookingCancellationResponse> cancellations = 
                cancellationService.getCancellationsAwaitingRefund(pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    @PutMapping("/admin/{cancellationId}/process-refund")
    @Operation(summary = "Process refund for approved cancellation (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingCancellationResponse>> processRefund(
            @Parameter(description = "Cancellation ID") @PathVariable Long cancellationId,
            @RequestParam String transactionId,
            @RequestParam String refundMethod) {

        BookingCancellationResponse response = 
                cancellationService.processRefund(cancellationId, transactionId, refundMethod);
        
        return ResponseEntity.ok(
            success("Refund processed successfully", response)
        );
    }

    // ================================
    // SEARCH AND FILTERING
    // ================================

    @GetMapping("/admin/search")
    @Operation(summary = "Search cancellations (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> searchCancellations(
            @RequestParam String searchTerm,
            Pageable pageable) {

        Page<BookingCancellationResponse> cancellations = 
                cancellationService.searchCancellations(searchTerm, pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    @GetMapping("/admin/by-status")
    @Operation(summary = "Get cancellations by status (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> getCancellationsByStatus(
            @RequestParam BookingCancellation.CancellationStatus status,
            Pageable pageable) {

        Page<BookingCancellationResponse> cancellations = 
                cancellationService.getCancellationsByStatus(status, pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    @GetMapping("/admin/by-date-range")
    @Operation(summary = "Get cancellations by date range (Admin)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<BookingCancellationResponse>>> getCancellationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {

        Page<BookingCancellationResponse> cancellations = 
                cancellationService.getCancellationsByDateRange(startDate, endDate, pageable);
        
        return ResponseEntity.ok(successPage(cancellations));
    }

    // ================================
    // STATISTICS AND REPORTING
    // ================================

    @GetMapping("/admin/statistics")
    @Operation(summary = "Get cancellation statistics (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingCancellationService.CancellationStatistics>> getCancellationStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        BookingCancellationService.CancellationStatistics stats = 
                cancellationService.getCancellationStatistics(startDate, endDate);
        
        return ResponseEntity.ok(
            success("Cancellation statistics retrieved", stats)
        );
    }

    @GetMapping("/admin/reason-stats")
    @Operation(summary = "Get cancellation reason statistics (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<BookingCancellationService.CancellationReasonStat>>> getCancellationReasonStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        java.util.List<BookingCancellationService.CancellationReasonStat> stats = 
                cancellationService.getCancellationReasonStats(startDate, endDate);
        
        return ResponseEntity.ok(
            success("Cancellation reason statistics retrieved", stats)
        );
    }

    @GetMapping("/my-summary")
    @Operation(summary = "Get user's cancellation summary (Customer)")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingCancellationService.UserCancellationSummary>> getUserCancellationSummary(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.valueOf(userDetails.getUsername());
        
        BookingCancellationService.UserCancellationSummary summary = 
                cancellationService.getUserCancellationSummary(userId);
        
        return ResponseEntity.ok(
            success("User cancellation summary retrieved", summary)
        );
    }

    // ================================
    // UTILITY ENDPOINTS
    // ================================

    @PostMapping("/booking/{bookingId}/calculate-refund")
    @Operation(summary = "Calculate potential refund amount")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateRefundAmount(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @Valid @RequestBody BookingCancellationRequest request) {

        BigDecimal refundAmount = cancellationService.calculateRefundAmount(bookingId, request);
        
        return ResponseEntity.ok(
            success("Refund amount calculated", refundAmount)
        );
    }

    @GetMapping("/user/{userId}/is-abusive")
    @Operation(summary = "Check if user is abusive canceller (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Boolean>> isUserAbusiveCanceller(
            @Parameter(description = "User ID") @PathVariable Long userId) {

        boolean isAbusive = cancellationService.isUserAbusiveCanceller(userId);
        
        return ResponseEntity.ok(
            success("User abuse check completed", isAbusive)
        );
    }

    // Helper method to extract user ID from UserDetails
    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new BadRequestException("User authentication required");
        }
        
        try {
            // Try to parse as Long first (if username is ID)
            return Long.valueOf(userDetails.getUsername());
        } catch (NumberFormatException e) {
            // If username is email, get user ID from database
            log.warn("Username is not a number, treating as email: {}", userDetails.getUsername());
            
            // Query user by email
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(User::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        }
    }
}
