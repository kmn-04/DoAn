package backend.repository;

import backend.entity.Partner;
import backend.entity.Partner.PartnerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    
    /**
     * Find partner by slug
     */
    Optional<Partner> findBySlug(String slug);
    
    /**
     * Find partners by status
     */
    List<Partner> findByStatusOrderByNameAsc(Partner.PartnerStatus status);
    
    /**
     * Find partners by type
     */
    List<Partner> findByTypeOrderByNameAsc(PartnerType type);
    
    /**
     * Find partner by phone
     */
    Partner findByPhone(String phone);
    
    /**
     * Search partners by name
     */
    @Query("SELECT p FROM Partner p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Partner> searchByName(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find partners by address containing keyword
     */
    @Query("SELECT p FROM Partner p WHERE LOWER(p.address) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Partner> findByAddressContaining(@Param("location") String location);
    
    /**
     * Count partners by type
     */
    long countByType(PartnerType type);
    
    /**
     * Find partners with tour itineraries count
     */
    @Query("SELECT p, COUNT(ti) FROM Partner p LEFT JOIN p.tourItineraries ti GROUP BY p ORDER BY p.name")
    List<Object[]> findPartnersWithItineraryCount();
    
    /**
     * Find partners with multiple filters
     */
    @Query("SELECT p FROM Partner p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:type IS NULL OR p.type = :type) " +
           "AND (:location IS NULL OR LOWER(p.address) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:minRating IS NULL OR p.rating >= :minRating) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Partner> findPartnersWithFilters(
        @Param("keyword") String keyword,
        @Param("type") Partner.PartnerType type,
        @Param("location") String location,
        @Param("minRating") Double minRating,
        @Param("status") Partner.PartnerStatus status,
        Pageable pageable
    );
}
