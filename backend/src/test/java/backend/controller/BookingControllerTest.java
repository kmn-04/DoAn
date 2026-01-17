package backend.controller;

import backend.dto.request.BookingCreateRequest;
import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import backend.entity.Tour;
import backend.entity.User;
import backend.service.BookingService;
import backend.service.PromotionService;
import backend.service.PointVoucherService;
import backend.service.TourService;
import backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import backend.config.SecurityConfig;
import backend.security.JwtAuthenticationFilter;
import backend.security.RateLimitFilter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test cases cho Booking Controller
 * Bao gồm: Tạo booking, Tính giá booking, Lấy danh sách booking, Lấy booking theo ID
 */
@WebMvcTest(controllers = BookingController.class,
            excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientWebSecurityAutoConfiguration.class
            },
            excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                    SecurityConfig.class,
                    JwtAuthenticationFilter.class,
                    RateLimitFilter.class
                })
            })
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Booking Controller Tests")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private TourService tourService;

    @MockBean
    private UserService userService;

    @MockBean
    private PromotionService promotionService;

    @MockBean
    private PointVoucherService voucherService;

    @MockBean
    private backend.mapper.EntityMapper mapper;

    @MockBean
    private backend.repository.PaymentRepository paymentRepository;

    @MockBean
    private backend.repository.BookingRepository bookingRepository;

    @MockBean
    private backend.security.UserDetailsServiceImpl userDetailsService;

    @MockBean
    private backend.service.TokenBlacklistService tokenBlacklistService;

    @MockBean
    private backend.security.JwtUtils jwtUtils;

    private Tour mockTour;
    private User mockUser;
    private Booking mockBooking;
    private BookingResponse mockBookingResponse;

    @BeforeEach
    void setUp() {
        // Setup mock tour
        mockTour = new Tour();
        mockTour.setId(1L);
        mockTour.setName("Tour Đà Lạt 3 ngày 2 đêm");
        mockTour.setPrice(new BigDecimal("5000000"));
        mockTour.setSalePrice(new BigDecimal("4500000"));
        mockTour.setChildPrice(new BigDecimal("3500000"));
        mockTour.setMaxPeople(20);

        // Setup mock user
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setName("Nguyễn Văn A");
        mockUser.setPhone("0123456789");

        // Setup mock booking
        mockBooking = new Booking();
        mockBooking.setId(1L);
        mockBooking.setBookingCode("BK001");
        mockBooking.setTour(mockTour);
        mockBooking.setUser(mockUser);
        mockBooking.setStartDate(LocalDate.now().plusDays(7));
        mockBooking.setNumAdults(2);
        mockBooking.setNumChildren(1);
        mockBooking.setTotalPrice(new BigDecimal("13500000"));
        mockBooking.setFinalAmount(new BigDecimal("13500000"));

        // Setup mock booking response
        mockBookingResponse = new BookingResponse();
        mockBookingResponse.setId(1L);
        mockBookingResponse.setBookingCode("BK001");
        mockBookingResponse.setTotalPrice(new BigDecimal("13500000"));
        mockBookingResponse.setFinalAmount(new BigDecimal("13500000"));
    }

    @Test
    @DisplayName("TC024: Tính giá booking thành công")
    @WithMockUser(username = "test@example.com")
    void testCalculatePrice_Success() throws Exception {
        // Given
        when(tourService.getTourById(1L)).thenReturn(Optional.of(mockTour));

        // When & Then
        mockMvc.perform(get("/api/bookings/calculate-price")
                .param("tourId", "1")
                .param("adults", "2")
                .param("children", "1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.subtotal").exists())
                .andExpect(jsonPath("$.data.total").exists());
    }

    @Test
    @DisplayName("TC025: Tính giá booking với mã giảm giá")
    @WithMockUser(username = "test@example.com")
    void testCalculatePrice_WithPromotionCode() throws Exception {
        // Given
        when(tourService.getTourById(1L)).thenReturn(Optional.of(mockTour));
        when(promotionService.validatePromotionCode("PROMO10"))
                .thenReturn(Optional.of(createMockPromotion()));

        // When & Then
        mockMvc.perform(get("/api/bookings/calculate-price")
                .param("tourId", "1")
                .param("adults", "2")
                .param("children", "1")
                .param("promotionCode", "PROMO10")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.promotionDiscount").exists());
    }

    @Test
    @DisplayName("TC026: Tính giá booking thất bại - Tour không tồn tại")
    void testCalculatePrice_TourNotFound() throws Exception {
        // Given
        when(tourService.getTourById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/bookings/calculate-price")
                .param("tourId", "999")
                .param("adults", "2")
)
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC027: Tạo booking thành công")
    @WithMockUser(username = "test@example.com")
    void testCreateBooking_Success() throws Exception {
        // Given
        BookingCreateRequest request = new BookingCreateRequest();
        request.setTourId(1L);
        request.setStartDate(LocalDate.now().plusDays(7));
        request.setNumAdults(2);
        request.setNumChildren(1);
        request.setContactPhone("0123456789");

        when(tourService.getTourById(1L)).thenReturn(Optional.of(mockTour));
        when(userService.getUserByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(bookingService.createBooking(any(Booking.class))).thenReturn(mockBooking);
        when(bookingService.getBookingById(1L)).thenReturn(Optional.of(mockBooking));
        when(mapper.toBookingResponse(any(Booking.class))).thenReturn(mockBookingResponse);

        // When & Then
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Booking created successfully"))
                .andExpect(jsonPath("$.data.bookingCode").exists());
    }

    @Test
    @DisplayName("TC028: Tạo booking thất bại - Validation error")
    @WithMockUser(username = "test@example.com")
    void testCreateBooking_ValidationError() throws Exception {
        // Given
        BookingCreateRequest invalidRequest = new BookingCreateRequest();
        invalidRequest.setTourId(null); // Missing required field
        invalidRequest.setNumAdults(0); // Invalid value

        // When & Then
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC029: Tạo booking thất bại - Ngày bắt đầu trong quá khứ")
    @WithMockUser(username = "test@example.com")
    void testCreateBooking_PastDate() throws Exception {
        // Given
        BookingCreateRequest request = new BookingCreateRequest();
        request.setTourId(1L);
        request.setStartDate(LocalDate.now().minusDays(1)); // Past date
        request.setNumAdults(2);

        // When & Then
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC030: Lấy danh sách booking")
    void testGetAllBookings() throws Exception {
        // Given
        List<Booking> bookings = Arrays.asList(mockBooking);
        List<BookingResponse> responses = Arrays.asList(mockBookingResponse);
        
        when(bookingService.getAllBookings()).thenReturn(bookings);
        when(mapper.toBookingResponseList(bookings)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/bookings")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("TC031: Lấy booking theo ID thành công")
    void testGetBookingById_Success() throws Exception {
        // Given
        when(bookingService.getBookingById(1L)).thenReturn(Optional.of(mockBooking));
        when(mapper.toBookingResponse(mockBooking)).thenReturn(mockBookingResponse);

        // When & Then
        mockMvc.perform(get("/api/bookings/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.bookingCode").value("BK001"));
    }

    @Test
    @DisplayName("TC032: Lấy booking theo ID thất bại - Booking không tồn tại")
    void testGetBookingById_NotFound() throws Exception {
        // Given
        when(bookingService.getBookingById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/bookings/999")
)
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC033: Lấy booking theo user ID")
    void testGetBookingsByUser() throws Exception {
        // Given
        List<Booking> bookings = Arrays.asList(mockBooking);
        List<BookingResponse> responses = Arrays.asList(mockBookingResponse);
        
        when(bookingService.getBookingsByUser(1L)).thenReturn(bookings);
        when(mapper.toBookingResponseList(bookings)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/bookings/user/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    private backend.entity.Promotion createMockPromotion() {
        backend.entity.Promotion promotion = new backend.entity.Promotion();
        promotion.setId(1L);
        promotion.setCode("PROMO10");
        promotion.setType(backend.entity.Promotion.PromotionType.PERCENTAGE);
        promotion.setValue(new BigDecimal("10"));
        promotion.setDescription("Giảm 10%");
        return promotion;
    }
}
