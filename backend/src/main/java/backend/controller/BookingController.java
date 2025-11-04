package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import backend.entity.Promotion;
import backend.exception.BadRequestException;
import backend.service.BookingService;
import backend.service.PromotionService;
import backend.mapper.EntityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final PromotionService promotionService;
    private final EntityMapper mapper;
    private final backend.repository.PaymentRepository paymentRepository;
    
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
    
    @GetMapping("/payment/{paymentId}")
    @Operation(summary = "Get booking by payment ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByPaymentId(
            @Parameter(description = "Payment ID") @PathVariable Long paymentId) {
        
        try {
            // ✅ OPTIMIZED: Use fetch join to load all related entities in single query
            backend.entity.Payment payment = paymentRepository.findByIdWithBookingDetails(paymentId)
                    .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Payment", "id", paymentId));
            
            Booking booking = payment.getBooking();
            if (booking == null) {
                throw new backend.exception.ResourceNotFoundException("Booking", "payment id", paymentId);
            }
            
            // All related entities (Tour, User, Schedule, Promotion) are already loaded via fetch joins
            // No need for force initialization
            
            BookingResponse bookingResponse = mapper.toBookingResponse(booking);
            
            return ResponseEntity.ok(success("Booking retrieved successfully by payment ID", bookingResponse));
        } catch (Exception e) {
            log.error("Error getting booking by payment ID: {}", paymentId, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to get booking: " + e.getMessage()));
        }
    }
    
    @GetMapping("/calculate-price")
    @Operation(summary = "Calculate booking price with optional promotion code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculatePrice(
            @RequestParam Long tourId,
            @RequestParam Integer adults,
            @RequestParam(required = false) Integer children,
            @RequestParam(required = false) String promotionCode) {
        
        try {
            log.info("Calculating price for tourId: {}, adults: {}, children: {}, promotionCode: {}", 
                    tourId, adults, children, promotionCode);
            
            // Get tour
            Tour tour = tourService.getTourById(tourId)
                    .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Tour", "id", tourId));
            
            int numChildren = children != null ? children : 0;
            
            // Calculate base prices
            BigDecimal adultPrice = tour.getPrice();
            BigDecimal childPrice = tour.getChildPrice() != null ? tour.getChildPrice() : tour.getPrice().multiply(BigDecimal.valueOf(0.7));
            
            BigDecimal subtotal = adultPrice.multiply(BigDecimal.valueOf(adults))
                    .add(childPrice.multiply(BigDecimal.valueOf(numChildren)));
            
            BigDecimal discount = BigDecimal.ZERO;
            String promotionDescription = null;
            
            // Apply promotion if provided
            if (promotionCode != null && !promotionCode.trim().isEmpty()) {
                Promotion promotion = promotionService.validatePromotionCode(promotionCode.trim())
                        .orElseThrow(() -> new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));
                
                // Check minimum order
                if (promotion.getMinOrderAmount() != null && subtotal.compareTo(promotion.getMinOrderAmount()) < 0) {
                    throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " 
                            + String.format("%,.0f", promotion.getMinOrderAmount()) + " VNĐ");
                }
                
                // Calculate discount
                log.info("Promotion details - Type: {}, Value: {}, MinOrder: {}, MaxDiscount: {}", 
                        promotion.getType(), promotion.getValue(), promotion.getMinOrderAmount(), promotion.getMaxDiscount());
                
                if ("PERCENTAGE".equals(promotion.getType().name())) {
                    discount = subtotal.multiply(promotion.getValue().divide(BigDecimal.valueOf(100)))
                            .setScale(0, RoundingMode.HALF_UP);
                    
                    // Apply max discount if set
                    if (promotion.getMaxDiscount() != null && discount.compareTo(promotion.getMaxDiscount()) > 0) {
                        discount = promotion.getMaxDiscount();
                    }
                } else if ("FIXED_AMOUNT".equals(promotion.getType().name()) || "FIXED".equals(promotion.getType().name())) {
                    // Fixed amount discount
                    discount = promotion.getValue();
                } else {
                    log.warn("Unknown promotion type: {}", promotion.getType());
                }
                
                promotionDescription = promotion.getDescription();
                log.info("Applied promotion: {} - Discount: {}", promotionCode, discount);
            }
            
            BigDecimal total = subtotal.subtract(discount);
            if (total.compareTo(BigDecimal.ZERO) < 0) {
                total = BigDecimal.ZERO;
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("subtotal", subtotal);
            result.put("discount", discount);
            result.put("total", total);
            result.put("adultPrice", adultPrice);
            result.put("childPrice", childPrice);
            result.put("adults", adults);
            result.put("children", numChildren);
            if (promotionCode != null && !promotionCode.trim().isEmpty()) {
                result.put("promotionCode", promotionCode.trim());
                result.put("promotionDescription", promotionDescription);
            }
            
            return ResponseEntity.ok(success("Price calculated successfully", result));
            
        } catch (Exception e) {
            log.error("Error calculating price", e);
            return ResponseEntity.badRequest()
                    .body(error(e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create new booking")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request) {
        
        log.info("Creating booking for tour: {} by user: {}", request.getTourId(), "current_user");
        log.info("📋 Booking request details: {}", request);
        
        // Get tour and user entities
        Tour tour = tourService.getTourById(request.getTourId())
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Tour", "id", request.getTourId()));
        log.info("✅ Found tour: {} - {}", tour.getId(), tour.getName());
                
        // Get current user from security context
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        log.info("🔍 Current authenticated user email: {}", currentUserEmail);
        
        User user = userService.getUserByEmail(currentUserEmail)
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("User", "email", currentUserEmail));
        log.info("✅ Found user: {} - {}", user.getId(), user.getEmail());
        
        // Create booking entity
        Booking booking = new Booking();
        booking.setTour(tour);
        booking.setUser(user);
        booking.setStartDate(request.getStartDate());
        booking.setNumAdults(request.getNumAdults());
        booking.setNumChildren(request.getNumChildren() != null ? request.getNumChildren() : 0);
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setContactPhone(request.getContactPhone());
        
        // Set unit price from tour's effective price
        booking.setUnitPrice(tour.getEffectivePrice());
        log.info("💰 Set unit price: {}", tour.getEffectivePrice());
        
        // Set customer info from user
        booking.setCustomerName(user.getName());
        booking.setCustomerEmail(user.getEmail());
        booking.setCustomerPhone(user.getPhone() != null ? user.getPhone() : request.getContactPhone());
        
        // Apply promotion if provided
        if (request.getPromotionCode() != null && !request.getPromotionCode().trim().isEmpty()) {
            Promotion promotion = promotionService.validatePromotionCode(request.getPromotionCode().trim())
                    .orElseThrow(() -> new BadRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));
            booking.setPromotion(promotion);
            log.info("🎫 Applied promotion: {} - {}", promotion.getCode(), promotion.getDescription());
        }
        
        // Create booking
        Booking createdBooking = bookingService.createBooking(booking);
        log.info("✅ Created booking: {} for user: {}", createdBooking.getBookingCode(), createdBooking.getUser().getId());
        
        BookingResponse bookingResponse = mapper.toBookingResponse(createdBooking);
        log.info("📤 Returning booking response: {}", bookingResponse.getBookingCode());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(success("Booking created successfully", bookingResponse));
    }
}
