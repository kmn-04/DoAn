package backend.controller;

import backend.dto.*;
import backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Lấy tất cả categories với phân trang (Admin)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CategoryDto>> getAllCategoriesAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<CategoryDto> categories = categoryService.getAllCategories(page, size, sortBy, sortDir);
        return ResponseEntity.ok(categories);
    }

    // Lấy tất cả categories sắp xếp theo display_order (Admin)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesOrderByDisplay() {
        List<CategoryDto> categories = categoryService.getAllCategoriesOrderByDisplay();
        return ResponseEntity.ok(categories);
    }

    // Lấy categories đang active (Public)
    @GetMapping("/active")
    public ResponseEntity<List<CategoryDto>> getActiveCategories() {
        List<CategoryDto> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    // Lấy category theo ID (Public)
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        Optional<CategoryDto> category = categoryService.getCategoryById(id);
        return category.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Removed getCategoryBySlug endpoint

    // Tìm kiếm categories theo tên (Admin)
    @GetMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryDto>> searchCategories(@RequestParam String name) {
        List<CategoryDto> categories = categoryService.searchCategoriesByName(name);
        return ResponseEntity.ok(categories);
    }

    // Tạo category mới (Admin)
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        try {
            CategoryDto createdCategory = categoryService.createCategory(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Tạo danh mục thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Cập nhật category (Admin)
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        try {
            CategoryDto updatedCategory = categoryService.updateCategory(id, request);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Cập nhật danh mục thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Xóa category (Admin)
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of(
                "message", "Xóa danh mục thành công"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Xóa danh mục thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Sắp xếp lại thứ tự categories (Admin)
    @PutMapping("/admin/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reorderCategories(@Valid @RequestBody CategoryReorderRequest request) {
        try {
            categoryService.reorderCategories(request);
            return ResponseEntity.ok(Map.of(
                "message", "Sắp xếp thứ tự danh mục thành công"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Sắp xếp thứ tự thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Lấy thống kê categories (Admin)
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryService.CategoryStatsDto> getCategoryStats() {
        CategoryService.CategoryStatsDto stats = categoryService.getCategoryStats();
        return ResponseEntity.ok(stats);
    }

    // Toggle trạng thái active/inactive (Admin)
    @PatchMapping("/admin/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleCategoryStatus(@PathVariable Long id) {
        try {
            Optional<CategoryDto> categoryOpt = categoryService.getCategoryById(id);
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            CategoryDto category = categoryOpt.get();
            CategoryUpdateRequest updateRequest = new CategoryUpdateRequest();
            updateRequest.setName(category.getName());
            updateRequest.setDescription(category.getDescription());
            updateRequest.setDisplayOrder(category.getDisplayOrder());
            updateRequest.setImageUrl(category.getImageUrl());
            updateRequest.setGalleryImages(category.getGalleryImages());
            updateRequest.setIsActive(!category.getIsActive()); // Toggle status

            CategoryDto updatedCategory = categoryService.updateCategory(id, updateRequest);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Thay đổi trạng thái thất bại",
                "message", e.getMessage()
            ));
        }
    }
}
