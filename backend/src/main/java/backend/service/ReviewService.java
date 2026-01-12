package backend.service;

import backend.dto.request.ReviewCreateRequest;
import backend.dto.response.ReviewResponse;
import backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {
    
    /**
     * Get all approved reviews
     */
    List<ReviewResponse> getAllApprovedReviews();
    
    /**
     * Create a new review (User only - after completing tour)
     */
    ReviewResponse createReview(ReviewCreateRequest request, Long userId);
    
    /**
     * Update own review (User only)
     */
    ReviewResponse updateReview(Long reviewId, ReviewCreateRequest request, Long userId);
    
    /**
     * Delete own review (User only)
     */
    void deleteReview(Long reviewId, Long userId);
    
    /**
     * Get review by ID
     */
    ReviewResponse getReviewById(Long reviewId);
    
    /**
     * Get reviews by tour ID (approved only for public)
     */
    List<ReviewResponse> getReviewsByTourId(Long tourId);
    
    /**
     * Get reviews by tour ID with pagination
     */
    Page<ReviewResponse> getReviewsByTourId(Long tourId, Pageable pageable);
    
    /**
     * Get reviews by user ID
     */
    List<ReviewResponse> getReviewsByUserId(Long userId);
    
    /**
     * Get reviews by user ID with pagination
     */
    Page<ReviewResponse> getReviewsByUserId(Long userId, Pageable pageable);
    
    /**
     * Vote review as helpful
     */
    ReviewResponse voteHelpful(Long reviewId, Long userId);
    
    /**
     * Check if user has already reviewed a tour
     */
    boolean hasUserReviewedTour(Long userId, Long tourId);
    
    /**
     * Check if user can review (booking exists and completed)
     */
    boolean canUserReviewTour(Long userId, Long tourId, Long bookingId);
    
    /**
     * Check if user has completed booking for a tour (without specific bookingId)
     */
    boolean hasCompletedBookingForTour(Long userId, Long tourId);
    
    /**
     * Get AI-generated summary of reviews for a tour
     */
    backend.dto.response.ReviewAiSummaryResponse getAiSummary(Long tourId);
    
    /**
     * Get review by booking ID
     */
    ReviewResponse getReviewByBookingId(Long bookingId);
    
    /**
     * Calculate average rating for tour
     */
    Double calculateAverageRating(Long tourId);
    
    /**
     * Get rating distribution for tour
     */
    java.util.Map<Integer, Long> getRatingDistribution(Long tourId);
    
    // ========== ADMIN METHODS ==========
    
    /**
     * Get all reviews (Admin - includes all statuses)
     */
    Page<ReviewResponse> getAllReviewsAdmin(Pageable pageable);
    
    /**
     * Get reviews by status (Admin)
     */
    Page<ReviewResponse> getReviewsByStatus(String status, Pageable pageable);
    
    /**
     * Approve review (Admin)
     */
    ReviewResponse approveReview(Long reviewId);
    
    /**
     * Reject review (Admin)
     */
    ReviewResponse rejectReview(Long reviewId, String reason);
    
    /**
     * Update review status (Admin)
     */
    ReviewResponse updateReviewStatus(Long reviewId, String status);
    
    /**
     * Reply to review (Admin)
     */
    ReviewResponse replyToReview(Long reviewId, String reply);
    
    /**
     * Delete reply from review (Admin)
     */
    ReviewResponse deleteReply(Long reviewId);
    
    /**
     * Delete any review (Admin)
     */
    void deleteReviewAdmin(Long reviewId);
    
    /**
     * Get total reviews count
     */
    long getTotalReviews();
    
    /**
     * Get pending reviews count
     */
    long getPendingReviewsCount();
    
    /**
     * Get reviews with advanced filters (Admin)
     */
    Page<ReviewResponse> getReviewsWithFilters(
        String status, Long tourId, Integer rating,
        java.time.LocalDateTime startDate, java.time.LocalDateTime endDate,
        Boolean isSuspicious, Boolean isSpam, Pageable pageable
    );
    
    /**
     * Mark review as suspicious
     */
    ReviewResponse markAsSuspicious(Long reviewId, boolean suspicious);
    
    /**
     * Mark review as spam
     */
    ReviewResponse markAsSpam(Long reviewId, boolean spam);
    
    /**
     * Analyze review with AI (detect negative keywords, sentiment)
     */
    java.util.Map<String, Object> analyzeReviewWithAI(Long reviewId);
    
    /**
     * Get all reviews for export (with filters)
     */
    java.util.List<ReviewResponse> getAllReviewsForExport(
        String status, Long tourId, Integer rating,
        java.time.LocalDateTime startDate, java.time.LocalDateTime endDate,
        Boolean isSuspicious, Boolean isSpam
    );
}

