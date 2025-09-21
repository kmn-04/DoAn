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

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    
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
}
