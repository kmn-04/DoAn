package backend.repository;

import backend.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    // Find all wishlists for a user
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find wishlists for a user with pagination
    Page<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Check if a tour is in user's wishlist
    boolean existsByUserIdAndTourId(Long userId, Long tourId);
    
    // Find wishlist by user and tour
    Optional<Wishlist> findByUserIdAndTourId(Long userId, Long tourId);
    
    // Count wishlists for a user
    Long countByUserId(Long userId);
    
    // Count wishlists for a tour
    Long countByTourId(Long tourId);
    
    // Find all wishlists with tour details
    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.tour t " +
           "WHERE w.user.id = :userId " +
           "AND t.status = 'Active' " +
           "AND t.deletedAt IS NULL " +
           "ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserIdWithActiveTours(@Param("userId") Long userId);
    
    // Delete wishlist by user and tour
    void deleteByUserIdAndTourId(Long userId, Long tourId);
}