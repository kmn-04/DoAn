package backend.repository;

import backend.model.Tour;
import backend.model.Tour.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    
    // Find by status
    Page<Tour> findByStatus(TourStatus status, Pageable pageable);
    
    // Find featured tours
    Page<Tour> findByIsFeaturedTrue(Pageable pageable);
    
    // Find by category
    Page<Tour> findByCategoryId(Long categoryId, Pageable pageable);
    
    // Search by title containing keyword
    Page<Tour> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    
    // Complex search query
    @Query("SELECT t FROM Tour t WHERE " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR t.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR t.price <= :maxPrice) AND " +
           "(:isFeatured IS NULL OR t.isFeatured = :isFeatured)")
    Page<Tour> searchTours(
        @Param("keyword") String keyword,
        @Param("status") TourStatus status,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("isFeatured") Boolean isFeatured,
        Pageable pageable
    );
    
    // Get all active tours
    @Query("SELECT t FROM Tour t WHERE t.status = 'ACTIVE' ORDER BY t.isFeatured DESC, t.createdAt DESC")
    List<Tour> findAllActiveTours();
    
    // Get featured tours
    @Query("SELECT t FROM Tour t WHERE t.status = 'ACTIVE' AND t.isFeatured = true ORDER BY t.createdAt DESC")
    List<Tour> findFeaturedTours();
    
    // Count tours by status
    long countByStatus(TourStatus status);
    
    // Count featured tours
    long countByIsFeaturedTrue();
    
    // Count tours by category
    long countByCategoryId(Long categoryId);
}
