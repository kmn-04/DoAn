package backend.repository;

import backend.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    /**
     * Find all active banners ordered by display order
     */
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    /**
     * Find active banners within date range
     */
    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "ORDER BY b.displayOrder ASC")
    List<Banner> findActiveBannersInDateRange(@Param("now") LocalDateTime now);
    
    /**
     * Find all banners ordered by display order
     */
    List<Banner> findAllByOrderByDisplayOrderAsc();
}

