package backend.repository;

import backend.entity.PartnerImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartnerImageRepository extends JpaRepository<PartnerImage, Long> {
    
    /**
     * Find images by partner ID ordered by display order
     */
    List<PartnerImage> findByPartnerIdOrderByDisplayOrderAsc(Long partnerId);
    
    /**
     * Find images by partner ID and type
     */
    List<PartnerImage> findByPartnerIdAndImageTypeOrderByDisplayOrderAsc(Long partnerId, String imageType);
    
    /**
     * Find gallery images for partner (excluding cover and logo)
     */
    @Query("SELECT pi FROM PartnerImage pi WHERE pi.partner.id = :partnerId AND pi.imageType = 'gallery' ORDER BY pi.displayOrder ASC")
    List<PartnerImage> findGalleryImagesByPartnerId(@Param("partnerId") Long partnerId);
    
    /**
     * Find cover image for partner
     */
    @Query("SELECT pi FROM PartnerImage pi WHERE pi.partner.id = :partnerId AND pi.imageType = 'cover' ORDER BY pi.displayOrder ASC")
    List<PartnerImage> findCoverImagesByPartnerId(@Param("partnerId") Long partnerId);
    
    /**
     * Find logo image for partner
     */
    @Query("SELECT pi FROM PartnerImage pi WHERE pi.partner.id = :partnerId AND pi.imageType = 'logo' ORDER BY pi.displayOrder ASC")
    List<PartnerImage> findLogoImagesByPartnerId(@Param("partnerId") Long partnerId);
    
    /**
     * Count images by partner
     */
    long countByPartnerId(Long partnerId);
    
    /**
     * Count images by partner and type
     */
    long countByPartnerIdAndImageType(Long partnerId, String imageType);
    
    /**
     * Delete all images by partner ID
     */
    void deleteByPartnerId(Long partnerId);
    
    /**
     * Find image by URL
     */
    PartnerImage findByImageUrl(String imageUrl);
    
    /**
     * Check if image URL exists for partner
     */
    boolean existsByPartnerIdAndImageUrl(Long partnerId, String imageUrl);
    
    /**
     * Get max display order for partner
     */
    @Query("SELECT COALESCE(MAX(pi.displayOrder), 0) FROM PartnerImage pi WHERE pi.partner.id = :partnerId")
    Integer getMaxDisplayOrderByPartnerId(@Param("partnerId") Long partnerId);
}
