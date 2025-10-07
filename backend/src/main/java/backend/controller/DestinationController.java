package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.PopularDestinationResponse;
import backend.entity.Country;
import backend.entity.Review;
import backend.entity.Tour;
import backend.repository.CountryRepository;
import backend.repository.ReviewRepository;
import backend.repository.TourRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class DestinationController {

    private final TourRepository tourRepository;
    private final CountryRepository countryRepository;
    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get popular destinations
     * Groups tours by destination and returns aggregated statistics
     */
    @GetMapping("/popular")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<PopularDestinationResponse>>> getPopularDestinations(
            @RequestParam(defaultValue = "8") int limit,
            @RequestParam(defaultValue = "2") int minTourCount) {
        
        try {
            log.info("Fetching popular destinations with limit={}, minTourCount={}", limit, minTourCount);
            
            // Get aggregated destination data
            List<Object[]> results = tourRepository.findPopularDestinations(
                Tour.TourStatus.Active, 
                minTourCount, 
                PageRequest.of(0, limit)
            );
            
            log.info("Found {} destination groups", results.size());
            
            List<PopularDestinationResponse> destinations = new ArrayList<>();
            
            for (Object[] row : results) {
                try {
                    String destination = row[0] != null ? row[0].toString() : "Unknown";
                    Long tourCount = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                    BigDecimal avgPrice = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
                    String countryCode = row[3] != null ? row[3].toString() : null;
                    Long bookingCount = row[4] != null ? ((Number) row[4]).longValue() : 0L;
                    
                    log.debug("Processing destination: {} with {} tours and {} bookings", destination, tourCount, bookingCount);
                
                    // Get tours for this destination to calculate average rating and get image
                    List<Tour> tours = tourRepository.findByDestination(destination, Tour.TourStatus.Active);
                    
                    if (tours.isEmpty()) {
                        log.warn("No tours found for destination: {}", destination);
                        continue;
                    }
                    
                    // Calculate average rating from reviews
                    Double averageRating = calculateAverageRating(tours);
                    
                    // Get representative image (prefer featured tour's image)
                    String image = tours.stream()
                        .filter(t -> t.getIsFeatured() != null && t.getIsFeatured())
                        .findFirst()
                        .map(Tour::getMainImage)
                        .orElseGet(() -> tours.get(0).getMainImage() != null ? tours.get(0).getMainImage() : "/default-destination.jpg");
                    
                    // Get country name
                    String countryName = "Việt Nam"; // Default
                    if (countryCode != null) {
                        Optional<Country> country = countryRepository.findByCode(countryCode);
                        if (country.isPresent()) {
                            countryName = country.get().getName();
                        }
                    }
                    
                    // Get highlights from tours
                    List<String> highlights = extractHighlights(tours);
                    
                    // Create slug
                    String slug = createSlug(destination);
                    
                    PopularDestinationResponse destResponse = PopularDestinationResponse.builder()
                            .name(destination)
                            .country(countryName)
                            .countryCode(countryCode)
                            .slug(slug)
                            .image(image)
                            .tourCount(tourCount.intValue())
                            .averageRating(averageRating)
                            .averagePrice(avgPrice)
                            .climate(null) // Can be populated from tour data if available
                            .highlights(highlights.isEmpty() ? List.of() : highlights.subList(0, Math.min(3, highlights.size())))
                            .build();
                    
                    destinations.add(destResponse);
                    log.debug("Added destination: {} to response", destination);
                    
                } catch (Exception ex) {
                    log.error("Error processing destination row: {}", ex.getMessage(), ex);
                    // Continue with next destination
                }
            }
            
            log.info("Successfully fetched {} popular destinations", destinations.size());
            return ResponseEntity.ok(ApiResponse.success("Popular destinations retrieved successfully", destinations));
            
        } catch (Exception e) {
            log.error("Error fetching popular destinations", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch popular destinations: " + e.getMessage()));
        }
    }
    
    /**
     * Calculate average rating from reviews for given tours
     */
    private Double calculateAverageRating(List<Tour> tours) {
        List<Review> allReviews = new ArrayList<>();
        
        for (Tour tour : tours) {
            List<Review> reviews = reviewRepository.findByTourIdAndStatusOrderByCreatedAtDesc(
                tour.getId(), 
                Review.ReviewStatus.Approved
            );
            allReviews.addAll(reviews);
        }
        
        if (allReviews.isEmpty()) {
            return 4.5; // Default rating
        }
        
        return allReviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(4.5);
    }
    
    /**
     * Extract highlights from tours' highlights JSON field
     */
    private List<String> extractHighlights(List<Tour> tours) {
        List<String> allHighlights = new ArrayList<>();
        
        for (Tour tour : tours) {
            if (tour.getHighlights() != null && !tour.getHighlights().isEmpty()) {
                try {
                    List<String> tourHighlights = objectMapper.readValue(
                        tour.getHighlights(), 
                        new TypeReference<List<String>>() {}
                    );
                    allHighlights.addAll(tourHighlights);
                } catch (Exception e) {
                    log.warn("Failed to parse highlights for tour {}", tour.getId());
                }
            }
        }
        
        // Return unique highlights (limit to avoid too many)
        return allHighlights.stream()
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }
    
    /**
     * Create URL-friendly slug from destination name
     */
    private String createSlug(String name) {
        return name.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}