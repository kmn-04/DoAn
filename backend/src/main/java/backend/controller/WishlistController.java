package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.WishlistResponse;
import backend.security.UserDetailsImpl;
import backend.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static backend.dto.response.ApiResponse.success;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
@Tag(name = "Wishlists", description = "API quản lý danh sách yêu thích")
public class WishlistController {
    
    private final WishlistService wishlistService;
    
    @PostMapping("/tour/{tourId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Thêm tour vào wishlist")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @PathVariable Long tourId,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        WishlistResponse response = wishlistService.addToWishlist(userDetails.getId(), tourId);
        return ResponseEntity.ok(success("Tour added to wishlist successfully", response));
    }
    
    @DeleteMapping("/tour/{tourId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa tour khỏi wishlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long tourId,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        wishlistService.removeFromWishlist(userDetails.getId(), tourId);
        return ResponseEntity.ok(success("Tour removed from wishlist successfully", null));
    }
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy wishlist của user")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getUserWishlist(
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<WishlistResponse> wishlists = wishlistService.getUserWishlist(userDetails.getId());
        return ResponseEntity.ok(success("Wishlist retrieved successfully", wishlists));
    }
    
    @GetMapping("/paginated")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy wishlist có phân trang")
    public ResponseEntity<ApiResponse<Page<WishlistResponse>>> getUserWishlistPaginated(
            Authentication authentication,
            Pageable pageable) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Page<WishlistResponse> wishlists = wishlistService.getUserWishlistPaginated(userDetails.getId(), pageable);
        return ResponseEntity.ok(success("Wishlist retrieved successfully", wishlists));
    }
    
    @GetMapping("/check/{tourId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Kiểm tra tour có trong wishlist không")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkTourInWishlist(
            @PathVariable Long tourId,
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean inWishlist = wishlistService.isTourInWishlist(userDetails.getId(), tourId);
        return ResponseEntity.ok(success("Check completed", Map.of("inWishlist", inWishlist)));
    }
    
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đếm số lượng item trong wishlist")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countWishlist(
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long count = wishlistService.countUserWishlist(userDetails.getId());
        return ResponseEntity.ok(success("Count retrieved successfully", Map.of("count", count)));
    }
    
    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa toàn bộ wishlist")
    public ResponseEntity<ApiResponse<Void>> clearWishlist(
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        wishlistService.clearUserWishlist(userDetails.getId());
        return ResponseEntity.ok(success("Wishlist cleared successfully", null));
    }
}