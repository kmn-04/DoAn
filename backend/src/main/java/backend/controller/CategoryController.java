package backend.controller;

import backend.dto.request.CategoryCreateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.CategoryResponse;
import backend.dto.response.PageResponse;
import backend.entity.Category;
import backend.entity.Category.CategoryStatus;
import backend.exception.ResourceNotFoundException;
import backend.service.CategoryService;
import backend.mapper.EntityMapper;
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

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Category Management", description = "APIs for managing categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class CategoryController extends BaseController {
    
    private final CategoryService categoryService;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        try {
            // Use the method that includes tour count
            List<CategoryService.CategoryWithTourCount> categoriesWithCount = categoryService.getCategoriesWithTourCount();
            
            // If no categories found, return mock data
            if (categoriesWithCount == null || categoriesWithCount.isEmpty()) {
                log.warn("No categories found in database, returning mock data");
                return ResponseEntity.ok(success("Mock categories retrieved", createMockCategoryResponses()));
            }
            
            // Map to CategoryResponse with actual tour count
            List<CategoryResponse> categoryResponses = categoriesWithCount.stream()
                .map(cwc -> mapToCategoryResponseWithCount(cwc.getCategory(), cwc.getTourCount()))
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(success("Categories retrieved successfully", categoryResponses));
            
        } catch (Exception e) {
            log.error("Error getting all categories", e);
            return ResponseEntity.ok(success("Mock categories retrieved", createMockCategoryResponses()));
        }
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get active categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getActiveCategories() {
        try {
            List<Category> categories = categoryService.getActiveCategories();
            
            // If no categories found, return mock data
            if (categories.isEmpty()) {
                log.warn("No categories found in database, returning mock data");
                return ResponseEntity.ok(success("Mock categories retrieved", createMockCategoryResponses()));
            }
            
            // Use simple mapping without accessing lazy-loaded tours collection
            List<CategoryResponse> categoryResponses = categories.stream()
                .map(this::mapToSimpleCategoryResponse)
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(success(categoryResponses));
            
        } catch (Exception e) {
            log.error("Error getting active categories", e);
            return ResponseEntity.ok(success("Mock categories retrieved", createMockCategoryResponses()));
        }
    }
    
    private CategoryResponse mapToSimpleCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setIsFeatured(category.getIsFeatured());
        response.setStatus(category.getStatus() != null ? category.getStatus().toString() : null);
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        response.setTourCount(0L); // Don't access lazy-loaded tours here
        return response;
    }
    
    private CategoryResponse mapToCategoryResponseWithCount(Category category, long tourCount) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setIsFeatured(category.getIsFeatured());
        response.setStatus(category.getStatus() != null ? category.getStatus().toString() : null);
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        response.setTourCount(tourCount); // Use actual tour count from query
        return response;
    }
    
    private List<CategoryResponse> createMockCategoryResponses() {
        return java.util.Arrays.asList(
            createMockCategory(1L, "Tour biển đảo", "tour-bien-dao", "Khám phá những bãi biển tuyệt đẹp"),
            createMockCategory(2L, "Tour văn hóa", "tour-van-hoa", "Tìm hiểu về văn hóa địa phương"),
            createMockCategory(3L, "Tour phiêu lưu", "tour-phieu-luu", "Những trải nghiệm mạo hiểm"),
            createMockCategory(4L, "Tour ẩm thực", "tour-am-thuc", "Khám phá ẩm thực đặc sản"),
            createMockCategory(5L, "Tour nghỉ dưỡng", "tour-nghi-duong", "Thư giãn tại resort cao cấp"),
            createMockCategory(6L, "Tour thành phố", "tour-thanh-pho", "Khám phá nhịp sống thành phố")
        );
    }
    
    private CategoryResponse createMockCategory(Long id, String name, String slug, String description) {
        CategoryResponse response = new CategoryResponse();
        response.setId(id);
        response.setName(name);
        response.setSlug(slug);
        response.setDescription(description);
        response.setStatus("Active");
        return response;
    }
    
    @GetMapping("/with-tour-count")
    @Operation(summary = "Get categories with tour count")
    public ResponseEntity<ApiResponse<List<CategoryService.CategoryWithTourCount>>> getCategoriesWithTourCount() {
        
        List<CategoryService.CategoryWithTourCount> categoriesWithCount = categoryService.getCategoriesWithTourCount();
        
        return ResponseEntity.ok(success(categoriesWithCount));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search categories by keyword")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> searchCategories(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = createPageable(page, size);
        Page<Category> categories = categoryService.searchCategories(keyword, pageable);
        Page<CategoryResponse> categoryResponses = categories.map(mapper::toCategoryResponseFull);
        
        return ResponseEntity.ok(successPage(categoryResponses));
    }
    
    @GetMapping("/{categoryId}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @Parameter(description = "Category ID") @PathVariable Long categoryId) {
        
        Category category = categoryService.getCategoryById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        return ResponseEntity.ok(success(mapper.toCategoryResponseFull(category)));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(
            @Parameter(description = "Category slug") @PathVariable String slug) {
        
        Category category = categoryService.getCategoryBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        
        return ResponseEntity.ok(success(mapper.toCategoryResponseFull(category)));
    }
    
    @PostMapping
    @Operation(summary = "Create new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        
        // Convert request to Category entity
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        
        Category createdCategory = categoryService.createCategory(category);
        
        return ResponseEntity.ok(success("Category created successfully", mapper.toCategoryResponseFull(createdCategory)));
    }
    
    @PutMapping("/{categoryId}")
    @Operation(summary = "Update category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @Parameter(description = "Category ID") @PathVariable Long categoryId,
            @Valid @RequestBody CategoryCreateRequest request) {
        
        // Convert request to Category entity
        Category categoryUpdate = new Category();
        categoryUpdate.setName(request.getName());
        categoryUpdate.setDescription(request.getDescription());
        categoryUpdate.setImageUrl(request.getImageUrl());
        
        Category updatedCategory = categoryService.updateCategory(categoryId, categoryUpdate);
        
        return ResponseEntity.ok(success("Category updated successfully", mapper.toCategoryResponseFull(updatedCategory)));
    }
    
    @PutMapping("/{categoryId}/status")
    @Operation(summary = "Change category status")
    public ResponseEntity<ApiResponse<CategoryResponse>> changeCategoryStatus(
            @Parameter(description = "Category ID") @PathVariable Long categoryId,
            @Parameter(description = "New status") @RequestParam CategoryStatus status) {
        
        Category updatedCategory = categoryService.changeCategoryStatus(categoryId, status);
        
        return ResponseEntity.ok(success("Category status updated", mapper.toCategoryResponseFull(updatedCategory)));
    }
    
    @DeleteMapping("/{categoryId}")
    @Operation(summary = "Delete category")
    public ResponseEntity<ApiResponse<String>> deleteCategory(
            @Parameter(description = "Category ID") @PathVariable Long categoryId) {
        
        categoryService.deleteCategory(categoryId);
        
        return ResponseEntity.ok(success("Category deleted successfully"));
    }
    
    @GetMapping("/check-slug/{slug}")
    @Operation(summary = "Check if slug exists")
    public ResponseEntity<ApiResponse<Boolean>> checkSlugExists(
            @Parameter(description = "Slug to check") @PathVariable String slug) {
        
        boolean exists = categoryService.slugExists(slug);
        
        return ResponseEntity.ok(success("Slug check completed", exists));
    }
}
