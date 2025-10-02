package backend.service.impl;

import backend.dto.request.ReviewCreateRequest;
import backend.dto.response.ReviewResponse;
import backend.entity.Booking;
import backend.entity.Review;
import backend.entity.Review.ReviewStatus;
import backend.entity.Tour;
import backend.entity.User;
import backend.mapper.EntityMapper;
import backend.repository.BookingRepository;
import backend.repository.ReviewRepository;
import backend.repository.TourRepository;
import backend.repository.UserRepository;
import backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final EntityMapper mapper;
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllApprovedReviews() {
        List<Review> reviews = reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.Approved);
        return reviews.stream()
                .map(mapper::toReviewResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public ReviewResponse createReview(ReviewCreateRequest request, Long userId) {
        log.info("Creating review for tour {} by user {}", request.getTourId(), userId);
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Validate tour exists
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + request.getTourId()));
        
        // Validate booking exists and belongs to user
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + request.getBookingId()));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Booking does not belong to this user");
        }
        
        if (!booking.getTour().getId().equals(request.getTourId())) {
            throw new RuntimeException("Booking is not for this tour");
        }
        
        // Check if booking is confirmed and paid
        if (booking.getConfirmationStatus() != Booking.ConfirmationStatus.Confirmed) {
            throw new RuntimeException("Can only review confirmed bookings");
        }
        
        if (booking.getPaymentStatus() != Booking.PaymentStatus.Paid) {
            throw new RuntimeException("Can only review paid bookings");
        }
        
        // Check if user has already reviewed this tour
        if (reviewRepository.existsByUserIdAndTourId(userId, request.getTourId())) {
            throw new RuntimeException("You have already reviewed this tour");
        }
        
        // Create review
        Review review = new Review();
        review.setUser(user);
        review.setTour(tour);
        review.setBooking(booking);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(ReviewStatus.Pending); // Pending approval
        review.setHelpfulCount(0);
        
        Review savedReview = reviewRepository.save(review);
        
        // Update tour rating
        updateTourRating(request.getTourId());
        
        log.info("Review created successfully with ID: {}", savedReview.getId());
        return mapper.toReviewResponse(savedReview);
    }
    
    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewCreateRequest request, Long userId) {
        log.info("Updating review {} by user {}", reviewId, userId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        // Check if user owns the review
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own reviews");
        }
        
        // Update review
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(ReviewStatus.Pending); // Reset to pending after update
        
        Review updatedReview = reviewRepository.save(review);
        
        // Update tour rating
        updateTourRating(review.getTour().getId());
        
        log.info("Review updated successfully");
        return mapper.toReviewResponse(updatedReview);
    }
    
    @Override
    public void deleteReview(Long reviewId, Long userId) {
        log.info("Deleting review {} by user {}", reviewId, userId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        // Check if user owns the review
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        Long tourId = review.getTour().getId();
        reviewRepository.delete(review);
        
        // Update tour rating
        updateTourRating(tourId);
        
        log.info("Review deleted successfully");
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        return mapper.toReviewResponse(review);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByTourId(Long tourId) {
        // Only return approved reviews for public view
        List<Review> reviews = reviewRepository.findByTourIdAndStatusOrderByCreatedAtDesc(
                tourId, ReviewStatus.Approved);
        return reviews.stream()
                .map(mapper::toReviewResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByTourId(Long tourId, Pageable pageable) {
        // Only return approved reviews for public view
        Page<Review> reviews = reviewRepository.findByTourIdAndStatusOrderByCreatedAtDesc(
                tourId, ReviewStatus.Approved, pageable);
        return reviews.map(mapper::toReviewResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return reviews.stream()
                .map(mapper::toReviewResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByUserId(Long userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return reviews.map(mapper::toReviewResponse);
    }
    
    @Override
    public ReviewResponse voteHelpful(Long reviewId, Long userId) {
        log.info("User {} voting review {} as helpful", userId, reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        // TODO: Implement vote tracking to prevent duplicate votes
        // For now, just increment the count
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        
        Review updatedReview = reviewRepository.save(review);
        return mapper.toReviewResponse(updatedReview);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserReviewedTour(Long userId, Long tourId) {
        return reviewRepository.existsByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canUserReviewTour(Long userId, Long tourId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        
        if (booking == null) {
            return false;
        }
        
        // Check if booking belongs to user, is for this tour, is confirmed and paid
        return booking.getUser().getId().equals(userId)
                && booking.getTour().getId().equals(tourId)
                && booking.getConfirmationStatus() == Booking.ConfirmationStatus.Confirmed
                && booking.getPaymentStatus() == Booking.PaymentStatus.Paid
                && !reviewRepository.existsByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewByBookingId(Long bookingId) {
        Review review = reviewRepository.findByBookingId(bookingId);
        return review != null ? mapper.toReviewResponse(review) : null;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double calculateAverageRating(Long tourId) {
        return reviewRepository.calculateAverageRatingByTour(tourId, ReviewStatus.Approved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<Integer, Long> getRatingDistribution(Long tourId) {
        List<Object[]> distribution = reviewRepository.countReviewsByRatingForTour(
                tourId, ReviewStatus.Approved);
        
        return distribution.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));
    }
    
    /**
     * Helper method to update tour rating
     * Note: Tour entity doesn't have rating/reviewCount fields yet.
     * This is calculated on-the-fly via ReviewRepository queries.
     * TODO: Consider adding these fields to Tour entity for performance
     */
    private void updateTourRating(Long tourId) {
        Double avgRating = reviewRepository.calculateAverageRatingByTour(tourId, ReviewStatus.Approved);
        long reviewCount = reviewRepository.countByTourIdAndStatus(tourId, ReviewStatus.Approved);
        
        log.info("Tour {} has average rating {} with {} reviews", tourId, avgRating, reviewCount);
        // Note: Not updating Tour entity as it doesn't have rating fields yet
        // Rating is calculated on-demand when needed
    }
    
    // ========== ADMIN METHODS ==========
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviewsAdmin(Pageable pageable) {
        Page<Review> reviews = reviewRepository.findAll(pageable);
        return reviews.map(mapper::toReviewResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByStatus(String status, Pageable pageable) {
        ReviewStatus reviewStatus = ReviewStatus.valueOf(status);
        Page<Review> reviews = reviewRepository.findByStatus(reviewStatus, pageable);
        return reviews.map(mapper::toReviewResponse);
    }
    
    @Override
    public ReviewResponse approveReview(Long reviewId) {
        log.info("Approving review with ID: {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        review.setStatus(ReviewStatus.Approved);
        Review approvedReview = reviewRepository.save(review);
        
        // Update tour rating
        updateTourRating(review.getTour().getId());
        
        log.info("Review approved successfully: {}", reviewId);
        return mapper.toReviewResponse(approvedReview);
    }
    
    @Override
    public ReviewResponse rejectReview(Long reviewId, String reason) {
        log.info("Rejecting review with ID: {} - Reason: {}", reviewId, reason);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        review.setStatus(ReviewStatus.Rejected);
        // Note: Review entity doesn't have rejectionReason field
        // You may want to add it if needed
        
        Review rejectedReview = reviewRepository.save(review);
        
        log.info("Review rejected successfully: {}", reviewId);
        return mapper.toReviewResponse(rejectedReview);
    }
    
    @Override
    public void deleteReviewAdmin(Long reviewId) {
        log.info("Admin deleting review with ID: {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        reviewRepository.delete(review);
        
        // Update tour rating
        updateTourRating(review.getTour().getId());
        
        log.info("Review deleted successfully by admin: {}", reviewId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getTotalReviews() {
        return reviewRepository.count();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getPendingReviewsCount() {
        return reviewRepository.countByStatus(ReviewStatus.Pending);
    }
}

