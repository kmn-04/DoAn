package backend.service;

import backend.dto.*;
import backend.model.Category;
import backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Lấy tất cả categories với phân trang
    public Page<CategoryDto> getAllCategories(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Category> categories = categoryRepository.findAll(pageable);
        
        return categories.map(this::convertToDto);
    }

    // Lấy tất cả categories không phân trang, sắp xếp theo display_order
    public List<CategoryDto> getAllCategoriesOrderByDisplay() {
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrder();
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Lấy categories đang active
    public List<CategoryDto> getActiveCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrder();
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Lấy category theo ID
    public Optional<CategoryDto> getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::convertToDto);
    }

    // Removed getCategoryBySlug method

    // Tìm kiếm categories theo tên
    public List<CategoryDto> searchCategoriesByName(String name) {
        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Tạo category mới
    public CategoryDto createCategory(CategoryCreateRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setGalleryImages(request.getGalleryImages());
        category.setIsActive(request.getIsActive());

        // Removed slug handling logic

        // Xử lý display_order
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        } else {
            // Tự động đặt thứ tự cuối cùng
            Integer maxOrder = categoryRepository.findMaxDisplayOrder().orElse(0);
            category.setDisplayOrder(maxOrder + 1);
        }

        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    // Cập nhật category
    public CategoryDto updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setGalleryImages(request.getGalleryImages());
        category.setIsActive(request.getIsActive());

        // Removed slug handling logic in update

        // Xử lý display_order
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    // Xóa category
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        
        categoryRepository.delete(category);
    }

    // Sắp xếp lại thứ tự categories
    @Transactional
    public void reorderCategories(CategoryReorderRequest request) {
        for (CategoryReorderRequest.CategoryOrderItem item : request.getCategoryOrders()) {
            Category category = categoryRepository.findById(item.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + item.getId()));
            
            category.setDisplayOrder(item.getDisplayOrder());
            categoryRepository.save(category);
        }
    }

    // Thống kê categories
    public CategoryStatsDto getCategoryStats() {
        long totalCategories = categoryRepository.count();
        long activeCategories = categoryRepository.countByIsActiveTrue();
        long inactiveCategories = categoryRepository.countByIsActive(false);

        CategoryStatsDto stats = new CategoryStatsDto();
        stats.setTotalCategories(totalCategories);
        stats.setActiveCategories(activeCategories);
        stats.setInactiveCategories(inactiveCategories);

        return stats;
    }

    // Chuyển đổi Entity thành DTO
    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        // Removed slug mapping
        dto.setDescription(category.getDescription());
        dto.setDisplayOrder(category.getDisplayOrder());
        dto.setImageUrl(category.getImageUrl());
        dto.setGalleryImages(category.getGalleryImages());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }

    // DTO class cho thống kê
    public static class CategoryStatsDto {
        private long totalCategories;
        private long activeCategories;
        private long inactiveCategories;

        public long getTotalCategories() {
            return totalCategories;
        }

        public void setTotalCategories(long totalCategories) {
            this.totalCategories = totalCategories;
        }

        public long getActiveCategories() {
            return activeCategories;
        }

        public void setActiveCategories(long activeCategories) {
            this.activeCategories = activeCategories;
        }

        public long getInactiveCategories() {
            return inactiveCategories;
        }

        public void setInactiveCategories(long inactiveCategories) {
            this.inactiveCategories = inactiveCategories;
        }
    }
}
