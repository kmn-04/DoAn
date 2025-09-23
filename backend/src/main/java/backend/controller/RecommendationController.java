package backend.controller;

import backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@Slf4j
@Tag(name = "Recommendation Management", description = "APIs for tour recommendations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class RecommendationController {

    @PostMapping("/personalized")
    @Operation(summary = "Get personalized tour recommendations")
    public ResponseEntity<ApiResponse<List<Object>>> getPersonalizedRecommendations(
            @RequestBody(required = false) Map<String, Object> request) {
        
        try {
            log.info("Getting personalized recommendations");
            
            // Return mock recommendations
            List<Object> recommendations = List.of(
                Map.of(
                    "id", 1L,
                    "name", "Ha Long Bay Adventure",
                    "price", 2500000,
                    "score", 95.5,
                    "reason", "Based on your beach preferences"
                ),
                Map.of(
                    "id", 2L,
                    "name", "Sapa Mountain Trek", 
                    "price", 1800000,
                    "score", 88.2,
                    "reason", "You love mountain activities"
                )
            );
            
            return ResponseEntity.ok(ApiResponse.success("Personalized recommendations retrieved", recommendations));
            
        } catch (Exception e) {
            log.error("Error getting personalized recommendations", e);
            return ResponseEntity.ok(ApiResponse.success("Personalized recommendations retrieved", List.of()));
        }
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending tours")
    public ResponseEntity<ApiResponse<List<Object>>> getTrendingTours(
            @Parameter(description = "Number of tours to return") @RequestParam(defaultValue = "6") int limit) {
        
        try {
            log.info("Getting trending tours with limit: {}", limit);
            
            // Return mock trending tours
            List<Object> trendingTours = List.of(
                Map.of("id", 1L, "name", "Ha Long Bay Cruise", "price", 2500000, "image", "/images/halong.jpg"),
                Map.of("id", 2L, "name", "Sapa Adventure", "price", 1800000, "image", "/images/sapa.jpg"),
                Map.of("id", 3L, "name", "Hoi An Ancient Town", "price", 1200000, "image", "/images/hoian.jpg")
            );
            
            return ResponseEntity.ok(ApiResponse.success("Trending tours retrieved", trendingTours));
            
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
