package backend.controller;

import backend.dto.request.TourCreateRequest;
import backend.dto.request.TourSearchRequest;
import backend.dto.response.TourResponse;
import backend.entity.Category;
import backend.entity.Tour;
import backend.service.CategoryService;
import backend.service.TourService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import backend.config.SecurityConfig;
import backend.security.JwtAuthenticationFilter;
import backend.security.RateLimitFilter;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test cases cho Tour Controller
 * Bao gồm: Tìm kiếm tour, Lấy danh sách tour, Tạo tour, Cập nhật tour, Xóa tour
 */
@WebMvcTest(controllers = TourController.class,
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
@DisplayName("Tour Controller Tests")
class TourControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TourService tourService;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private backend.mapper.EntityMapper mapper;

    @MockBean
    private backend.security.UserDetailsServiceImpl userDetailsService;

    @MockBean
    private backend.service.TokenBlacklistService tokenBlacklistService;

    @MockBean
    private backend.security.JwtUtils jwtUtils;

    private Tour mockTour;
    private TourResponse mockTourResponse;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        // Setup mock category
        mockCategory = new Category();
        mockCategory.setId(1L);
        mockCategory.setName("Du lịch trong nước");
        mockCategory.setSlug("du-lich-trong-nuoc");

        // Setup mock tour
        mockTour = new Tour();
        mockTour.setId(1L);
        mockTour.setName("Tour Đà Lạt 3 ngày 2 đêm");
        mockTour.setSlug("tour-da-lat-3-ngay-2-dem");
        mockTour.setPrice(new BigDecimal("5000000"));
        mockTour.setSalePrice(new BigDecimal("4500000"));
        mockTour.setDuration(3);
        mockTour.setMaxPeople(20);
        mockTour.setCategory(mockCategory);
        mockTour.setStatus(Tour.TourStatus.ACTIVE);

        // Setup mock tour response
        mockTourResponse = new TourResponse();
        mockTourResponse.setId(1L);
        mockTourResponse.setName("Tour Đà Lạt 3 ngày 2 đêm");
        mockTourResponse.setSlug("tour-da-lat-3-ngay-2-dem");
        mockTourResponse.setPrice(new BigDecimal("5000000"));
        mockTourResponse.setSalePrice(new BigDecimal("4500000"));
        mockTourResponse.setDuration(3);
    }

    @Test
    @DisplayName("TC013: Lấy danh sách tour với phân trang")
    void testGetAllTours_WithPagination() throws Exception {
        // Given
        Page<Tour> tourPage = new PageImpl<>(Arrays.asList(mockTour), PageRequest.of(0, 20), 1);
        Page<TourResponse> responsePage = new PageImpl<>(Arrays.asList(mockTourResponse));
        
        when(tourService.getAllTours(any())).thenReturn(tourPage);
        when(mapper.toTourResponse(any(Tour.class))).thenReturn(mockTourResponse);

        // When & Then
        mockMvc.perform(get("/api/tours")
                .param("page", "0")
                .param("size", "20")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].id").value(1));
    }

    @Test
    @DisplayName("TC014: Lấy tour theo ID thành công")
    void testGetTourById_Success() throws Exception {
        // Given
        when(tourService.getTourById(1L)).thenReturn(Optional.of(mockTour));
        when(mapper.toTourResponseWithDetails(mockTour)).thenReturn(mockTourResponse);

        // When & Then
        mockMvc.perform(get("/api/tours/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Tour Đà Lạt 3 ngày 2 đêm"));
    }

    @Test
    @DisplayName("TC015: Lấy tour theo ID thất bại - Tour không tồn tại")
    void testGetTourById_NotFound() throws Exception {
        // Given
        when(tourService.getTourById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/tours/999")
)
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC016: Tìm kiếm tour theo từ khóa")
    void testSearchTours_ByKeyword() throws Exception {
        // Given
        Page<Tour> tourPage = new PageImpl<>(Arrays.asList(mockTour), PageRequest.of(0, 20), 1);
        Page<TourResponse> responsePage = new PageImpl<>(Arrays.asList(mockTourResponse));
        
        when(tourService.searchToursWithFilters(
                eq("Đà Lạt"), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
        )).thenReturn(tourPage);
        when(mapper.toTourResponse(any(Tour.class))).thenReturn(mockTourResponse);

        // When & Then
        mockMvc.perform(get("/api/tours/search")
                .param("keyword", "Đà Lạt")
                .param("page", "0")
                .param("size", "20")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("TC017: Tìm kiếm tour với bộ lọc giá")
    void testSearchTours_WithPriceFilter() throws Exception {
        // Given
        Page<Tour> tourPage = new PageImpl<>(Arrays.asList(mockTour), PageRequest.of(0, 20), 1);
        
        when(tourService.searchToursWithFilters(
                any(), any(), eq(new BigDecimal("3000000")), eq(new BigDecimal("6000000")), 
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
        )).thenReturn(tourPage);
        when(mapper.toTourResponse(any(Tour.class))).thenReturn(mockTourResponse);

        // When & Then
        mockMvc.perform(get("/api/tours/search")
                .param("minPrice", "3000000")
                .param("maxPrice", "6000000")
                .param("page", "0")
                .param("size", "20")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("TC018: Lấy danh sách tour nổi bật")
    void testGetFeaturedTours() throws Exception {
        // Given
        List<Tour> featuredTours = Arrays.asList(mockTour);
        List<TourResponse> featuredResponses = Arrays.asList(mockTourResponse);
        
        when(tourService.getFeaturedTours()).thenReturn(featuredTours);
        when(mapper.toTourResponseList(featuredTours)).thenReturn(featuredResponses);

        // When & Then
        mockMvc.perform(get("/api/tours/featured")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("TC019: Lấy tour theo category")
    void testGetToursByCategory() throws Exception {
        // Given
        List<Tour> tours = Arrays.asList(mockTour);
        List<TourResponse> responses = Arrays.asList(mockTourResponse);
        
        when(tourService.getToursByCategory(1L)).thenReturn(tours);
        when(mapper.toTourResponseList(tours)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/tours/category/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("TC020: Lấy top tour được đánh giá cao")
    void testGetTopRatedTours() throws Exception {
        // Given
        List<Tour> topTours = Arrays.asList(mockTour);
        List<TourResponse> topResponses = Arrays.asList(mockTourResponse);
        
        when(tourService.getTopRatedTours(10)).thenReturn(topTours);
        when(mapper.toTourResponseList(topTours)).thenReturn(topResponses);

        // When & Then
        mockMvc.perform(get("/api/tours/top-rated")
                .param("limit", "10")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("TC021: Tạo tour mới thành công")
    void testCreateTour_Success() throws Exception {
        // Given
        TourCreateRequest request = new TourCreateRequest();
        request.setName("Tour Sapa 4 ngày 3 đêm");
        request.setDescription("Tour du lịch Sapa với nhiều trải nghiệm thú vị. Khám phá vẻ đẹp thiên nhiên hùng vĩ của vùng núi Tây Bắc, tham quan các bản làng dân tộc, thưởng thức ẩm thực địa phương độc đáo.");
        request.setPrice(new BigDecimal("6000000"));
        request.setSalePrice(new BigDecimal("5500000"));
        request.setDuration(4);
        request.setMaxPeople(25);
        request.setCategoryId(1L);
        request.setIsFeatured(false);

        when(categoryService.getCategoryById(1L)).thenReturn(Optional.of(mockCategory));
        when(tourService.createTour(any(Tour.class))).thenReturn(mockTour);
        when(mapper.toTourResponse(any(Tour.class))).thenReturn(mockTourResponse);

        // When & Then
        mockMvc.perform(post("/api/tours")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tour created successfully"));
    }

    @Test
    @DisplayName("TC022: Tạo tour thất bại - Validation error")
    void testCreateTour_ValidationError() throws Exception {
        // Given
        TourCreateRequest invalidRequest = new TourCreateRequest();
        invalidRequest.setName("AB"); // Too short
        invalidRequest.setPrice(new BigDecimal("-1000")); // Invalid price

        // When & Then
        mockMvc.perform(post("/api/tours")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC023: Kiểm tra slug đã tồn tại")
    void testCheckSlugExists_True() throws Exception {
        // Given
        when(tourService.slugExists("tour-da-lat-3-ngay-2-dem")).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/api/tours/check-slug/tour-da-lat-3-ngay-2-dem")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));
    }
}
