package backend.controller;

import backend.dto.request.ReviewCreateRequest;
import backend.dto.response.ReviewResponse;
import backend.entity.Review;
import backend.service.ReviewService;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import backend.config.SecurityConfig;
import backend.security.JwtAuthenticationFilter;
import backend.security.RateLimitFilter;
import backend.security.UserDetailsImpl;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test cases cho Review Controller
 * Bao gồm: Tạo review, Lấy danh sách review, Cập nhật review, Xóa review
 */
@WebMvcTest(controllers = ReviewController.class,
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
@DisplayName("Review Controller Tests")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private backend.security.UserDetailsServiceImpl userDetailsService;

    @MockBean
    private backend.service.TokenBlacklistService tokenBlacklistService;

    @MockBean
    private backend.security.JwtUtils jwtUtils;

    private ReviewResponse mockReviewResponse;

    @BeforeEach
    void setUp() {
        // Setup mock review response
        mockReviewResponse = new ReviewResponse();
        mockReviewResponse.setId(1L);
        mockReviewResponse.setRating(5);
        mockReviewResponse.setComment("Tour rất tuyệt vời, hướng dẫn viên nhiệt tình!");
        
        // Setup tour summary
        ReviewResponse.TourSummary tourSummary = new ReviewResponse.TourSummary();
        tourSummary.setId(1L);
        tourSummary.setName("Test Tour");
        mockReviewResponse.setTour(tourSummary);
        
        // Setup user summary
        ReviewResponse.UserSummary userSummary = new ReviewResponse.UserSummary();
        userSummary.setId(1L);
        userSummary.setName("Test User");
        userSummary.setEmail("test@example.com");
        mockReviewResponse.setUser(userSummary);
    }

    @Test
    @DisplayName("TC034: Lấy danh sách review đã được duyệt")
    void testGetAllReviews() throws Exception {
        // Given
        List<ReviewResponse> reviews = Arrays.asList(mockReviewResponse);
        when(reviewService.getAllApprovedReviews()).thenReturn(reviews);

        // When & Then
        mockMvc.perform(get("/api/reviews")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].rating").value(5));
    }

    @Test
    @DisplayName("TC035: Tạo review thành công")
    @WithMockUser(username = "test@example.com")
    void testCreateReview_Success() throws Exception {
        // Given
        ReviewCreateRequest request = new ReviewCreateRequest();
        request.setTourId(1L);
        request.setBookingId(1L);
        request.setRating(5);
        request.setComment("Tour rất tuyệt vời, hướng dẫn viên nhiệt tình!");

        // Mock UserDetailsImpl for authentication principal
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L,
                "Test User",
                "test@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        when(reviewService.createReview(any(ReviewCreateRequest.class), eq(1L)))
                .thenReturn(mockReviewResponse);

        // When & Then
        mockMvc.perform(post("/api/reviews")
                .with(httpRequest -> {
                    // Set custom authentication with UserDetailsImpl
                    org.springframework.security.core.Authentication auth = 
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .setAuthentication(auth);
                    return httpRequest;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Review created successfully. It will be published after approval."))
                .andExpect(jsonPath("$.data.rating").value(5));
    }

    @Test
    @DisplayName("TC036: Tạo review thất bại - Validation error (rating quá cao)")
    void testCreateReview_InvalidRating() throws Exception {
        // Given
        ReviewCreateRequest request = new ReviewCreateRequest();
        request.setTourId(1L);
        request.setBookingId(1L);
        request.setRating(6); // Invalid: rating > 5
        request.setComment("Tour rất tuyệt vời!");

        // When & Then
        mockMvc.perform(post("/api/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC037: Tạo review thất bại - Comment quá ngắn")
    void testCreateReview_CommentTooShort() throws Exception {
        // Given
        ReviewCreateRequest request = new ReviewCreateRequest();
        request.setTourId(1L);
        request.setBookingId(1L);
        request.setRating(5);
        request.setComment("OK"); // Too short (min 10 characters)

        // When & Then
        mockMvc.perform(post("/api/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC038: Tạo review thất bại - Comment quá dài")
    void testCreateReview_CommentTooLong() throws Exception {
        // Given
        ReviewCreateRequest request = new ReviewCreateRequest();
        request.setTourId(1L);
        request.setBookingId(1L);
        request.setRating(5);
        request.setComment("A".repeat(1001)); // Too long (max 1000 characters)

        // When & Then
        mockMvc.perform(post("/api/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC039: Lấy review theo tour ID")
    void testGetReviewsByTour() throws Exception {
        // Given
        List<ReviewResponse> reviews = Arrays.asList(mockReviewResponse);
        when(reviewService.getReviewsByTourId(1L)).thenReturn(reviews);

        // When & Then
        mockMvc.perform(get("/api/reviews/tour/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].tour.id").value(1));
    }

    @Test
    @DisplayName("TC040: Lấy review theo user ID")
    void testGetReviewsByUser() throws Exception {
        // Given
        List<ReviewResponse> reviews = Arrays.asList(mockReviewResponse);
        when(reviewService.getReviewsByUserId(1L)).thenReturn(reviews);

        // When & Then
        mockMvc.perform(get("/api/reviews/user/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("TC041: Cập nhật review thành công")
    @WithMockUser(username = "test@example.com")
    void testUpdateReview_Success() throws Exception {
        // Given
        ReviewCreateRequest request = new ReviewCreateRequest();
        request.setTourId(1L);
        request.setBookingId(1L);
        request.setRating(4);
        request.setComment("Tour khá tốt, có một số điểm cần cải thiện");

        // Mock UserDetailsImpl for authentication principal
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L,
                "Test User",
                "test@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        ReviewResponse updatedResponse = new ReviewResponse();
        updatedResponse.setId(1L);
        updatedResponse.setRating(4);
        updatedResponse.setComment("Tour khá tốt, có một số điểm cần cải thiện");

        when(reviewService.updateReview(eq(1L), any(ReviewCreateRequest.class), eq(1L)))
                .thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(put("/api/reviews/1")
                .with(httpRequest -> {
                    // Set custom authentication with UserDetailsImpl
                    org.springframework.security.core.Authentication auth = 
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .setAuthentication(auth);
                    return httpRequest;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rating").value(4));
    }

    @Test
    @DisplayName("TC042: Xóa review thành công")
    @WithMockUser(username = "test@example.com")
    void testDeleteReview_Success() throws Exception {
        // Given
        // Mock UserDetailsImpl for authentication principal
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L,
                "Test User",
                "test@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        // deleteReview returns void, so we just verify it doesn't throw exception

        // When & Then
        mockMvc.perform(delete("/api/reviews/1")
                .with(httpRequest -> {
                    // Set custom authentication with UserDetailsImpl
                    org.springframework.security.core.Authentication auth = 
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .setAuthentication(auth);
                    return httpRequest;
                }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Review deleted successfully"));
    }
}
