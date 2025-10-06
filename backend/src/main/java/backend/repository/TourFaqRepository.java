package backend.repository;

import backend.entity.TourFaq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourFaqRepository extends JpaRepository<TourFaq, Long> {
    
    // Find all FAQs for a tour ordered by display order
    List<TourFaq> findByTourIdOrderByDisplayOrderAsc(Long tourId);
    
    // Count FAQs for a tour
    Long countByTourId(Long tourId);
    
    // Find FAQs by question keyword
    @Query("SELECT f FROM TourFaq f WHERE f.tour.id = :tourId " +
           "AND LOWER(f.question) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY f.displayOrder ASC")
    List<TourFaq> searchFaqsByTourIdAndKeyword(
        @Param("tourId") Long tourId,
        @Param("keyword") String keyword
    );
    
    // Delete all FAQs for a tour
    @org.springframework.data.jpa.repository.Modifying
    void deleteByTourId(Long tourId);
}
