package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.TourResponse;
import backend.entity.Wishlist;
import backend.entity.Tour;
import backend.service.WishlistService;
import backend.util.EntityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Wishlist Management", description = "APIs for managing user wishlists")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class WishlistController extends BaseController {
    
    private final WishlistService wishlistService;
    private final EntityMapper mapper;
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user's wishlist")
    public ResponseEntity<ApiResponse<List<TourResponse>>> getUserWishlist(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        List<Wishlist> wishlists = wishlistService.getUserWishlist(userId);
        
        // Convert to TourResponse list
        List<TourResponse> tourResponses = wishlists.stream()
            .map(wishlist -> {
                TourResponse tourResponse = mapper.toTourResponse(wishlist.getTour());
                // Add wishlist created date as additional info
                tourResponse.setCreatedAt(wishlist.getCreatedAt());
                return tourResponse;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(success("User wishlist retrieved successfully", tourResponses));
    }
    
    @PostMapping("/user/{userId}/tour/{tourId}")
    @Operation(summary = "Add tour to wishlist")
    public ResponseEntity<ApiResponse<String>> addToWishlist(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        wishlistService.addToWishlist(userId, tourId);
        
        return ResponseEntity.ok(success("Tour added to wishlist successfully"));
    }
    
    @DeleteMapping("/user/{userId}/tour/{tourId}")
    @Operation(summary = "Remove tour from wishlist")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        wishlistService.removeFromWishlist(userId, tourId);
        
        return ResponseEntity.ok(success("Tour removed from wishlist successfully"));
    }
    
    @GetMapping("/user/{userId}/check/{tourId}")
    @Operation(summary = "Check if tour is in wishlist")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        boolean isInWishlist = wishlistService.isInWishlist(userId, tourId);
        
        return ResponseEntity.ok(success("Wishlist status checked", isInWishlist));
    }
    
    @GetMapping("/user/{userId}/count")
    @Operation(summary = "Get user's wishlist count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        long count = wishlistService.getWishlistCount(userId);
        
        return ResponseEntity.ok(success("Wishlist count retrieved", count));
    }
    
    @DeleteMapping("/user/{userId}/clear")
    @Operation(summary = "Clear user's entire wishlist")
    public ResponseEntity<ApiResponse<String>> clearWishlist(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        wishlistService.clearUserWishlist(userId);
        
        return ResponseEntity.ok(success("Wishlist cleared successfully"));
    }
    
    @GetMapping("/popular")
    @Operation(summary = "Get most wishlisted tours")
    public ResponseEntity<ApiResponse<List<TourResponse>>> getMostWishlistedTours(
            @Parameter(description = "Limit") @RequestParam(defaultValue = "10") int limit) {
        
        List<Tour> tours = wishlistService.getMostWishlistedTours(limit);
        List<TourResponse> tourResponses = mapper.toTourResponseList(tours);
        
        return ResponseEntity.ok(success("Most wishlisted tours retrieved", tourResponses));
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get wishlist statistics")
    public ResponseEntity<ApiResponse<WishlistService.WishlistStatistics>> getWishlistStatistics() {
        
        WishlistService.WishlistStatistics statistics = wishlistService.getWishlistStatistics();
        
        return ResponseEntity.ok(success("Wishlist statistics retrieved", statistics));
    }
}
