package backend.repository;

import backend.entity.Review;
import backend.entity.Review.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    /**
     * Find reviews by tour ID
     */
    List<Review> findByTourIdOrderByCreatedAtDesc(Long tourId);
    
    /**
     * Find reviews by user ID
     */
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find reviews by user ID with pagination
     */
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * Find reviews by status
     */
    List<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status);
    
    /**
     * Find approved reviews for tour
     */
    List<Review> findByTourIdAndStatusOrderByCreatedAtDesc(Long tourId, ReviewStatus status);
    
    /**
     * Find approved reviews for tour with pagination
     */
    Page<Review> findByTourIdAndStatusOrderByCreatedAtDesc(Long tourId, ReviewStatus status, Pageable pageable);
    
    /**
     * Find reviews by rating
     */
    List<Review> findByRatingOrderByCreatedAtDesc(Integer rating);
    
    /**
     * Find reviews by tour and rating range
     */
    List<Review> findByTourIdAndRatingBetweenAndStatusOrderByCreatedAtDesc(
            Long tourId, Integer minRating, Integer maxRating, ReviewStatus status);
    
    /**
     * Calculate average rating for tour
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tour.id = :tourId AND r.status = :status")
    Double calculateAverageRatingByTour(@Param("tourId") Long tourId, @Param("status") ReviewStatus status);
    
    /**
     * Count reviews by tour and status
     */
    long countByTourIdAndStatus(Long tourId, ReviewStatus status);
    
    /**
     * Count reviews by rating for tour
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.tour.id = :tourId AND r.status = :status GROUP BY r.rating")
    List<Object[]> countReviewsByRatingForTour(@Param("tourId") Long tourId, @Param("status") ReviewStatus status);
    
    /**
     * Find review by booking ID
     */
    Review findByBookingId(Long bookingId);
    
    /**
     * Check if user has reviewed this tour
     */
    boolean existsByUserIdAndTourId(Long userId, Long tourId);
    
    /**
     * Search reviews by comment content
     */
    @Query("SELECT r FROM Review r WHERE " +
           "LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
           "r.status = :status")
    Page<Review> searchReviewsByComment(@Param("keyword") String keyword, 
                                       @Param("status") ReviewStatus status, 
                                       Pageable pageable);
    
    /**
     * Find recent reviews
     */
    @Query("SELECT r FROM Review r WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews(@Param("status") ReviewStatus status, Pageable pageable);
    
    /**
     * Find reviews with user and tour details
     */
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.tour WHERE r.id = :reviewId")
    Review findByIdWithDetails(@Param("reviewId") Long reviewId);
    
    /**
     * Find reviews by status with pagination (Admin)
     */
    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);
    
    /**
     * Count reviews by status
     */
    long countByStatus(ReviewStatus status);
}
