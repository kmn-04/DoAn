package backend.repository;

import backend.entity.Wishlist;
import backend.entity.User;
import backend.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    /**
     * Find all wishlist items by user
     */
    @Query("SELECT w FROM Wishlist w JOIN FETCH w.tour t LEFT JOIN FETCH t.category LEFT JOIN FETCH t.country WHERE w.user.id = :userId ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserIdWithTourDetails(@Param("userId") Long userId);
    
    /**
     * Find all wishlist items by user (simple)
     */
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find wishlist item by user and tour
     */
    Optional<Wishlist> findByUserIdAndTourId(Long userId, Long tourId);
    
    /**
     * Check if tour is in user's wishlist
     */
    boolean existsByUserIdAndTourId(Long userId, Long tourId);
    
    /**
     * Delete wishlist item by user and tour
     */
    void deleteByUserIdAndTourId(Long userId, Long tourId);
    
    /**
     * Count wishlist items by user
     */
    long countByUserId(Long userId);
    
    /**
     * Get most wishlisted tours
     */
    @Query("SELECT w.tour.id, COUNT(w) as wishlistCount FROM Wishlist w GROUP BY w.tour.id ORDER BY wishlistCount DESC")
    List<Object[]> findMostWishlistedTours();
    
    /**
     * Find all users who wishlisted a specific tour
     */
    List<Wishlist> findByTourId(Long tourId);
}
