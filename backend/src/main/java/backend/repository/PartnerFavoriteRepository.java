package backend.repository;

import backend.entity.PartnerFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerFavoriteRepository extends JpaRepository<PartnerFavorite, Long> {
    
    /**
     * Find favorite by user ID and partner ID
     */
    Optional<PartnerFavorite> findByUserIdAndPartnerId(Long userId, Long partnerId);
    
    /**
     * Check if partner is favorited by user
     */
    boolean existsByUserIdAndPartnerId(Long userId, Long partnerId);
    
    /**
     * Find all favorites by user ID
     */
    @Query("SELECT pf FROM PartnerFavorite pf WHERE pf.user.id = :userId ORDER BY pf.createdAt DESC")
    List<PartnerFavorite> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find all partner IDs favorited by user
     */
    @Query("SELECT pf.partner.id FROM PartnerFavorite pf WHERE pf.user.id = :userId")
    List<Long> findPartnerIdsByUserId(@Param("userId") Long userId);
    
    /**
     * Count favorites by partner ID
     */
    @Query("SELECT COUNT(pf) FROM PartnerFavorite pf WHERE pf.partner.id = :partnerId")
    Long countByPartnerId(@Param("partnerId") Long partnerId);
    
    /**
     * Count favorites by user ID
     */
    @Query("SELECT COUNT(pf) FROM PartnerFavorite pf WHERE pf.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    /**
     * Delete favorite by user ID and partner ID
     */
    void deleteByUserIdAndPartnerId(Long userId, Long partnerId);
}

