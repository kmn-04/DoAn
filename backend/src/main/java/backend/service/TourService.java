package backend.service;

import backend.entity.Tour;
import backend.entity.Tour.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TourService {
    
    /**
     * Create new tour
     */
    Tour createTour(Tour tour);
    
    /**
     * Update tour
     */
    Tour updateTour(Long tourId, Tour tour);
    
    /**
     * Get tour by ID
     */
    Optional<Tour> getTourById(Long tourId);
    
    /**
     * Get tour by slug
     */
    Optional<Tour> getTourBySlug(String slug);
    
    /**
     * Get all active tours
     */
    List<Tour> getAllActiveTours();
    
    /**
     * Get tours with pagination
     */
    Page<Tour> getAllTours(Pageable pageable);
    
    /**
     * Search tours
     */
    Page<Tour> searchTours(String keyword, Pageable pageable);
    
    /**
     * Search tours with all filters (updated for new filter fields)
     * Note: continent and minRating removed (location now searches across destination, region, country)
     */
    Page<Tour> searchToursWithFilters(
        String keyword,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer minDuration,
        Integer maxDuration,
        Tour.TourType tourType,
        String location,
        String countryCode,
        String continent,  // DEPRECATED - will be removed
        BigDecimal minRating,  // DEPRECATED - will be removed
        Boolean visaRequired,
        Boolean flightIncluded,
        Pageable pageable
    );
    
    /**
     * Get tours by category
     */
    List<Tour> getToursByCategory(Long categoryId);
    
    /**
     * Get tours by category slug
     */
    List<Tour> getToursByCategorySlug(String categorySlug);
    
    /**
     * Get tours by type
     */
    List<Tour> getToursByType(Tour.TourType tourType);
    
    /**
     * Get tours by country
     */
    List<Tour> getToursByCountry(Long countryId);
    
    /**
     * Get international tours by continent
     */
    List<Tour> getInternationalToursByContinent(String continent);
    
    /**
     * Get featured tours
     */
    List<Tour> getFeaturedTours();
    
    /**
     * Get tours by price range
     */
    List<Tour> getToursByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);
    
    /**
     * Get tours by duration range
     */
    List<Tour> getToursByDurationRange(Integer minDuration, Integer maxDuration);
    
    /**
     * Get tours by target audience
     */
    List<Tour> getToursByTargetAudience(String audienceName);
    
    /**
     * Get top rated tours
     */
    List<Tour> getTopRatedTours(int limit);
    
    /**
     * Set tour as featured
     */
    Tour setFeaturedTour(Long tourId, boolean featured);
    
    /**
     * Change tour status
     */
    Tour changeTourStatus(Long tourId, TourStatus status);
    
    /**
     * Soft delete tour
     */
    void deleteTour(Long tourId);
    
    /**
     * Check if slug exists
     */
    boolean slugExists(String slug);
    
    /**
     * Generate unique slug
     */
    String generateUniqueSlug(String name);
    
    /**
     * Get tour statistics
     */
    TourStatistics getTourStatistics();
    
    /**
     * Get unique locations from tours
     */
    List<String> getUniqueLocations();
    
    /**
     * Inner class for tour statistics
     */
    class TourStatistics {
        private long totalTours;
        private long activeTours;
        private long featuredTours;
        private long toursThisMonth;
        private BigDecimal averagePrice;
        private double averageRating;
        
        public TourStatistics(long totalTours, long activeTours, long featuredTours,
                            long toursThisMonth, BigDecimal averagePrice, double averageRating) {
            this.totalTours = totalTours;
            this.activeTours = activeTours;
            this.featuredTours = featuredTours;
            this.toursThisMonth = toursThisMonth;
            this.averagePrice = averagePrice;
            this.averageRating = averageRating;
        }
        
        // Getters
        public long getTotalTours() { return totalTours; }
        public long getActiveTours() { return activeTours; }
        public long getFeaturedTours() { return featuredTours; }
        public long getToursThisMonth() { return toursThisMonth; }
        public BigDecimal getAveragePrice() { return averagePrice; }
        public double getAverageRating() { return averageRating; }
    }
}
