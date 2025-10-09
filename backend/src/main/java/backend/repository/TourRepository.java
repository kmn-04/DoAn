package backend.repository;

import backend.entity.Tour;
import backend.entity.Tour.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    
    /**
     * Find tour by slug
     */
    Optional<Tour> findBySlug(String slug);
    
    /**
     * Find tours by category ID
     */
    List<Tour> findByCategoryIdAndStatusAndDeletedAtIsNull(Long categoryId, TourStatus status);
    
    /**
     * Find active tours only (not deleted)
     */
    @Query("SELECT t FROM Tour t WHERE t.deletedAt IS NULL AND t.status = :status")
    List<Tour> findActiveTours(@Param("status") TourStatus status);
    
    /**
     * Find featured tours
     */
    @Query("SELECT t FROM Tour t WHERE t.isFeatured = true AND t.status = :status AND t.deletedAt IS NULL")
    List<Tour> findFeaturedTours(@Param("status") TourStatus status);
    
    /**
     * Search tours by name or description
     */
    @Query("SELECT t FROM Tour t WHERE " +
           "(LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "t.status = :status AND t.deletedAt IS NULL")
    Page<Tour> searchTours(@Param("keyword") String keyword, 
                          @Param("status") TourStatus status, 
                          Pageable pageable);
    
    /**
     * Find tours by price range
     */
    @Query("SELECT t FROM Tour t WHERE " +
           "((t.salePrice IS NOT NULL AND t.salePrice BETWEEN :minPrice AND :maxPrice) OR " +
           "(t.salePrice IS NULL AND t.price BETWEEN :minPrice AND :maxPrice)) AND " +
           "t.status = :status AND t.deletedAt IS NULL")
    List<Tour> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                               @Param("maxPrice") BigDecimal maxPrice,
                               @Param("status") TourStatus status);
    
    /**
     * Find tours by duration range
     */
    List<Tour> findByDurationBetweenAndStatusAndDeletedAtIsNull(Integer minDuration, 
                                                               Integer maxDuration, 
                                                               TourStatus status);
    
    /**
     * Find tours by category slug
     */
    @Query("SELECT t FROM Tour t JOIN t.category c WHERE " +
           "c.slug = :categorySlug AND t.status = :status AND t.deletedAt IS NULL")
    List<Tour> findByCategorySlug(@Param("categorySlug") String categorySlug, 
                                 @Param("status") TourStatus status);
    
    /**
     * Find top rated tours
     */
    @Query("SELECT t, AVG(r.rating) as avgRating FROM Tour t " +
           "LEFT JOIN t.reviews r " +
           "WHERE t.status = :status AND t.deletedAt IS NULL " +
           "GROUP BY t " +
           "ORDER BY avgRating DESC")
    List<Object[]> findTopRatedTours(@Param("status") TourStatus status, Pageable pageable);
    
    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);
    
    /**
     * Count tours by category
     */
    long countByCategoryIdAndStatusAndDeletedAtIsNull(Long categoryId, TourStatus status);
    
    /**
     * Find tours with target audience
     */
    @Query("SELECT DISTINCT t FROM Tour t JOIN t.targetAudiences ta WHERE " +
           "ta.name = :audienceName AND t.status = :status AND t.deletedAt IS NULL")
    List<Tour> findByTargetAudience(@Param("audienceName") String audienceName, 
                                   @Param("status") TourStatus status);
    
    /**
     * Find tours by tour type
     */
    List<Tour> findByTourTypeAndStatus(Tour.TourType tourType, TourStatus status);
    
    /**
     * Find tours by country
     */
    List<Tour> findByCountryIdAndStatus(Long countryId, TourStatus status);
    
    /**
     * Find international tours by continent
     */
    @Query("SELECT t FROM Tour t JOIN t.country c WHERE " +
           "t.tourType = 'INTERNATIONAL' AND c.continent = :continent AND t.status = :status AND t.deletedAt IS NULL")
    List<Tour> findInternationalToursByContinent(@Param("continent") String continent, 
                                               @Param("status") TourStatus status);
    
    /**
     * Find tours with comprehensive filters (updated with new filter fields)
     */
    @Query("SELECT t FROM Tour t LEFT JOIN t.country c WHERE " +
           "(:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:minPrice IS NULL OR t.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR t.price <= :maxPrice) " +
           "AND (:minDuration IS NULL OR t.duration >= :minDuration) " +
           "AND (:maxDuration IS NULL OR t.duration <= :maxDuration) " +
           "AND (:tourType IS NULL OR t.tourType = :tourType) " +
           "AND (:location IS NULL OR " +
           "    LOWER(t.destination) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "    LOWER(t.departureLocation) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "    LOWER(t.region) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "    LOWER(c.name) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:countryCode IS NULL OR t.countryCode = :countryCode) " +
           "AND (:visaRequired IS NULL OR t.visaRequired = :visaRequired) " +
           "AND (:flightIncluded IS NULL OR t.flightIncluded = :flightIncluded) " +
           "AND t.status = :status AND t.deletedAt IS NULL")
    Page<Tour> findToursWithFilters(
        @Param("keyword") String keyword,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minDuration") Integer minDuration,
        @Param("maxDuration") Integer maxDuration,
        @Param("tourType") Tour.TourType tourType,
        @Param("location") String location,
        @Param("countryCode") String countryCode,
        @Param("visaRequired") Boolean visaRequired,
        @Param("flightIncluded") Boolean flightIncluded,
        @Param("status") Tour.TourStatus status,
        Pageable pageable
    );
    
    /**
     * Find distinct locations from tours
     * For domestic tours, use destination or region
     * For international tours, use country name
     */
    @Query("SELECT DISTINCT " +
           "CASE WHEN t.tourType = 'DOMESTIC' THEN COALESCE(t.destination, t.region, t.departureLocation) " +
           "     WHEN t.tourType = 'INTERNATIONAL' THEN COALESCE(t.country.name, t.destination) " +
           "     ELSE 'Unknown' END " +
           "FROM Tour t LEFT JOIN t.country c " +
           "WHERE t.status = :status AND t.deletedAt IS NULL " +
           "AND (t.destination IS NOT NULL OR t.region IS NOT NULL OR t.country.name IS NOT NULL) " +
           "ORDER BY " +
           "CASE WHEN t.tourType = 'DOMESTIC' THEN COALESCE(t.destination, t.region, t.departureLocation) " +
           "     WHEN t.tourType = 'INTERNATIONAL' THEN COALESCE(t.country.name, t.destination) " +
           "     ELSE 'Unknown' END")
    List<String> findDistinctLocations(@Param("status") TourStatus status);
    
    /**
     * Count bookings by tour ID
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.tour.id = :tourId")
    long countBookingsByTourId(@Param("tourId") Long tourId);
    
    /**
     * Get popular destinations based on booking count
     * Groups by destination and calculates aggregates
     */
    @Query("SELECT " +
           "t.destination, " +
           "COUNT(DISTINCT t), " +
           "AVG(COALESCE(t.salePrice, t.price)), " +
           "t.countryCode, " +
           "COUNT(DISTINCT b) " +
           "FROM Tour t " +
           "LEFT JOIN Booking b ON b.tour.id = t.id " +
           "WHERE t.status = :status AND t.deletedAt IS NULL " +
           "AND t.destination IS NOT NULL " +
           "GROUP BY t.destination, t.countryCode " +
           "HAVING COUNT(DISTINCT t) >= :minTourCount " +
           "ORDER BY COUNT(DISTINCT b) DESC, COUNT(DISTINCT t) DESC")
    List<Object[]> findPopularDestinations(@Param("status") TourStatus status, 
                                          @Param("minTourCount") int minTourCount, 
                                          Pageable pageable);
    
    /**
     * Find tours by destination name for getting average rating and images
     */
    @Query("SELECT t FROM Tour t WHERE " +
           "LOWER(t.destination) = LOWER(:destination) " +
           "AND t.status = :status AND t.deletedAt IS NULL " +
           "ORDER BY t.isFeatured DESC, t.id DESC")
    List<Tour> findByDestination(@Param("destination") String destination, 
                                 @Param("status") TourStatus status);
    
    /**
     * Find trending tours based on recent bookings (last 30 days)
     * Orders by booking count DESC
     */
    @Query("SELECT t, COUNT(DISTINCT b) as bookingCount FROM Tour t " +
           "LEFT JOIN Booking b ON b.tour.id = t.id " +
           "WHERE t.status = :status AND t.deletedAt IS NULL " +
           "AND (b.createdAt IS NULL OR b.createdAt >= :since) " +
           "GROUP BY t " +
           "ORDER BY bookingCount DESC, t.isFeatured DESC, t.id DESC")
    List<Object[]> findTrendingTours(@Param("status") TourStatus status, 
                                    @Param("since") java.time.LocalDateTime since, 
                                    Pageable pageable);
    
    /**
     * Find tours by category IDs (for personalized recommendations)
     */
    @Query("SELECT t FROM Tour t WHERE " +
           "t.category.id IN :categoryIds " +
           "AND t.status = :status AND t.deletedAt IS NULL " +
           "ORDER BY t.isFeatured DESC, t.id DESC")
    List<Tour> findByCategoryIds(@Param("categoryIds") List<Long> categoryIds, 
                                 @Param("status") TourStatus status, 
                                 Pageable pageable);
}
