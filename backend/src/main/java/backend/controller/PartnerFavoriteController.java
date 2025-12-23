package backend.controller;

import backend.dto.response.ApiResponse;
import backend.security.UserDetailsImpl;
import backend.service.PartnerFavoriteService;

import static backend.dto.response.ApiResponse.success;
import static backend.dto.response.ApiResponse.error;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Partner Favorites", description = "APIs for managing partner favorites")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PartnerFavoriteController {
    
    private final PartnerFavoriteService favoriteService;
    
    @PostMapping("/{partnerId}/favorite")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add partner to favorites", description = "Add a partner to user's favorites")
    public ResponseEntity<ApiResponse<Void>> addToFavorites(
            @PathVariable Long partnerId,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            favoriteService.addToFavorites(userDetails.getId(), partnerId);
            return ResponseEntity.ok(success("Partner added to favorites successfully", null));
        } catch (Exception e) {
            log.error("Error adding partner to favorites", e);
            return ResponseEntity.badRequest().body(error("Failed to add partner to favorites: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{partnerId}/favorite")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove partner from favorites", description = "Remove a partner from user's favorites")
    public ResponseEntity<ApiResponse<Void>> removeFromFavorites(
            @PathVariable Long partnerId,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            favoriteService.removeFromFavorites(userDetails.getId(), partnerId);
            return ResponseEntity.ok(success("Partner removed from favorites successfully", null));
        } catch (Exception e) {
            log.error("Error removing partner from favorites", e);
            return ResponseEntity.badRequest().body(error("Failed to remove partner from favorites: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{partnerId}/favorite")
    @Operation(summary = "Check if partner is favorited", description = "Check if a partner is in user's favorites")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> isFavorited(
            @PathVariable Long partnerId,
            Authentication authentication) {
        try {
            // Return false if not authenticated
            if (authentication == null || !authentication.isAuthenticated() 
                || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.ok(success("Not favorited (not authenticated)", 
                    Map.of("isFavorited", false)));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isFavorited = favoriteService.isPartnerInFavorites(userDetails.getId(), partnerId);
            return ResponseEntity.ok(success("Favorite status retrieved", 
                Map.of("isFavorited", isFavorited)));
        } catch (Exception e) {
            log.error("Error checking favorite status", e);
            return ResponseEntity.badRequest().body(error("Failed to check favorite status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's favorite partner IDs", description = "Get list of partner IDs favorited by user")
    public ResponseEntity<ApiResponse<List<Long>>> getUserFavorites(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Long> partnerIds = favoriteService.getUserFavoritePartnerIds(userDetails.getId());
            return ResponseEntity.ok(success("Favorite partners retrieved", partnerIds));
        } catch (Exception e) {
            log.error("Error getting favorite partners", e);
            return ResponseEntity.badRequest().body(error("Failed to get favorite partners: " + e.getMessage()));
        }
    }
}

