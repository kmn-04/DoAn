package backend.controller;

import backend.dto.request.CategoryCreateRequest;
import backend.dto.response.CategoryResponse;
import backend.entity.Category;
import backend.service.CategoryService;
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
import org.springframework.test.web.servlet.MockMvc;
import backend.config.SecurityConfig;
import backend.security.JwtAuthenticationFilter;
import backend.security.RateLimitFilter;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test cases cho Category Controller
 * Bao gồm: Lấy danh sách category, Tạo category, Cập nhật category, Xóa category
 */
@WebMvcTest(controllers = CategoryController.class,
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
@DisplayName("Category Controller Tests")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    private Category mockCategory;
    private CategoryResponse mockCategoryResponse;

    @BeforeEach
    void setUp() {
        // Setup mock category
        mockCategory = new Category();
        mockCategory.setId(1L);
        mockCategory.setName("Du lịch trong nước");
        mockCategory.setSlug("du-lich-trong-nuoc");
        mockCategory.setDescription("Các tour du lịch trong nước");
        mockCategory.setStatus(Category.CategoryStatus.ACTIVE);

        // Setup mock category response
        mockCategoryResponse = new CategoryResponse();
        mockCategoryResponse.setId(1L);
        mockCategoryResponse.setName("Du lịch trong nước");
        mockCategoryResponse.setSlug("du-lich-trong-nuoc");
        mockCategoryResponse.setDescription("Các tour du lịch trong nước");
    }

    @Test
    @DisplayName("TC043: Lấy danh sách tất cả category")
    void testGetAllCategories() throws Exception {
        // Given
        // Controller uses getCategoriesWithTourCount() internally
        CategoryService.CategoryWithTourCount categoryWithCount = 
            new CategoryService.CategoryWithTourCount(mockCategory, 5L);
        List<CategoryService.CategoryWithTourCount> categoriesWithCount = 
            Arrays.asList(categoryWithCount);
        
        when(categoryService.getCategoriesWithTourCount()).thenReturn(categoriesWithCount);

        // When & Then
        mockMvc.perform(get("/api/categories")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Du lịch trong nước"));
    }

    @Test
    @DisplayName("TC044: Lấy danh sách category đang hoạt động")
    void testGetActiveCategories() throws Exception {
        // Given
        List<Category> categories = Arrays.asList(mockCategory);
        List<CategoryResponse> responses = Arrays.asList(mockCategoryResponse);
        
        when(categoryService.getActiveCategories()).thenReturn(categories);
        when(mapper.toCategoryResponseList(categories)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/api/categories/active")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("TC045: Lấy category theo ID thành công")
    void testGetCategoryById_Success() throws Exception {
        // Given
        when(categoryService.getCategoryById(1L)).thenReturn(Optional.of(mockCategory));
        when(mapper.toCategoryResponseFull(mockCategory)).thenReturn(mockCategoryResponse);

        // When & Then
        mockMvc.perform(get("/api/categories/1")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Du lịch trong nước"));
    }

    @Test
    @DisplayName("TC046: Lấy category theo ID thất bại - Category không tồn tại")
    void testGetCategoryById_NotFound() throws Exception {
        // Given
        when(categoryService.getCategoryById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/categories/999")
)
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC047: Lấy category theo slug thành công")
    void testGetCategoryBySlug_Success() throws Exception {
        // Given
        when(categoryService.getCategoryBySlug("du-lich-trong-nuoc"))
                .thenReturn(Optional.of(mockCategory));
        when(mapper.toCategoryResponseFull(mockCategory)).thenReturn(mockCategoryResponse);

        // When & Then
        mockMvc.perform(get("/api/categories/slug/du-lich-trong-nuoc")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("du-lich-trong-nuoc"));
    }

    @Test
    @DisplayName("TC048: Tạo category mới thành công")
    void testCreateCategory_Success() throws Exception {
        // Given
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("Du lịch nước ngoài");
        request.setDescription("Các tour du lịch nước ngoài");
        request.setSlug("du-lich-nuoc-ngoai");

        Category newCategory = new Category();
        newCategory.setId(2L);
        newCategory.setName("Du lịch nước ngoài");
        newCategory.setSlug("du-lich-nuoc-ngoai");

        CategoryResponse newResponse = new CategoryResponse();
        newResponse.setId(2L);
        newResponse.setName("Du lịch nước ngoài");

        when(categoryService.createCategory(any(Category.class))).thenReturn(newCategory);
        when(mapper.toCategoryResponseFull(any(Category.class))).thenReturn(newResponse);

        // When & Then
        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Category created successfully"));
    }

    @Test
    @DisplayName("TC049: Tạo category thất bại - Validation error (tên quá ngắn)")
    void testCreateCategory_ValidationError() throws Exception {
        // Given
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("A"); // Too short (min 2 characters, but "A" is only 1)
        request.setDescription("Test");

        // When & Then
        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC050: Kiểm tra slug đã tồn tại")
    void testCheckSlugExists_True() throws Exception {
        // Given
        when(categoryService.slugExists("du-lich-trong-nuoc")).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/api/categories/check-slug/du-lich-trong-nuoc")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("TC051: Kiểm tra slug chưa tồn tại")
    void testCheckSlugExists_False() throws Exception {
        // Given
        when(categoryService.slugExists("new-category-slug")).thenReturn(false);

        // When & Then
        mockMvc.perform(get("/api/categories/check-slug/new-category-slug")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(false));
    }
}
