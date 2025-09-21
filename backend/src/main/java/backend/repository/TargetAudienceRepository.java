package backend.repository;

import backend.entity.TargetAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TargetAudienceRepository extends JpaRepository<TargetAudience, Long> {
    
    /**
     * Find target audience by name
     */
    Optional<TargetAudience> findByName(String name);
    
    /**
     * Find all target audiences ordered by name
     */
    List<TargetAudience> findAllByOrderByNameAsc();
    
    /**
     * Check if name exists
     */
    boolean existsByName(String name);
    
    /**
     * Search target audiences by name
     */
    @Query("SELECT ta FROM TargetAudience ta WHERE LOWER(ta.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<TargetAudience> searchByName(@Param("keyword") String keyword);
    
    /**
     * Find target audiences with tour count
     */
    @Query("SELECT ta, COUNT(t) FROM TargetAudience ta LEFT JOIN ta.tours t GROUP BY ta ORDER BY ta.name")
    List<Object[]> findTargetAudiencesWithTourCount();
}
