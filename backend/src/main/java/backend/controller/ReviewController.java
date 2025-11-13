package backend.controller;

import backend.dto.request.ReviewCreateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.ReviewResponse;
import backend.security.UserDetailsImpl;
import backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Review Management", description = "APIs for managing tour reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class ReviewController extends BaseController {
    
    private final ReviewService reviewService;
    
    /**
     * Get all approved reviews
     */
    @GetMapping
    @Operation(summary = "Get all approved reviews")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllApprovedReviews();
        return ResponseEntity.ok(success(reviews));
    }
    
    /**
     * Create a new review (User only - must have completed booking)
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new review", description = "User can create review after completing a tour")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewCreateRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        ReviewResponse review = reviewService.createReview(request, userId);
        
        return ResponseEntity.ok(success("Review created successfully. It will be published after approval.", review));
    }
    
    /**
     * Update own review
     */
    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update own review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @Parameter(description = "Review ID") @PathVariable Long reviewId,
            @Valid @RequestBody ReviewCreateRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        ReviewResponse review = reviewService.updateReview(reviewId, request, userId);
        
        return ResponseEntity.ok(success("Review updated successfully", review));
    }
    
    /**
     * Delete own review
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete own review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @Parameter(description = "Review ID") @PathVariable Long reviewId) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        reviewService.deleteReview(reviewId, userId);
        
        return ResponseEntity.ok(success("Review deleted successfully"));
    }
    
    /**
     * Get review by ID
     */
    @GetMapping("/{reviewId}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(
            @Parameter(description = "Review ID") @PathVariable Long reviewId) {
        
        ReviewResponse review = reviewService.getReviewById(reviewId);
        
        return ResponseEntity.ok(success(review));
    }
    
    /**
     * Get reviews by tour ID (public - approved only)
     */
    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Get all reviews for a tour", description = "Returns approved reviews only")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByTourId(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        List<ReviewResponse> reviews = reviewService.getReviewsByTourId(tourId);
        
        return ResponseEntity.ok(success(reviews));
    }
    
    /**
     * Get AI-generated summary of reviews for a tour
     */
    @GetMapping("/tour/{tourId}/ai-summary")
    @Operation(summary = "Get AI-generated summary of reviews", 
               description = "Returns AI analysis of positive/negative points and overall summary")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<backend.dto.response.ReviewAiSummaryResponse>> getAiSummary(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        backend.dto.response.ReviewAiSummaryResponse summary = reviewService.getAiSummary(tourId);
        return ResponseEntity.ok(success("AI summary generated successfully", summary));
    }
    
    /**
     * Get reviews by tour ID with pagination
     */
    @GetMapping("/tour/{tourId}/paginated")
    @Operation(summary = "Get reviews for a tour with pagination")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByTourIdPaginated(
            @Parameter(description = "Tour ID") @PathVariable Long tourId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        Page<ReviewResponse> reviews = reviewService.getReviewsByTourId(tourId, pageable);
        
        return ResponseEntity.ok(success(reviews));
    }
    
    /**
     * Get own reviews (current user)
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews() {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        List<ReviewResponse> reviews = reviewService.getReviewsByUserId(userId);
        
        return ResponseEntity.ok(success(reviews));
    }
    
    /**
     * Get reviews by user ID
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get reviews by user ID")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByUserId(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        List<ReviewResponse> reviews = reviewService.getReviewsByUserId(userId);
        
        return ResponseEntity.ok(success(reviews));
    }
    
    /**
     * Vote review as helpful
     */
    @PostMapping("/{reviewId}/helpful")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Vote a review as helpful")
    public ResponseEntity<ApiResponse<ReviewResponse>> voteHelpful(
            @Parameter(description = "Review ID") @PathVariable Long reviewId) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        ReviewResponse review = reviewService.voteHelpful(reviewId, userId);
        
        return ResponseEntity.ok(success("Thank you for your feedback", review));
    }
    
    /**
     * Check if user can review a tour
     */
    @GetMapping("/can-review")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if user can review a tour")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> canReviewTour(
            @Parameter(description = "Tour ID") @RequestParam Long tourId,
            @Parameter(description = "Booking ID") @RequestParam Long bookingId) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        boolean canReview = reviewService.canUserReviewTour(userId, tourId, bookingId);
        
        return ResponseEntity.ok(success(Map.of("canReview", canReview)));
    }
    
    /**
     * Check if current user can review a tour (without bookingId)
     */
    @GetMapping("/tour/{tourId}/can-review")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if current user can review this tour (has completed booking)")
    public ResponseEntity<ApiResponse<Boolean>> canCurrentUserReviewTour(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        // Check if user has any completed/confirmed booking for this tour and hasn't reviewed yet
        boolean canReview = reviewService.hasCompletedBookingForTour(userId, tourId);
        
        return ResponseEntity.ok(success(canReview));
    }
    
    /**
     * Get review by booking ID
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get review by booking ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewByBookingId(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
        
        ReviewResponse review = reviewService.getReviewByBookingId(bookingId);
        
        if (review == null) {
            return ResponseEntity.ok(success("No review found for this booking", null));
        }
        
        return ResponseEntity.ok(success(review));
    }
    
    /**
     * Get tour rating statistics
     */
    @GetMapping("/tour/{tourId}/stats")
    @Operation(summary = "Get rating statistics for a tour")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTourRatingStats(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        Double averageRating = reviewService.calculateAverageRating(tourId);
        Map<Integer, Long> ratingDistribution = reviewService.getRatingDistribution(tourId);
        
        Map<String, Object> stats = Map.of(
                "averageRating", averageRating != null ? averageRating : 0.0,
                "ratingDistribution", ratingDistribution
        );
        
        return ResponseEntity.ok(success(stats));
    }
}

