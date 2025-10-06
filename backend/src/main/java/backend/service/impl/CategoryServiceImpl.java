package backend.service.impl;

import backend.entity.Category;
import backend.entity.Category.CategoryStatus;
import backend.repository.CategoryRepository;
import backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    @Override
    public Category createCategory(Category category) {
        log.info("Creating new category: {}", category.getName());
        
        // Generate unique slug if not provided
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(generateUniqueSlug(category.getName()));
        }
        
        // Check if slug already exists
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new RuntimeException("Slug already exists: " + category.getSlug());
        }
        
        // Set default status
        if (category.getStatus() == null) {
            category.setStatus(CategoryStatus.Active);
        }
        
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());
        return savedCategory;
    }
    
    @Override
    public Category updateCategory(Long categoryId, Category category) {
        log.info("Updating category with ID: {}", categoryId);
        
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        
        // Update fields
        if (category.getName() != null) {
            existingCategory.setName(category.getName());
        }
        if (category.getDescription() != null) {
            existingCategory.setDescription(category.getDescription());
        }
        if (category.getImageUrl() != null) {
            existingCategory.setImageUrl(category.getImageUrl());
        }
        if (category.getIcon() != null) {
            existingCategory.setIcon(category.getIcon());
        }
        if (category.getSlug() != null) {
            existingCategory.setSlug(category.getSlug());
        }
        if (category.getParentId() != null) {
            existingCategory.setParentId(category.getParentId());
        }
        if (category.getDisplayOrder() != null) {
            existingCategory.setDisplayOrder(category.getDisplayOrder());
        }
        if (category.getStatus() != null) {
            existingCategory.setStatus(category.getStatus());
        }
        // Always update isFeatured (even if false)
        existingCategory.setIsFeatured(category.getIsFeatured());
        
        Category updatedCategory = categoryRepository.save(existingCategory);
        log.info("Category updated successfully with ID: {}", updatedCategory.getId());
        return updatedCategory;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Category> getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Category> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Category> getActiveCategories() {
        return categoryRepository.findByStatusOrderByNameAsc(CategoryStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Category> searchCategories(String keyword, Pageable pageable) {
        return categoryRepository.searchByName(keyword, CategoryStatus.Active, pageable);
    }
    
    @Override
    public Category changeCategoryStatus(Long categoryId, CategoryStatus status) {
        log.info("Changing status of category {} to: {}", categoryId, status);
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        
        category.setStatus(status);
        Category updatedCategory = categoryRepository.save(category);
        
        log.info("Category status changed successfully for ID: {}", categoryId);
        return updatedCategory;
    }
    
    @Override
    public void deleteCategory(Long categoryId) {
        log.info("Deleting category with ID: {}", categoryId);
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        
        // Check if category has tours
        if (category.getTours() != null && !category.getTours().isEmpty()) {
            throw new RuntimeException("Cannot delete category with existing tours");
        }
        
        categoryRepository.delete(category);
        log.info("Category deleted successfully with ID: {}", categoryId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean slugExists(String slug) {
        return categoryRepository.existsBySlug(slug);
    }
    
    @Override
    public String generateUniqueSlug(String name) {
        String baseSlug = createSlugFromName(name);
        String slug = baseSlug;
        int counter = 1;
        
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        
        return slug;
    }
    
    private String createSlugFromName(String name) {
        // Remove accents and convert to lowercase
        String slug = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        slug = pattern.matcher(slug).replaceAll("");
        
        // Replace spaces and special characters with hyphens
        slug = slug.toLowerCase()
                   .replaceAll("[^a-z0-9]+", "-")
                   .replaceAll("^-|-$", "");
        
        return slug;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryWithTourCount> getCategoriesWithTourCount() {
        List<Object[]> results = categoryRepository.findCategoriesWithTourCount(CategoryStatus.Active);
        
        return results.stream()
                .map(result -> new CategoryWithTourCount(
                        (Category) result[0],
                        ((Number) result[1]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
