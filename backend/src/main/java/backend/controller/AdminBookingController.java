package backend.controller;

import backend.dto.request.BookingStatusUpdateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import backend.mapper.EntityMapper;
import backend.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Booking Management", description = "Admin APIs for managing bookings")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminBookingController extends BaseController {
    
    private final BookingService bookingService;
    private final EntityMapper entityMapper;
    
    @GetMapping
    @Operation(summary = "Get all bookings", description = "Get all bookings with pagination and filters (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String confirmationStatus,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String dateFilter) {
        
        try {
            // Fetch all bookings (without pagination first)
            List<Booking> allBookings = bookingService.getAllBookings();
            
            // Apply filters
            List<Booking> filteredList = allBookings.stream()
                .filter(booking -> {
                    // ALWAYS exclude CancellationRequested bookings (they are managed in /admin/cancellations)
                    if (booking.getConfirmationStatus() == Booking.ConfirmationStatus.CANCELLATION_REQUESTED) {
                        return false;
                    }
                    
                    // Search filter (bookingCode, customerName, customerEmail)
                    if (search != null && !search.isEmpty()) {
                        String searchLower = search.toLowerCase();
                        boolean matchesSearch = 
                            (booking.getBookingCode() != null && booking.getBookingCode().toLowerCase().contains(searchLower)) ||
                            (booking.getCustomerName() != null && booking.getCustomerName().toLowerCase().contains(searchLower)) ||
                            (booking.getCustomerEmail() != null && booking.getCustomerEmail().toLowerCase().contains(searchLower));
                        if (!matchesSearch) return false;
                    }
                    
                    // Confirmation status filter
                    if (confirmationStatus != null && !confirmationStatus.equalsIgnoreCase("all")) {
                        if (booking.getConfirmationStatus() == null || 
                            !booking.getConfirmationStatus().name().equalsIgnoreCase(confirmationStatus)) {
                            return false;
                        }
                    }
                    
                    // Payment status filter
                    if (paymentStatus != null && !paymentStatus.equalsIgnoreCase("all")) {
                        if (booking.getPaymentStatus() == null || 
                            !booking.getPaymentStatus().name().equalsIgnoreCase(paymentStatus)) {
                            return false;
                        }
                    }
                    
                    // Date filter
                    if (dateFilter != null && !dateFilter.equalsIgnoreCase("all")) {
                        LocalDateTime now = LocalDateTime.now();
                        LocalDateTime bookingDateTime = booking.getCreatedAt();
                        
                        if (bookingDateTime != null) {
                            if (dateFilter.equalsIgnoreCase("today")) {
                                LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
                                LocalDateTime endOfDay = startOfDay.plusDays(1);
                                if (bookingDateTime.isBefore(startOfDay) || bookingDateTime.isAfter(endOfDay)) {
                                    return false;
                                }
                            } else if (dateFilter.equalsIgnoreCase("week")) {
                                LocalDateTime weekAgo = now.minusWeeks(1);
                                if (bookingDateTime.isBefore(weekAgo)) {
                                    return false;
                                }
                            } else if (dateFilter.equalsIgnoreCase("month")) {
                                LocalDateTime monthAgo = now.minusMonths(1);
                                if (bookingDateTime.isBefore(monthAgo)) {
                                    return false;
                                }
                            }
                        }
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
            
            // Apply sorting
            filteredList.sort((a, b) -> {
                int comparison = 0;
                
                switch (sortBy.toLowerCase()) {
                    case "id":
                        comparison = Long.compare(a.getId(), b.getId());
                        break;
                    case "bookingcode":
                        comparison = String.CASE_INSENSITIVE_ORDER.compare(
                            a.getBookingCode() != null ? a.getBookingCode() : "",
                            b.getBookingCode() != null ? b.getBookingCode() : ""
                        );
                        break;
                    case "customername":
                        comparison = String.CASE_INSENSITIVE_ORDER.compare(
                            a.getCustomerName() != null ? a.getCustomerName() : "",
                            b.getCustomerName() != null ? b.getCustomerName() : ""
                        );
                        break;
                    case "totalprice":
                    case "finalamount":
                        comparison = a.getFinalAmount().compareTo(b.getFinalAmount());
                        break;
                    case "createdat":
                        if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                            comparison = a.getCreatedAt().compareTo(b.getCreatedAt());
                        }
                        break;
                    default:
                        comparison = Long.compare(a.getId(), b.getId());
                }
                
                return sortDir.equalsIgnoreCase("desc") ? -comparison : comparison;
            });
            
            // Paginate filtered results
            int totalElements = filteredList.size();
            Pageable pageable = PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), totalElements);
            
            List<Booking> pageContent = start > totalElements ? new ArrayList<>() : filteredList.subList(start, end);
            
            // Convert to BookingResponse
            List<BookingResponse> bookingResponses = pageContent.stream()
                .map(entityMapper::toBookingResponse)
                .collect(Collectors.toList());
            
            Page<BookingResponse> bookingsPage = new PageImpl<>(bookingResponses, pageable, totalElements);
            
            return ResponseEntity.ok(success("Bookings retrieved successfully", bookingsPage));
            
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

