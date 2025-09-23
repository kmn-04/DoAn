package backend.controller;

import backend.dto.request.BookingModificationRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.BookingModificationResponse;
import backend.entity.BookingModification;
import backend.service.BookingModificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/booking-modifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Modifications", description = "APIs for managing booking modification requests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class BookingModificationController {

    private final BookingModificationService modificationService;

    // ==================== CUSTOMER ENDPOINTS ====================

    @PostMapping
    @Operation(summary = "Request a booking modification (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> requestModification(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingModificationRequest request) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        log.info("User {} requesting modification for booking {}", userId, request.getBookingId());
        
        BookingModificationResponse response = modificationService.requestModification(userId, request);
        
        return new ResponseEntity<>(
            ApiResponse.success("Modification request submitted successfully", response), 
            HttpStatus.CREATED
        );
    }

    @GetMapping("/my-modifications")
    @Operation(summary = "Get all modification requests by the authenticated user (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Page<BookingModificationResponse>>> getMyModifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        
        Page<BookingModificationResponse> response = modificationService.getModificationsByUser(userId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-modifications/{modificationId}")
    @Operation(summary = "Get a specific modification request by ID for the authenticated user (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> getMyModificationById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.getModificationByIdAndUser(modificationId, userId);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/my-modifications/{modificationId}/cancel")
    @Operation(summary = "Cancel a pending modification request (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> cancelMyModification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.cancelModification(modificationId, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification request cancelled successfully", response)
        );
    }

    @PutMapping("/my-modifications/{modificationId}/accept-charges")
    @Operation(summary = "Accept additional charges for approved modification (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> acceptAdditionalCharges(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId) {
        
        Long userId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.acceptAdditionalCharges(modificationId, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Additional charges accepted successfully", response)
        );
    }

    @PostMapping("/bookings/{bookingId}/price-quote")
    @Operation(summary = "Get price quote for a potential modification (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse.PricingDetails>> getPriceQuote(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingModificationRequest request) {
        
        BookingModificationResponse.PricingDetails pricingDetails = modificationService.getPriceQuote(bookingId, request);
        
        return ResponseEntity.ok(
            ApiResponse.success("Price quote calculated successfully", pricingDetails)
        );
    }

    @GetMapping("/bookings/{bookingId}/can-modify")
    @Operation(summary = "Check if a booking can be modified (Customer)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Boolean>> canBookingBeModified(@PathVariable Long bookingId) {
        
        boolean canModify = modificationService.canBookingBeModified(bookingId);
        
        return ResponseEntity.ok(
            ApiResponse.success(canModify ? "Booking can be modified" : "Booking cannot be modified", canModify)
        );
    }

    // ==================== ADMIN/STAFF ENDPOINTS ====================

    @GetMapping
    @Operation(summary = "Get all booking modification requests (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Page<BookingModificationResponse>>> getAllModifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        
        Page<BookingModificationResponse> response = modificationService.getAllModifications(pageable);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{modificationId}")
    @Operation(summary = "Get a specific modification request by ID (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> getModificationById(
            @PathVariable Long modificationId) {
        
        BookingModificationResponse response = modificationService.getModificationById(modificationId);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get modification requests for a specific booking (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<BookingModificationResponse>>> getModificationsByBookingId(
            @PathVariable Long bookingId) {
        
        List<BookingModificationResponse> response = modificationService.getModificationsByBookingId(bookingId);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get modification requests by status (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Page<BookingModificationResponse>>> getModificationsByStatus(
            @PathVariable BookingModification.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        
        Page<BookingModificationResponse> response = modificationService.getModificationsByStatus(status, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending modification requests requiring review (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<BookingModificationResponse>>> getPendingModifications() {
        
        List<BookingModificationResponse> response = modificationService.getPendingModifications();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/requiring-processing")
    @Operation(summary = "Get modification requests requiring processing (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<BookingModificationResponse>>> getModificationsRequiringProcessing() {
        
        List<BookingModificationResponse> response = modificationService.getModificationsRequiringProcessing();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{modificationId}/status")
    @Operation(summary = "Update modification status (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> updateModificationStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId,
            @RequestParam BookingModification.Status newStatus,
            @RequestParam(required = false) String adminNotes) {
        
        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.updateModificationStatus(
            modificationId, newStatus, adminNotes != null ? adminNotes : "", adminId
        );
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification status updated successfully", response)
        );
    }

    @PutMapping("/{modificationId}/approve")
    @Operation(summary = "Approve a modification request (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> approveModification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId) {
        
        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.approveModification(modificationId, adminId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification request approved successfully", response)
        );
    }

    @PutMapping("/{modificationId}/reject")
    @Operation(summary = "Reject a modification request (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> rejectModification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId,
            @RequestParam String reason) {
        
        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.rejectModification(modificationId, reason, adminId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification request rejected", response)
        );
    }

    @PutMapping("/{modificationId}/process")
    @Operation(summary = "Start processing a modification request (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> processModification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId) {
        
        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.processModification(modificationId, adminId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification processing started", response)
        );
    }

    @PutMapping("/{modificationId}/complete")
    @Operation(summary = "Complete a modification request (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> completeModification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId) {
        
        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.completeModification(modificationId, adminId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification completed successfully", response)
        );
    }

    @PutMapping("/{modificationId}/details")
    @Operation(summary = "Update details of a pending modification request (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationResponse>> updateModificationDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long modificationId,
            @Valid @RequestBody BookingModificationRequest request) {
        
        Long adminId = Long.valueOf(userDetails.getUsername());
        
        BookingModificationResponse response = modificationService.updateModificationDetails(
            modificationId, request, adminId
        );
        
        return ResponseEntity.ok(
            ApiResponse.success("Modification details updated successfully", response)
        );
    }

    // ==================== UTILITY ENDPOINTS ====================

    @GetMapping("/statistics")
    @Operation(summary = "Get modification statistics (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationService.ModificationStatistics>> getModificationStatistics() {
        
        BookingModificationService.ModificationStatistics stats = modificationService.getModificationStatistics();
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/bookings/{bookingId}/calculate-price-difference")
    @Operation(summary = "Calculate price difference for a modification (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BigDecimal>> calculatePriceDifference(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingModificationRequest request) {
        
        BigDecimal priceDifference = modificationService.calculatePriceDifference(bookingId, request);
        
        return ResponseEntity.ok(
            ApiResponse.success("Price difference calculated successfully", priceDifference)
        );
    }

    @PostMapping("/bookings/{bookingId}/calculate-processing-fee")
    @Operation(summary = "Calculate processing fee for a modification (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateProcessingFee(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingModificationRequest request) {
        
        BigDecimal processingFee = modificationService.calculateProcessingFee(bookingId, request);
        
        return ResponseEntity.ok(
            ApiResponse.success("Processing fee calculated successfully", processingFee)
        );
    }

    @PostMapping("/bookings/{bookingId}/validate")
    @Operation(summary = "Validate a modification request (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<BookingModificationService.ValidationResult>> validateModificationRequest(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingModificationRequest request) {
        
        BookingModificationService.ValidationResult validationResult = 
            modificationService.validateModificationRequest(bookingId, request);
        
        return ResponseEntity.ok(
            ApiResponse.success(validationResult.isValid() ? "Validation passed" : "Validation failed", validationResult)
        );
    }

    @GetMapping("/user/{userId}/recent")
    @Operation(summary = "Get recent modifications for a user (Admin/Staff)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<BookingModificationResponse>>> getRecentModificationsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int days) {
        
        List<BookingModificationResponse> response = modificationService.getRecentModificationsByUser(userId, days);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
