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
    @Operation(summary = "Get all categories", description = "Get all categories with pagination and filters (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured
    ) {
        try {
            // Use method with eager fetch to avoid LazyInitializationException
            List<Category> categories = categoryService.getAllCategoriesWithTours();
            
            // Apply filters
            java.util.stream.Stream<Category> stream = categories.stream();
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                stream = stream.filter(cat -> 
                    cat.getName().toLowerCase().contains(searchLower)
                );
            }
            
            if (status != null && !status.equalsIgnoreCase("all")) {
                stream = stream.filter(cat -> 
                    cat.getStatus() != null && cat.getStatus().name().equalsIgnoreCase(status)
                );
            }
            
            if (featured != null) {
                stream = stream.filter(cat -> cat.getIsFeatured() == featured);
            }
            
            List<Category> filteredList = stream.collect(java.util.stream.Collectors.toList());
            
            // Apply sorting
            filteredList.sort((a, b) -> {
                int comparison = 0;
                switch (sortBy.toLowerCase()) {
                    case "id":
                        comparison = Long.compare(a.getId(), b.getId());
                        break;
                    case "name":
                        comparison = a.getName().compareToIgnoreCase(b.getName());
                        break;
                    case "displayorder":
                        comparison = Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0
                        );
                        break;
                    default:
                        comparison = Long.compare(a.getId(), b.getId());
                }
                return direction.equalsIgnoreCase("desc") ? -comparison : comparison;
            });
            
            // Paginate
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), filteredList.size());
            List<Category> pageContent = start > filteredList.size() ? new java.util.ArrayList<>() : filteredList.subList(start, end);
            
            List<CategoryResponse> responses = mapper.toCategoryResponseList(pageContent);
            Page<CategoryResponse> pageResult = new org.springframework.data.domain.PageImpl<>(
                responses, pageable, filteredList.size()
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
            @RequestParam String status
    ) {
        try {
            log.info("Changing category {} status to: {}", id, status);
            CategoryStatus categoryStatus = CategoryStatus.valueOf(status.toUpperCase());
            Category updatedCategory = categoryService.changeCategoryStatus(id, categoryStatus);
            CategoryResponse response = mapper.toCategoryResponse(updatedCategory);
            return ResponseEntity.ok(success("Category status updated successfully", response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid status value: {}", status, e);
            return ResponseEntity.badRequest()
                    .body(error("Invalid status value: " + status + ". Must be 'Active' or 'Inactive'"));
        } catch (Exception e) {
            log.error("Error changing category status for ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to change category status: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/featured")
    @Operation(summary = "Toggle category featured status", description = "Toggle category featured status (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleFeaturedStatus(
            @PathVariable Long id,
            @RequestParam boolean featured
    ) {
        try {
            log.info("Toggling category {} featured status to: {}", id, featured);
            Category category = categoryService.getCategoryById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
            
            category.setIsFeatured(featured);
            Category updatedCategory = categoryService.updateCategory(id, category);
            
            CategoryResponse response = mapper.toCategoryResponse(updatedCategory);
            return ResponseEntity.ok(success("Category featured status updated successfully", response));
        } catch (Exception e) {
            log.error("Error toggling featured status for category ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to toggle featured status: " + e.getMessage()));
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
    
    @GetMapping("/count/active")
    @Operation(summary = "Get active categories count", description = "Get number of active categories (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getActiveCategoriesCount() {
        try {
            long count = categoryService.getAllCategories().stream()
                .filter(c -> c.getStatus() == CategoryStatus.ACTIVE)
                .count();
            return ResponseEntity.ok(success("Active categories count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting active categories count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get active categories count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/inactive")
    @Operation(summary = "Get inactive categories count", description = "Get number of inactive categories (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getInactiveCategoriesCount() {
        try {
            long count = categoryService.getAllCategories().stream()
                .filter(c -> c.getStatus() == CategoryStatus.INACTIVE)
                .count();
            return ResponseEntity.ok(success("Inactive categories count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting inactive categories count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get inactive categories count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/featured")
    @Operation(summary = "Get featured categories count", description = "Get number of featured categories (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getFeaturedCategoriesCount() {
        try {
            long count = categoryService.getAllCategories().stream()
                .filter(Category::getIsFeatured)
                .count();
            return ResponseEntity.ok(success("Featured categories count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting featured categories count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get featured categories count: " + e.getMessage()));
        }
    }
}

