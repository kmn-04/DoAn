package backend.service.impl;

import backend.entity.Tour;
import backend.entity.Tour.TourStatus;
import backend.repository.TourRepository;
import backend.repository.ReviewRepository;
import backend.service.TourService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TourServiceImpl implements TourService {
    
    private final TourRepository tourRepository;
    private final ReviewRepository reviewRepository;
    
    @Override
    public Tour createTour(Tour tour) {
        log.info("Creating new tour: {}", tour.getName());
        
        // Generate unique slug if not provided
        if (tour.getSlug() == null || tour.getSlug().isEmpty()) {
            tour.setSlug(generateUniqueSlug(tour.getName()));
        }
        
        // Check if slug already exists
        if (tourRepository.existsBySlug(tour.getSlug())) {
            throw new RuntimeException("Slug already exists: " + tour.getSlug());
        }
        
        // Set default status
        if (tour.getStatus() == null) {
            tour.setStatus(TourStatus.Active);
        }
        
        // Set default featured
        if (tour.getIsFeatured() == null) {
            tour.setIsFeatured(false);
        }
        
        Tour savedTour = tourRepository.save(tour);
        log.info("Tour created successfully with ID: {}", savedTour.getId());
        return savedTour;
    }
    
    @Override
    public Tour updateTour(Long tourId, Tour tour) {
        log.info("Updating tour with ID: {}", tourId);
        
        Tour existingTour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        // Update fields
        if (tour.getName() != null) {
            existingTour.setName(tour.getName());
        }
        if (tour.getShortDescription() != null) {
            existingTour.setShortDescription(tour.getShortDescription());
        }
        if (tour.getDescription() != null) {
            existingTour.setDescription(tour.getDescription());
        }
        if (tour.getPrice() != null) {
            existingTour.setPrice(tour.getPrice());
        }
        if (tour.getSalePrice() != null) {
            existingTour.setSalePrice(tour.getSalePrice());
        }
        if (tour.getDuration() != null) {
            existingTour.setDuration(tour.getDuration());
        }
        if (tour.getMaxPeople() != null) {
            existingTour.setMaxPeople(tour.getMaxPeople());
        }
        if (tour.getCategory() != null) {
            existingTour.setCategory(tour.getCategory());
        }
        
        Tour updatedTour = tourRepository.save(existingTour);
        log.info("Tour updated successfully with ID: {}", updatedTour.getId());
        return updatedTour;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Tour> getTourById(Long tourId) {
        return tourRepository.findById(tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Tour> getTourBySlug(String slug) {
        return tourRepository.findBySlug(slug);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getAllActiveTours() {
        return tourRepository.findActiveTours(TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Tour> getAllTours(Pageable pageable) {
        return tourRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Tour> searchTours(String keyword, Pageable pageable) {
        return tourRepository.searchTours(keyword, TourStatus.Active, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByCategory(Long categoryId) {
        return tourRepository.findByCategoryIdAndStatusAndDeletedAtIsNull(categoryId, TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByCategorySlug(String categorySlug) {
        return tourRepository.findByCategorySlug(categorySlug, TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getFeaturedTours() {
        return tourRepository.findFeaturedTours(TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return tourRepository.findByPriceRange(minPrice, maxPrice, TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByDurationRange(Integer minDuration, Integer maxDuration) {
        return tourRepository.findByDurationBetweenAndStatusAndDeletedAtIsNull(minDuration, maxDuration, TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByTargetAudience(String audienceName) {
        return tourRepository.findByTargetAudience(audienceName, TourStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Tour> getTopRatedTours(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit);
        return tourRepository.findTopRatedTours(TourStatus.Active, pageRequest)
                .stream()
                .map(objects -> (Tour) objects[0])
                .toList();
    }
    
    @Override
    public Tour setFeaturedTour(Long tourId, boolean featured) {
        log.info("Setting tour {} as featured: {}", tourId, featured);
        
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        tour.setIsFeatured(featured);
        Tour updatedTour = tourRepository.save(tour);
        
        log.info("Tour featured status updated successfully for ID: {}", tourId);
        return updatedTour;
    }
    
    @Override
    public Tour changeTourStatus(Long tourId, TourStatus status) {
        log.info("Changing status of tour {} to: {}", tourId, status);
        
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        tour.setStatus(status);
        Tour updatedTour = tourRepository.save(tour);
        
        log.info("Tour status changed successfully for ID: {}", tourId);
        return updatedTour;
    }
    
    @Override
    public void deleteTour(Long tourId) {
        log.info("Soft deleting tour with ID: {}", tourId);
        
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        tour.softDelete();
        tourRepository.save(tour);
        
        log.info("Tour soft deleted successfully with ID: {}", tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean slugExists(String slug) {
        return tourRepository.existsBySlug(slug);
    }
    
    @Override
    public String generateUniqueSlug(String name) {
        String baseSlug = createSlugFromName(name);
        String slug = baseSlug;
        int counter = 1;
        
        while (tourRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        
        return slug;
    }
    
    private String createSlugFromName(String name) {
        // Remove accents and convert to lowercase
        String slug = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        slug = pattern.matcher(slug).replaceAll("");
        
        // Replace spaces and special characters with hyphens
        slug = slug.toLowerCase()
                   .replaceAll("[^a-z0-9]+", "-")
                   .replaceAll("^-|-$", "");
        
        return slug;
    }
    
    @Override
    @Transactional(readOnly = true)
    public TourStatistics getTourStatistics() {
        long totalTours = tourRepository.count();
        long activeTours = tourRepository.findActiveTours(TourStatus.Active).size();
        long featuredTours = tourRepository.findFeaturedTours(TourStatus.Active).size();
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long toursThisMonth = tourRepository.findAll().stream()
                .filter(tour -> tour.getCreatedAt().isAfter(startOfMonth))
                .count();
        
        // Calculate average price
        List<Tour> tours = tourRepository.findActiveTours(TourStatus.Active);
        BigDecimal averagePrice = tours.stream()
                .map(Tour::getEffectivePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(tours.size(), 1)), 2, RoundingMode.HALF_UP);
        
        // Calculate average rating (simplified)
        double averageRating = 4.5; // TODO: Implement actual calculation
        
        return new TourStatistics(totalTours, activeTours, featuredTours, toursThisMonth, averagePrice, averageRating);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Tour> searchToursWithFilters(
            String keyword,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer duration,
            Tour.TourType tourType,
            Long countryId,
            String continent,
            Boolean visaRequired,
            Boolean flightIncluded,
            Pageable pageable) {
        
        log.info("Searching tours with filters: keyword={}, categoryId={}, tourType={}, countryId={}, continent={}",
                keyword, categoryId, tourType, countryId, continent);
        
        // Use repository method with specifications or custom query
        return tourRepository.findToursWithFilters(
            keyword, categoryId, minPrice, maxPrice, duration,
            tourType, countryId, continent, visaRequired, flightIncluded,
            pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByType(Tour.TourType tourType) {
        log.info("Getting tours by type: {}", tourType);
        return tourRepository.findByTourTypeAndStatus(tourType, TourStatus.Active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tour> getToursByCountry(Long countryId) {
        log.info("Getting tours by country: {}", countryId);
        return tourRepository.findByCountryIdAndStatus(countryId, TourStatus.Active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tour> getInternationalToursByContinent(String continent) {
        log.info("Getting international tours by continent: {}", continent);
        return tourRepository.findInternationalToursByContinent(continent, TourStatus.Active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getUniqueLocations() {
        log.info("Getting unique locations from tours");
        return tourRepository.findDistinctLocations(TourStatus.Active);
    }
}
