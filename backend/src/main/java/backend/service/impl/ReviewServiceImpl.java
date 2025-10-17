package backend.service.impl;

import backend.dto.request.ReviewCreateRequest;
import backend.dto.response.ReviewResponse;
import backend.entity.Booking;
import backend.entity.Notification;
import backend.entity.Review;
import backend.entity.Review.ReviewStatus;
import backend.entity.Tour;
import backend.entity.User;
import backend.mapper.EntityMapper;
import backend.repository.BookingRepository;
import backend.repository.ReviewRepository;
import backend.repository.TourRepository;
import backend.repository.UserRepository;
import backend.service.NotificationService;
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
    private final NotificationService notificationService;
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllApprovedReviews() {
        List<Review> reviews = reviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.APPROVED);
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
        
        // Check if booking is confirmed or completed
        if (booking.getConfirmationStatus() != Booking.ConfirmationStatus.CONFIRMED 
                && booking.getConfirmationStatus() != Booking.ConfirmationStatus.COMPLETED) {
            throw new RuntimeException("Can only review confirmed or completed bookings");
        }
        
        if (booking.getPaymentStatus() != Booking.PaymentStatus.PAID) {
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
        review.setStatus(ReviewStatus.APPROVED); // Auto-approve
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
        review.setStatus(ReviewStatus.PENDING); // Reset to pending after update
        
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
                tourId, ReviewStatus.APPROVED);
        return reviews.stream()
                .map(mapper::toReviewResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByTourId(Long tourId, Pageable pageable) {
        // Only return approved reviews for public view
        Page<Review> reviews = reviewRepository.findByTourIdAndStatusOrderByCreatedAtDesc(
                tourId, ReviewStatus.APPROVED, pageable);
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
        
        // Get current voted user IDs
        String currentVoters = review.getHelpfulUserIds();
        java.util.Set<String> voterSet = new java.util.HashSet<>();
        
        if (currentVoters != null && !currentVoters.isEmpty()) {
            voterSet.addAll(java.util.Arrays.asList(currentVoters.split(",")));
        }
        
        String userIdStr = userId.toString();
        
        // Toggle vote
        if (voterSet.contains(userIdStr)) {
            // User already voted - remove vote (unlike)
            voterSet.remove(userIdStr);
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
            log.info("User {} removed helpful vote from review {}", userId, reviewId);
        } else {
            // User hasn't voted - add vote
            voterSet.add(userIdStr);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
            log.info("User {} added helpful vote to review {}", userId, reviewId);
        }
        
        // Save back to comma-separated string
        review.setHelpfulUserIds(voterSet.isEmpty() ? null : String.join(",", voterSet));
        
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
        
        // Check if booking belongs to user, is for this tour
        // Allow review if booking is CONFIRMED or COMPLETED (tour finished)
        // Must be PAID and user hasn't reviewed yet
        boolean isValidStatus = booking.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED
                || booking.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED;
        
        return booking.getUser().getId().equals(userId)
                && booking.getTour().getId().equals(tourId)
                && isValidStatus
                && booking.getPaymentStatus() == Booking.PaymentStatus.PAID
                && !reviewRepository.existsByUserIdAndTourId(userId, tourId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasCompletedBookingForTour(Long userId, Long tourId) {
        // Check if user has any completed or confirmed booking for this tour
        // and hasn't reviewed it yet
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        for (Booking booking : bookings) {
            if (booking.getTour().getId().equals(tourId)) {
                boolean isValidStatus = booking.getConfirmationStatus() == Booking.ConfirmationStatus.CONFIRMED
                        || booking.getConfirmationStatus() == Booking.ConfirmationStatus.COMPLETED;
                boolean isPaid = booking.getPaymentStatus() == Booking.PaymentStatus.PAID;
                boolean notReviewed = !reviewRepository.existsByUserIdAndTourId(userId, tourId);
                
                if (isValidStatus && isPaid && notReviewed) {
                    return true;
                }
            }
        }
        
        return false;
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
        return reviewRepository.calculateAverageRatingByTour(tourId, ReviewStatus.APPROVED);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<Integer, Long> getRatingDistribution(Long tourId) {
        List<Object[]> distribution = reviewRepository.countReviewsByRatingForTour(
                tourId, ReviewStatus.APPROVED);
        
        return distribution.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));
    }
    
    /**
     * Helper method to update tour rating cache
     * Updates the cached averageRating and reviewCount fields in Tour entity
     * This is called whenever a review is approved, rejected, or deleted
     */
    private void updateTourRating(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + tourId));
        
        Double avgRating = reviewRepository.calculateAverageRatingByTour(tourId, ReviewStatus.APPROVED);
        long reviewCount = reviewRepository.countByTourIdAndStatus(tourId, ReviewStatus.APPROVED);
        
        // Update cached fields
        tour.setAverageRating(avgRating != null ? avgRating : 0.0);
        tour.setReviewCount(reviewCount);
        tourRepository.save(tour);
        
        log.info("Updated tour {} rating cache: {} stars ({} reviews)", tourId, tour.getAverageRating(), tour.getReviewCount());
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
        ReviewStatus reviewStatus = ReviewStatus.valueOf(status.toUpperCase());
        Page<Review> reviews = reviewRepository.findByStatus(reviewStatus, pageable);
        return reviews.map(mapper::toReviewResponse);
    }
    
    @Override
    public ReviewResponse approveReview(Long reviewId) {
        log.info("Approving review with ID: {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        review.setStatus(ReviewStatus.APPROVED);
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
        
        review.setStatus(ReviewStatus.REJECTED);
        // Note: Review entity doesn't have rejectionReason field
        // You may want to add it if needed
        
        Review rejectedReview = reviewRepository.save(review);
        
        log.info("Review rejected successfully: {}", reviewId);
        return mapper.toReviewResponse(rejectedReview);
    }
    
    @Override
    public ReviewResponse updateReviewStatus(Long reviewId, String status) {
        log.info("Updating review {} status to: {}", reviewId, status);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        ReviewStatus oldStatus = review.getStatus();
        ReviewStatus newStatus = ReviewStatus.valueOf(status.toUpperCase());
        review.setStatus(newStatus);
        Review updatedReview = reviewRepository.save(review);
        
        // Update tour rating if status is Approved or if it was Approved before
        if (newStatus == ReviewStatus.APPROVED || oldStatus == ReviewStatus.APPROVED) {
            updateTourRating(review.getTour().getId());
        }
        
        // Send notification if status changed
        if (oldStatus != newStatus) {
            sendReviewStatusNotification(updatedReview, newStatus);
        }
        
        log.info("Review status updated successfully: {}", reviewId);
        return mapper.toReviewResponse(updatedReview);
    }
    
    @Override
    public ReviewResponse replyToReview(Long reviewId, String reply) {
        log.info("Admin replying to review {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        review.setAdminReply(reply);
        review.setRepliedAt(java.time.LocalDateTime.now());
        // Note: repliedBy field would need SecurityContext to get current admin user ID
        // For now, leaving it null or you can inject SecurityContext
        
        Review updatedReview = reviewRepository.save(review);
        
        // Send notification to user
        sendAdminReplyNotification(updatedReview);
        
        log.info("Reply added successfully to review: {}", reviewId);
        return mapper.toReviewResponse(updatedReview);
    }
    
    @Override
    public ReviewResponse deleteReply(Long reviewId) {
        log.info("Admin deleting reply from review {}", reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        
        review.setAdminReply(null);
        review.setRepliedAt(null);
        review.setRepliedBy(null);
        
        Review updatedReview = reviewRepository.save(review);
        
        log.info("Reply deleted successfully from review: {}", reviewId);
        return mapper.toReviewResponse(updatedReview);
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
        return reviewRepository.countByStatus(ReviewStatus.PENDING);
    }
    
    // ==================== NOTIFICATION HELPERS ====================
    
    /**
     * Send notification when review status changes
     */
    private void sendReviewStatusNotification(Review review, ReviewStatus newStatus) {
        try {
            Long userId = review.getUser().getId();
            String tourName = review.getTour().getName();
            String link = "/tours/" + review.getTour().getId() + "/reviews";
            
            switch (newStatus) {
                case APPROVED:
                    notificationService.createNotificationForUser(
                        userId,
                        "Đánh giá đã được duyệt",
                        String.format("Đánh giá của bạn về tour '%s' đã được phê duyệt và hiển thị công khai. Cảm ơn bạn đã chia sẻ!", 
                            tourName),
                        Notification.NotificationType.SUCCESS,
                        link
                    );
                    log.info("Sent review approved notification for review ID: {}", review.getId());
                    break;
                    
                case REJECTED:
                    notificationService.createNotificationForUser(
                        userId,
                        "Đánh giá bị từ chối",
                        String.format("Đánh giá của bạn về tour '%s' không được phê duyệt. Vui lòng kiểm tra nội dung và gửi lại.", 
                            tourName),
                        Notification.NotificationType.WARNING,
                        link
                    );
                    log.info("Sent review rejected notification for review ID: {}", review.getId());
                    break;
                    
                default:
                    log.debug("No notification sent for review status: {}", newStatus);
            }
        } catch (Exception e) {
            log.error("Failed to send review status notification for review ID: {}", review.getId(), e);
        }
    }
    
    /**
     * Send notification when admin replies to review
     */
    private void sendAdminReplyNotification(Review review) {
        try {
            Long userId = review.getUser().getId();
            String tourName = review.getTour().getName();
            String link = "/tours/" + review.getTour().getId() + "/reviews";
            
            notificationService.createNotificationForUser(
                userId,
                "Quản trị viên đã phản hồi",
                String.format("Quản trị viên đã phản hồi đánh giá của bạn về tour '%s'. Xem ngay!", 
                    tourName),
                Notification.NotificationType.INFO,
                link
            );
            
            log.info("Sent admin reply notification for review ID: {}", review.getId());
        } catch (Exception e) {
            log.error("Failed to send admin reply notification for review ID: {}", review.getId(), e);
        }
    }
}

