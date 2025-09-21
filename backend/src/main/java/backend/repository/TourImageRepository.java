package backend.repository;

import backend.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourImageRepository extends JpaRepository<TourImage, Long> {
    
    /**
     * Find images by tour ID
     */
    List<TourImage> findByTourId(Long tourId);
    
    /**
     * Count images by tour
     */
    long countByTourId(Long tourId);
    
    /**
     * Delete all images by tour ID
     */
    void deleteByTourId(Long tourId);
    
    /**
     * Find image by URL
     */
    TourImage findByImageUrl(String imageUrl);
    
    /**
     * Check if image URL exists for tour
     */
    boolean existsByTourIdAndImageUrl(Long tourId, String imageUrl);
}
