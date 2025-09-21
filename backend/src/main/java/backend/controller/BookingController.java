package backend.controller;

import backend.dto.request.BookingCreateRequest;
import backend.dto.request.BookingUpdateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.BookingResponse;
import backend.dto.response.PageResponse;
import backend.entity.Booking;
import backend.entity.Booking.BookingStatus;
import backend.entity.Promotion;
import backend.entity.Tour;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.PromotionRepository;
import backend.service.BookingService;
import backend.service.TourService;
import backend.service.UserService;
import backend.util.EntityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Management", description = "APIs for managing bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class BookingController extends BaseController {
    
    private final BookingService bookingService;
    private final TourService tourService;
    private final UserService userService;
    private final PromotionRepository promotionRepository;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all bookings with pagination")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getAllBookings(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        Page<Booking> bookings = bookingService.getAllBookings(pageable);
        Page<BookingResponse> bookingResponses = bookings.map(mapper::toBookingResponse);
        
        return ResponseEntity.ok(successPage(bookingResponses));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search bookings by keyword")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> searchBookings(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = createPageable(page, size);
        Page<Booking> bookings = bookingService.searchBookings(keyword, pageable);
        Page<BookingResponse> bookingResponses = bookings.map(mapper::toBookingResponse);
        
        return ResponseEntity.ok(successPage(bookingResponses));
    }
    
    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
        
        Booking booking = bookingService.getBookingById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        
        return ResponseEntity.ok(success(mapper.toBookingResponse(booking)));
    }
    
    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Get booking by booking code")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByCode(
            @Parameter(description = "Booking code") @PathVariable String bookingCode) {
        
        Booking booking = bookingService.getBookingByCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "code", bookingCode));
        
        return ResponseEntity.ok(success(mapper.toBookingResponse(booking)));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bookings by user")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        List<BookingResponse> bookingResponses = mapper.toBookingResponseList(bookings);
        
        return ResponseEntity.ok(success(bookingResponses));
    }
    
    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Get bookings by tour")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByTour(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        List<Booking> bookings = bookingService.getBookingsByTour(tourId);
        List<BookingResponse> bookingResponses = mapper.toBookingResponseList(bookings);
        
        return ResponseEntity.ok(success(bookingResponses));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get bookings by status")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByStatus(
            @Parameter(description = "Booking status") @PathVariable BookingStatus status) {
        
        List<Booking> bookings = bookingService.getBookingsByStatus(status);
        List<BookingResponse> bookingResponses = mapper.toBookingResponseList(bookings);
        
        return ResponseEntity.ok(success(bookingResponses));
    }
    
    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUpcomingBookings() {
        
        List<Booking> bookings = bookingService.getUpcomingBookings();
        List<BookingResponse> bookingResponses = mapper.toBookingResponseList(bookings);
        
        return ResponseEntity.ok(success(bookingResponses));
    }
    
    @PostMapping
    @Operation(summary = "Create new booking")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            @Parameter(description = "User ID") @RequestParam Long userId) {
        
        // Get tour
        Tour tour = tourService.getTourById(request.getTourId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", request.getTourId()));
        
        // Get user
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check availability
        if (!bookingService.checkAvailability(request.getTourId(), request.getStartDate(), request.getTotalPeople())) {
            throw new BadRequestException("Tour is not available for selected date and number of people");
        }
        
        // Create booking entity
        Booking booking = new Booking();
        booking.setTour(tour);
        booking.setUser(user);
        booking.setStartDate(request.getStartDate());
        booking.setNumAdults(request.getNumAdults());
        booking.setNumChildren(request.getNumChildren());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setContactPhone(request.getContactPhone());
        
        // Handle promotion
        if (request.getPromotionCode() != null && !request.getPromotionCode().isEmpty()) {
            Optional<Promotion> promotion = promotionRepository.findValidPromotionByCode(
                    request.getPromotionCode(), LocalDateTime.now());
            if (promotion.isPresent()) {
                booking.setPromotion(promotion.get());
            } else {
                throw new BadRequestException("Invalid or expired promotion code");
            }
        }
        
        Booking createdBooking = bookingService.createBooking(booking);
        
        return ResponseEntity.ok(success("Booking created successfully", mapper.toBookingResponse(createdBooking)));
    }
    
    @PutMapping("/{bookingId}")
    @Operation(summary = "Update booking")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @Valid @RequestBody BookingUpdateRequest request) {
        
        // Convert request to Booking entity
        Booking bookingUpdate = new Booking();
        bookingUpdate.setSpecialRequests(request.getSpecialRequests());
        bookingUpdate.setContactPhone(request.getContactPhone());
        
        Booking updatedBooking = bookingService.updateBooking(bookingId, bookingUpdate);
        
        return ResponseEntity.ok(success("Booking updated successfully", mapper.toBookingResponse(updatedBooking)));
    }
    
    @PutMapping("/{bookingId}/confirm")
    @Operation(summary = "Confirm booking")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
        
        Booking confirmedBooking = bookingService.confirmBooking(bookingId);
        
        return ResponseEntity.ok(success("Booking confirmed successfully", mapper.toBookingResponse(confirmedBooking)));
    }
    
    @PutMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel booking")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @Parameter(description = "Cancellation reason") @RequestParam(required = false) String reason) {
        
        Booking cancelledBooking = bookingService.cancelBooking(bookingId, reason);
        
        return ResponseEntity.ok(success("Booking cancelled successfully", mapper.toBookingResponse(cancelledBooking)));
    }
    
    @PutMapping("/{bookingId}/paid")
    @Operation(summary = "Mark booking as paid")
    public ResponseEntity<ApiResponse<BookingResponse>> markAsPaid(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
        
        Booking paidBooking = bookingService.markAsPaid(bookingId);
        
        return ResponseEntity.ok(success("Booking marked as paid", mapper.toBookingResponse(paidBooking)));
    }
    
    @PutMapping("/{bookingId}/complete")
    @Operation(summary = "Complete booking")
    public ResponseEntity<ApiResponse<BookingResponse>> completeBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
        
        Booking completedBooking = bookingService.completeBooking(bookingId);
        
        return ResponseEntity.ok(success("Booking completed successfully", mapper.toBookingResponse(completedBooking)));
    }
    
    @GetMapping("/calculate-price")
    @Operation(summary = "Calculate booking total price")
    public ResponseEntity<ApiResponse<BigDecimal>> calculatePrice(
            @Parameter(description = "Tour ID") @RequestParam Long tourId,
            @Parameter(description = "Number of adults") @RequestParam Integer adults,
            @Parameter(description = "Number of children") @RequestParam(defaultValue = "0") Integer children,
            @Parameter(description = "Promotion code") @RequestParam(required = false) String promotionCode) {
        
        BigDecimal totalPrice = bookingService.calculateTotalPrice(tourId, adults, children, promotionCode);
        
        return ResponseEntity.ok(success("Price calculated successfully", totalPrice));
    }
    
    @GetMapping("/check-availability")
    @Operation(summary = "Check tour availability")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @Parameter(description = "Tour ID") @RequestParam Long tourId,
            @Parameter(description = "Start date") @RequestParam String startDate,
            @Parameter(description = "Total people") @RequestParam Integer totalPeople) {
        
        boolean available = bookingService.checkAvailability(tourId, 
                java.time.LocalDate.parse(startDate), totalPeople);
        
        return ResponseEntity.ok(success("Availability checked", available));
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get booking statistics")
    public ResponseEntity<ApiResponse<BookingService.BookingStatistics>> getBookingStatistics() {
        
        BookingService.BookingStatistics statistics = bookingService.getBookingStatistics();
        
        return ResponseEntity.ok(success(statistics));
    }
}
