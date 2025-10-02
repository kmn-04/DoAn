package backend.controller;

import backend.dto.request.BookingStatusUpdateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.BookingResponse;
import backend.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Booking Management", description = "Admin APIs for managing bookings")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminBookingController extends BaseController {
    
    private final BookingService bookingService;
    
    @GetMapping
    @Operation(summary = "Get all bookings", description = "Get all bookings with pagination (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc") 
                    ? Sort.by(sortBy).ascending() 
                    : Sort.by(sortBy).descending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<BookingResponse> bookings;
            
            if (status != null && !status.isEmpty()) {
                bookings = bookingService.getBookingsByStatusDto(status, pageable);
            } else {
                bookings = bookingService.getAllBookingsDto(pageable);
            }
            
            return ResponseEntity.ok(success("Bookings retrieved successfully", bookings));
            
        } catch (Exception e) {
            log.error("Error retrieving bookings", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to retrieve bookings: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Get booking details by ID (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @Parameter(description = "Booking ID") @PathVariable Long id) {
        
        try {
            BookingResponse booking = bookingService.getBookingByIdDto(id);
            
            return ResponseEntity.ok(success("Booking retrieved successfully", booking));
            
        } catch (Exception e) {
            log.error("Error retrieving booking ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to retrieve booking: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status", description = "Update booking status (Admin only)")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        
        try {
            log.info("Admin updating booking status ID: {}, status: {}", id, request.getStatus());
            
            BookingResponse booking = bookingService.updateBookingStatus(id, request.getStatus());
            
            return ResponseEntity.ok(success("Booking status updated successfully", booking));
            
        } catch (Exception e) {
            log.error("Error updating booking status ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to update booking status: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/payment-status")
    @Operation(summary = "Update payment status", description = "Update payment status (Admin only)")
    public ResponseEntity<ApiResponse<BookingResponse>> updatePaymentStatus(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @RequestParam String paymentStatus) {
        
        try {
            log.info("Admin updating payment status ID: {}, status: {}", id, paymentStatus);
            
            BookingResponse booking = bookingService.updatePaymentStatus(id, paymentStatus);
            
            return ResponseEntity.ok(success("Payment status updated successfully", booking));
            
        } catch (Exception e) {
            log.error("Error updating payment status ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to update payment status: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel booking", description = "Cancel a booking (Admin only)")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @RequestParam String reason) {
        
        try {
            log.info("Admin cancelling booking ID: {}, reason: {}", id, reason);
            
            BookingResponse booking = bookingService.adminCancelBooking(id, reason);
            
            return ResponseEntity.ok(success("Booking cancelled successfully", booking));
            
        } catch (Exception e) {
            log.error("Error cancelling booking ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to cancel booking: " + e.getMessage()));
        }
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get booking statistics", description = "Get booking statistics (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingStatistics() {
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            long totalBookings = bookingService.getTotalBookings();
            long pendingCount = bookingService.getBookingCountByStatus("Pending");
            long confirmedCount = bookingService.getBookingCountByStatus("Confirmed");
            long cancelledCount = bookingService.getBookingCountByStatus("Cancelled");
            long completedCount = bookingService.getBookingCountByStatus("Completed");
            
            stats.put("totalBookings", totalBookings);
            stats.put("pendingCount", pendingCount);
            stats.put("confirmedCount", confirmedCount);
            stats.put("cancelledCount", cancelledCount);
            stats.put("completedCount", completedCount);
            
            return ResponseEntity.ok(success("Statistics retrieved successfully", stats));
            
        } catch (Exception e) {
            log.error("Error retrieving booking statistics", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search bookings", description = "Search bookings by booking code or user name (Admin only)")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> searchBookings(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            
            Page<BookingResponse> bookings = bookingService.searchBookingsDto(keyword, pageable);
            
            return ResponseEntity.ok(success("Search results retrieved successfully", bookings));
            
        } catch (Exception e) {
            log.error("Error searching bookings", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to search bookings: " + e.getMessage()));
        }
    }
}

