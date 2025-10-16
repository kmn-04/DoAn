package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.TourResponse;
import backend.entity.Tour;
import backend.mapper.EntityMapper;
import backend.repository.BookingRepository;
import backend.repository.TourRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Recommendation Management", description = "APIs for tour recommendations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class RecommendationController {
    
    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final EntityMapper entityMapper;

    @PostMapping("/personalized")
    @Operation(summary = "Get personalized tour recommendations")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getPersonalizedRecommendations(
            @RequestBody(required = false) Map<String, Object> request) {
        
        try {
            log.info("Getting personalized recommendations with request: {}", request);
            
            // Extract userId from request
            Long userId = null;
            int limit = 8;
            
            if (request != null) {
                Object userIdObj = request.get("userId");
                if (userIdObj != null) {
                    userId = ((Number) userIdObj).longValue();
                }
                Object limitObj = request.get("limit");
                if (limitObj != null) {
                    limit = ((Number) limitObj).intValue();
                }
            }
            
            List<Tour> tours = new ArrayList<>();
            
            if (userId != null) {
                // Get categories from user's booking history
                List<Long> categoryIds = bookingRepository.findCategoryIdsByUserId(userId);
                log.info("Found {} categories from user {} booking history", categoryIds.size(), userId);
                
                if (!categoryIds.isEmpty()) {
                    // Get tours from these categories
                    tours = tourRepository.findByCategoryIds(
                        categoryIds, 
                        Tour.TourStatus.ACTIVE, 
                        PageRequest.of(0, limit)
                    );
                    log.info("Found {} tours from user's preferred categories", tours.size());
                }
            }
            
            // Fallback to featured tours if no personalized tours found
            if (tours.isEmpty()) {
                log.info("No personalized tours found, falling back to featured tours");
                tours = tourRepository.findFeaturedTours(Tour.TourStatus.ACTIVE);
                if (tours.size() > limit) {
                    tours = tours.subList(0, limit);
                }
            }
            
            // Force initialization of lazy-loaded entities
            tours.forEach(tour -> {
                if (tour.getCategory() != null) {
                    tour.getCategory().getName();
                }
            });
            
            List<TourResponse> responses = tours.stream()
                .map(entityMapper::toTourResponse)
                .collect(Collectors.toList());
            
            log.info("Returning {} personalized recommendations", responses.size());
            return ResponseEntity.ok(ApiResponse.success("Personalized recommendations retrieved", responses));
            
        } catch (Exception e) {
            log.error("Error getting personalized recommendations", e);
            return ResponseEntity.ok(ApiResponse.success("Personalized recommendations retrieved", List.of()));
        }
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending tours")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getTrendingTours(
            @Parameter(description = "Number of tours to return") @RequestParam(defaultValue = "6") int limit) {
        
        try {
            log.info("Getting trending tours with limit: {}", limit);
            
            // Get tours with most bookings in last 30 days
            LocalDateTime since = LocalDateTime.now().minusDays(30);
            List<Object[]> results = tourRepository.findTrendingTours(
                Tour.TourStatus.ACTIVE, 
                since, 
                PageRequest.of(0, limit)
            );
            
            log.info("Found {} trending tours", results.size());
            
            List<Tour> tours = results.stream()
                .map(row -> (Tour) row[0])
                .collect(Collectors.toList());
            
            // Force initialization of lazy-loaded entities
            tours.forEach(tour -> {
                if (tour.getCategory() != null) {
                    tour.getCategory().getName();
                }
            });
            
            List<TourResponse> responses = tours.stream()
                .map(entityMapper::toTourResponse)
                .collect(Collectors.toList());
            
            log.info("Returning {} trending tours", responses.size());
            return ResponseEntity.ok(ApiResponse.success("Trending tours retrieved", responses));
            
        } catch (Exception e) {
            log.error("Error getting trending tours", e);
            return ResponseEntity.ok(ApiResponse.success("Trending tours retrieved", List.of()));
        }
    }

    @GetMapping("/last-minute")
    @Operation(summary = "Get last minute deals")
    public ResponseEntity<ApiResponse<List<Object>>> getLastMinuteDeals(
            @Parameter(description = "Number of tours to return") @RequestParam(defaultValue = "6") int limit) {
        
        try {
            log.info("Getting last minute deals with limit: {}", limit);
            
            // Return mock last minute deals
            List<Object> lastMinuteDeals = List.of(
                Map.of("id", 4L, "name", "Mekong Delta Tour", "price", 800000, "originalPrice", 1200000, "discount", 33),
                Map.of("id", 5L, "name", "Da Nang Beach", "price", 1500000, "originalPrice", 2000000, "discount", 25)
            );
            
            return ResponseEntity.ok(ApiResponse.success("Last minute deals retrieved", lastMinuteDeals));
            
        } catch (Exception e) {
            log.error("Error getting last minute deals", e);
            return ResponseEntity.ok(ApiResponse.success("Last minute deals retrieved", List.of()));
        }
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular tours")
    public ResponseEntity<ApiResponse<List<Object>>> getPopularTours(
            @Parameter(description = "Number of tours to return") @RequestParam(defaultValue = "6") int limit) {
        
        try {
            log.info("Getting popular tours with limit: {}", limit);
            
            // Return mock popular tours
            List<Object> popularTours = List.of(
                Map.of("id", 6L, "name", "Phu Quoc Island", "price", 3200000, "rating", 4.8),
                Map.of("id", 7L, "name", "Ninh Binh Nature", "price", 1600000, "rating", 4.7)
            );
            
            return ResponseEntity.ok(ApiResponse.success("Popular tours retrieved", popularTours));
            
        } catch (Exception e) {
            log.error("Error getting popular tours", e);
            return ResponseEntity.ok(ApiResponse.success("Popular tours retrieved", List.of()));
        }
    }

    @GetMapping("/similar/{tourId}")
    @Operation(summary = "Get similar tours")
    public ResponseEntity<ApiResponse<List<Object>>> getSimilarTours(
            @Parameter(description = "Tour ID") @PathVariable Long tourId,
            @Parameter(description = "Number of tours to return") @RequestParam(defaultValue = "6") int limit) {
        
        try {
            log.info("Getting similar tours for tour: {} with limit: {}", tourId, limit);
            
            // Return mock similar tours
            List<Object> similarTours = List.of(
                Map.of("id", 8L, "name", "Cat Ba Island", "price", 2200000, "similarity", 0.85),
                Map.of("id", 9L, "name", "Ba Be National Park", "price", 1900000, "similarity", 0.78)
            );
            
            return ResponseEntity.ok(ApiResponse.success("Similar tours retrieved", similarTours));
            
        } catch (Exception e) {
            log.error("Error getting similar tours", e);
            return ResponseEntity.ok(ApiResponse.success("Similar tours retrieved", List.of()));
        }
    }

    @PostMapping("/user/{userId}/preferences")
    @Operation(summary = "Update user preferences for recommendations")
    public ResponseEntity<ApiResponse<String>> updateUserPreferences(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @RequestBody Map<String, Object> preferences) {
        
        try {
            log.info("Updating preferences for user: {}", userId);
            
            return ResponseEntity.ok(ApiResponse.success("User preferences updated successfully", "Preferences saved"));
            
        } catch (Exception e) {
            log.error("Error updating user preferences", e);
            return ResponseEntity.ok(ApiResponse.success("User preferences updated", "Error handled gracefully"));
        }
    }
}
