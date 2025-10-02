package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.request.CategoryRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.CategoryResponse;
import backend.entity.Category;
import backend.entity.Category.CategoryStatus;
import backend.mapper.EntityMapper;
import backend.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Category Management", description = "Admin APIs for managing categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminCategoryController extends BaseController {
    
    private final CategoryService categoryService;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all categories", description = "Get all categories with pagination (Admin only)")
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            List<Category> categories = categoryService.getAllCategories();
            
            // Convert to Page manually if not paginated in service
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), categories.size());
            List<CategoryResponse> responses = mapper.toCategoryResponseList(
                categories.subList(start, end)
            );
            
            Page<CategoryResponse> pageResult = new org.springframework.data.domain.PageImpl<>(
                responses, pageable, categories.size()
            );
            
            return ResponseEntity.ok(success("Categories retrieved successfully", pageResult));
        } catch (Exception e) {
            log.error("Error getting categories", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get categories: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get category details by ID (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        try {
            Category category = categoryService.getCategoryById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
            
            CategoryResponse response = mapper.toCategoryResponse(category);
            return ResponseEntity.ok(success("Category retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting category with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get category: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create category", description = "Create new category (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        try {
            Category category = mapper.toCategory(request);
            Category createdCategory = categoryService.createCategory(category);
            
            CategoryResponse response = mapper.toCategoryResponse(createdCategory);
            return ResponseEntity.ok(success("Category created successfully", response));
        } catch (Exception e) {
            log.error("Error creating category", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to create category: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update category by ID (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        try {
            Category category = mapper.toCategory(request);
            Category updatedCategory = categoryService.updateCategory(id, category);
            
            CategoryResponse response = mapper.toCategoryResponse(updatedCategory);
            return ResponseEntity.ok(success("Category updated successfully", response));
        } catch (Exception e) {
            log.error("Error updating category with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update category: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete category by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(success("Category deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting category with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete category: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Change category status", description = "Change category status (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> changeCategoryStatus(
            @PathVariable Long id,
            @RequestParam CategoryStatus status
    ) {
        try {
            Category updatedCategory = categoryService.changeCategoryStatus(id, status);
            CategoryResponse response = mapper.toCategoryResponse(updatedCategory);
            return ResponseEntity.ok(success("Category status updated successfully", response));
        } catch (Exception e) {
            log.error("Error changing category status for ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to change category status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total categories count", description = "Get total number of categories (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalCategoriesCount() {
        try {
            long count = categoryService.getAllCategories().size();
            return ResponseEntity.ok(success("Total categories count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting categories count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get categories count: " + e.getMessage()));
        }
    }
}

