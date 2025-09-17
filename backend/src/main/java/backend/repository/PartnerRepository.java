package backend.repository;

import backend.model.Partner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    
    // Find by type
    List<Partner> findByType(Partner.PartnerType type);
    
    Page<Partner> findByType(Partner.PartnerType type, Pageable pageable);
    
    // Find by active status
    List<Partner> findByIsActive(Boolean isActive);
    
    Page<Partner> findByIsActive(Boolean isActive, Pageable pageable);
    
    // Find by type and active status
    List<Partner> findByTypeAndIsActive(Partner.PartnerType type, Boolean isActive);
    
    Page<Partner> findByTypeAndIsActive(Partner.PartnerType type, Boolean isActive, Pageable pageable);
    
    // Search by name
    Page<Partner> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Search by name and type
    Page<Partner> findByNameContainingIgnoreCaseAndType(String name, Partner.PartnerType type, Pageable pageable);
    
    // Search by name and active status
    Page<Partner> findByNameContainingIgnoreCaseAndIsActive(String name, Boolean isActive, Pageable pageable);
    
    // Search by name, type and active status
    Page<Partner> findByNameContainingIgnoreCaseAndTypeAndIsActive(
        String name, Partner.PartnerType type, Boolean isActive, Pageable pageable);
    
    // Find by rating range
    List<Partner> findByRatingGreaterThanEqual(Integer minRating);
    
    Page<Partner> findByRatingGreaterThanEqual(Integer minRating, Pageable pageable);
    
    // Find by price range
    List<Partner> findByPriceRange(Partner.PriceRange priceRange);
    
    Page<Partner> findByPriceRange(Partner.PriceRange priceRange, Pageable pageable);
    
    // Complex search query with all filters
    @Query("SELECT p FROM Partner p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive) AND " +
           "(:minRating IS NULL OR p.rating >= :minRating) AND " +
           "(:priceRange IS NULL OR p.priceRange = :priceRange) AND " +
           "(:fromDate IS NULL OR p.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR p.createdAt <= :toDate)")
    Page<Partner> findPartnersWithFilters(
        @Param("search") String search,
        @Param("type") Partner.PartnerType type,
        @Param("isActive") Boolean isActive,
        @Param("minRating") Integer minRating,
        @Param("priceRange") Partner.PriceRange priceRange,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable);
    
    // Count methods for statistics
    long countByIsActive(Boolean isActive);
    
    long countByType(Partner.PartnerType type);
    
    long countByTypeAndIsActive(Partner.PartnerType type, Boolean isActive);
    
    long countByRatingGreaterThanEqual(Integer minRating);
    
    long countByPriceRange(Partner.PriceRange priceRange);
    
    // Check if partner name exists (for validation)
    boolean existsByNameIgnoreCase(String name);
    
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
