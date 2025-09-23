package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import backend.service.BookingService;
import backend.util.EntityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import backend.dto.request.BookingCreateRequest;
import backend.entity.Tour;
import backend.entity.User;
import backend.service.TourService;
import backend.service.UserService;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Management", description = "APIs for managing bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class BookingController extends BaseController {
    
    private final BookingService bookingService;
    private final TourService tourService;
    private final UserService userService;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        
        List<Booking> bookings = bookingService.getAllBookings();
        List<BookingResponse> bookingResponses = mapper.toBookingResponseList(bookings);
        
        return ResponseEntity.ok(success("All bookings retrieved successfully", bookingResponses));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bookings by user ID")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        List<BookingResponse> bookingResponses = mapper.toBookingResponseList(bookings);
        
        return ResponseEntity.ok(success("User bookings retrieved successfully", bookingResponses));
    }
    
    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
        
        Booking booking = bookingService.getBookingById(bookingId)
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Booking", "id", bookingId));
        BookingResponse bookingResponse = mapper.toBookingResponse(booking);
        
        return ResponseEntity.ok(success("Booking retrieved successfully", bookingResponse));
    }
    
    @PostMapping
    @Operation(summary = "Create new booking")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request) {
        
        log.info("Creating booking for tour: {} by user: {}", request.getTourId(), "current_user");
        
        // Get tour and user entities
        Tour tour = tourService.getTourById(request.getTourId())
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Tour", "id", request.getTourId()));
                
        // For now, we'll need to get current user from security context
        // This is a simplified version - in real implementation, get from JWT token
        User user = userService.getUserById(1L)  // Temporary - should get from security context
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("User", "id", 1L));
        
        // Create booking entity
        Booking booking = new Booking();
        booking.setTour(tour);
        booking.setUser(user);
        booking.setStartDate(request.getStartDate());
        booking.setNumAdults(request.getNumAdults());
        booking.setNumChildren(request.getNumChildren() != null ? request.getNumChildren() : 0);
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setContactPhone(request.getContactPhone());
        
        // Create booking
        Booking createdBooking = bookingService.createBooking(booking);
        BookingResponse bookingResponse = mapper.toBookingResponse(createdBooking);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(success("Booking created successfully", bookingResponse));
    }
}
