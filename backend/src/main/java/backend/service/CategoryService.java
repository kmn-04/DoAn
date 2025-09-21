package backend.service;

import backend.entity.Category;
import backend.entity.Category.CategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    
    /**
     * Create new category
     */
    Category createCategory(Category category);
    
    /**
     * Update category
     */
    Category updateCategory(Long categoryId, Category category);
    
    /**
     * Get category by ID
     */
    Optional<Category> getCategoryById(Long categoryId);
    
    /**
     * Get category by slug
     */
    Optional<Category> getCategoryBySlug(String slug);
    
    /**
     * Get all categories
     */
    List<Category> getAllCategories();
    
    /**
     * Get active categories
     */
    List<Category> getActiveCategories();
    
    /**
     * Search categories
     */
    Page<Category> searchCategories(String keyword, Pageable pageable);
    
    /**
     * Change category status
     */
    Category changeCategoryStatus(Long categoryId, CategoryStatus status);
    
    /**
     * Delete category
     */
    void deleteCategory(Long categoryId);
    
    /**
     * Check if slug exists
     */
    boolean slugExists(String slug);
    
    /**
     * Generate unique slug
     */
    String generateUniqueSlug(String name);
    
    /**
     * Get categories with tour count
     */
    List<CategoryWithTourCount> getCategoriesWithTourCount();
    
    /**
     * Inner class for category with tour count
     */
    class CategoryWithTourCount {
        private Category category;
        private long tourCount;
        
        public CategoryWithTourCount(Category category, long tourCount) {
            this.category = category;
            this.tourCount = tourCount;
        }
        
        public Category getCategory() { return category; }
        public long getTourCount() { return tourCount; }
    }
}
