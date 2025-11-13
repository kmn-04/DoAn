package backend.repository;

import backend.entity.Category;
import backend.entity.Category.CategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find category by slug
     */
    Optional<Category> findBySlug(String slug);
    
    /**
     * Find categories by status
     */
    List<Category> findByStatus(CategoryStatus status);
    
    /**
     * Find active categories only
     */
    List<Category> findByStatusOrderByNameAsc(CategoryStatus status);
    
    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);
    
    /**
     * Search categories by name (case insensitive)
     */
    @Query("SELECT c FROM Category c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
           "c.status = :status")
    Page<Category> searchByName(@Param("keyword") String keyword, 
                                @Param("status") CategoryStatus status, 
                                Pageable pageable);
    
    /**
     * Find categories with tours count
     */
    @Query("SELECT c, COUNT(t) FROM Category c LEFT JOIN c.tours t " +
           "WHERE c.status = :status GROUP BY c ORDER BY c.name")
    List<Object[]> findCategoriesWithTourCount(@Param("status") CategoryStatus status);
    
    /**
     * Count categories by status
     */
    long countByStatus(CategoryStatus status);
    
    /**
     * Find all categories with tours eagerly fetched to avoid LazyInitializationException
     */
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.tours")
    List<Category> findAllWithTours();
}
