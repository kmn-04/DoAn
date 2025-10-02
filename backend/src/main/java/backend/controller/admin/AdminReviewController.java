package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.dto.response.ReviewResponse;
import backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Review Management", description = "Admin APIs for managing reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminReviewController extends BaseController {
    
    private final ReviewService reviewService;
    
    @GetMapping
    @Operation(summary = "Get all reviews", description = "Get all reviews with pagination (Admin only)")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<ReviewResponse> reviews = reviewService.getAllReviewsAdmin(pageable);
            return ResponseEntity.ok(success("Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            log.error("Error getting reviews", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get reviews: " + e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get reviews by status", description = "Get reviews filtered by status (Admin only)")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<ReviewResponse> reviews = reviewService.getReviewsByStatus(status, pageable);
            return ResponseEntity.ok(success("Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            log.error("Error getting reviews by status: {}", status, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get reviews: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID", description = "Get review details by ID (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        try {
            ReviewResponse review = reviewService.getReviewById(id);
            return ResponseEntity.ok(success("Review retrieved successfully", review));
        } catch (Exception e) {
            log.error("Error getting review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get review: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve review", description = "Approve a pending review (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> approveReview(@PathVariable Long id) {
        try {
            ReviewResponse review = reviewService.approveReview(id);
            return ResponseEntity.ok(success("Review approved successfully", review));
        } catch (Exception e) {
            log.error("Error approving review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to approve review: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject review", description = "Reject a review (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> rejectReview(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        try {
            ReviewResponse review = reviewService.rejectReview(id, reason);
            return ResponseEntity.ok(success("Review rejected successfully", review));
        } catch (Exception e) {
            log.error("Error rejecting review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to reject review: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete review", description = "Delete a review (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReviewAdmin(id);
            return ResponseEntity.ok(success("Review deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete review: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total reviews count", description = "Get total number of reviews (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalReviewsCount() {
        try {
            long count = reviewService.getTotalReviews();
            return ResponseEntity.ok(success("Total reviews count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting reviews count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get reviews count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/pending")
    @Operation(summary = "Get pending reviews count", description = "Get number of pending reviews (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getPendingReviewsCount() {
        try {
            long count = reviewService.getPendingReviewsCount();
            return ResponseEntity.ok(success("Pending reviews count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting pending reviews count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get pending reviews count: " + e.getMessage()));
        }
    }
}

