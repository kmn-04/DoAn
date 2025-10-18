import React, { useState, useEffect } from 'react';
import { 
  StarIcon,
  UserCircleIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { reviewService } from '../../services';

interface Review {
  id: number;
  user?: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  rating: number;
  comment: string;
  status: string;
  helpfulCount: number;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  adminReply?: string;
  repliedAt?: string;
  bookingId?: number;
  tour?: {
    id: number;
    name: string;
    slug: string;
    mainImage?: string;
  };
}

interface TourReviewsProps {
  tourId: number;
  overallRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}


const TourReviews: React.FC<TourReviewsProps> = ({
  tourId,
  overallRating,
  totalReviews,
  ratingDistribution
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Like review state
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());
  
  // Load reviews from API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const data = await reviewService.getTourReviews(tourId);
        setReviews(data);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    loadReviews();
  }, [tourId]);
  
  // Check if user can review (only if authenticated and has completed tour)
  useEffect(() => {
    const checkCanReview = async () => {
      if (!isAuthenticated || !user) {
        setCanReview(false);
        return;
      }
      
      try {
        // Check if user has completed booking for this tour
        const canUserReview = await reviewService.canUserReviewTour(tourId);
        setCanReview(canUserReview);
      } catch (error) {
        console.error('Error checking review permission:', error);
        setCanReview(false);
      }
    };
    
    checkCanReview();
  }, [isAuthenticated, user, tourId]);
  
  // Handle like review
  const handleLikeReview = async (reviewId: number) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thích đánh giá');
      return;
    }
    
    try {
      // Call API and get updated review from backend
      const updatedReview = await reviewService.voteHelpful(reviewId);
      
      // Update reviews with backend response
      setReviews(prevReviews => 
        prevReviews.map(r => 
          r.id === reviewId 
            ? { ...r, helpfulCount: updatedReview.helpfulCount }
            : r
        )
      );
      
      // Update liked state based on backend response
      // Backend toggles, so we track if count increased or decreased
      const currentReview = reviews.find(r => r.id === reviewId);
      if (currentReview) {
        const didIncrease = updatedReview.helpfulCount > currentReview.helpfulCount;
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          if (didIncrease) {
            newSet.add(reviewId);
          } else {
            newSet.delete(reviewId);
          }
          return newSet;
        });
      }
      
    } catch (error) {
      console.error('Error liking review:', error);
      alert('Có lỗi xảy ra khi đánh giá. Vui lòng thử lại.');
    }
  };
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) return;
    
    // Validate comment length
    const commentLength = reviewComment.trim().length;
    if (commentLength < 10) {
      setReviewError('Nhận xét phải có ít nhất 10 ký tự');
      return;
    }
    if (commentLength > 1000) {
      setReviewError('Nhận xét không được vượt quá 1000 ký tự');
      return;
    }
    
    setReviewError('');
    
    try {
      setIsSubmittingReview(true);
      
      // Find user's booking for this tour
      const userBookings = await fetch(`http://localhost:8080/api/bookings/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());
      
      const tourBooking = userBookings.data?.find((b: any) => 
        b.tour?.id === tourId && 
        (b.confirmationStatus === 'COMPLETED' || b.confirmationStatus === 'CONFIRMED') &&
        b.paymentStatus === 'PAID'
      );
      
      if (!tourBooking) {
        setReviewError('Không tìm thấy booking hợp lệ cho tour này');
        return;
      }
      
      // Submit review
      await reviewService.createReview({
        tourId: tourId,
        bookingId: tourBooking.id,
        rating: reviewRating,
        comment: reviewComment
      });
      
      alert('Đánh giá của bạn đã được gửi thành công!');
      
      // Reset form
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
      setReviewError('');
      setCanReview(false);
      
      // Reload reviews
      const data = await reviewService.getTourReviews(tourId);
      setReviews(data);
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      setReviewError(errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const filteredReviews = filterRating 
    ? sortedReviews.filter(review => review.rating === filterRating)
    : sortedReviews;

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Reviews Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Đánh giá từ khách hàng
        </h3>

        {/* Overall Rating */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{overallRating}</div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(overallRating), 'lg')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {totalReviews} đánh giá
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 max-w-md space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{rating} sao</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${((ratingDistribution[rating] || 0) / totalReviews) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div className="flex flex-wrap items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
            <option value="helpful">Hữu ích nhất</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Hiển thị {displayedReviews.length} / {filteredReviews.length} đánh giá
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            {/* Review Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                {review.user?.avatarUrl ? (
                  <img
                    src={review.user.avatarUrl}
                    alt={review.user?.name || 'User'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{review.user?.name || 'Người dùng ẩn danh'}</h4>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating, 'sm')}
                    <span className="font-medium">{review.rating}/5</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="ml-16">
              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm">
                <button 
                  onClick={() => handleLikeReview(review.id)}
                  className={`flex items-center space-x-1 transition-colors ${
                    likedReviews.has(review.id) 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <HandThumbUpIcon className={`h-4 w-4 ${likedReviews.has(review.id) ? 'fill-blue-600' : ''}`} />
                  <span>Hữu ích ({review.helpfulCount || 0})</span>
                </button>
              </div>

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-blue-900">Phản hồi từ Quản trị viên</span>
                        {review.repliedAt && (
                          <span className="text-xs text-blue-600">
                            • {formatDate(review.repliedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-800 text-sm leading-relaxed">{review.adminReply}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {filteredReviews.length > 3 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="px-8 py-2"
          >
            {showAllReviews 
              ? 'Thu gọn đánh giá' 
              : `Xem thêm ${filteredReviews.length - 3} đánh giá`
            }
          </Button>
        </div>
      )}

      {/* Write Review CTA */}
      <div className="mt-8 pt-6 border-t">
        <div className="text-center">
          {!isAuthenticated ? (
            // Not logged in
            <>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Đăng nhập để viết đánh giá
              </h4>
              <p className="text-gray-600 mb-4">
                Bạn cần đăng nhập và hoàn thành tour để có thể đánh giá
              </p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
              >
                <LockClosedIcon className="h-5 w-5 inline mr-2" />
                Đăng nhập
              </Button>
            </>
          ) : canReview ? (
            // Can write review
            <>
              {!showReviewModal ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Bạn đã từng tham gia tour này?
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Chia sẻ trải nghiệm của bạn để giúp những khách hàng khác
                  </p>
                  <Button 
                    onClick={() => setShowReviewModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    Viết đánh giá
                  </Button>
                </>
              ) : (
                // Inline review form
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Viết đánh giá của bạn
                  </h4>
                  
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá *
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <StarSolidIcon
                            className={`h-8 w-8 ${
                              star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {reviewRating}/5
                      </span>
                    </div>
                  </div>
                  
                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhận xét *
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => {
                        setReviewComment(e.target.value);
                        if (reviewError) setReviewError('');
                      }}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm ${
                        reviewError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Chia sẻ trải nghiệm của bạn về tour này (10-1000 ký tự)..."
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs ${reviewComment.length < 10 || reviewComment.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                        {reviewComment.length}/1000 ký tự (tối thiểu 10)
                      </p>
                    </div>
                    {reviewError && (
                      <p className="mt-1 text-xs text-red-500">
                        {reviewError}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowReviewModal(false);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Hủy
                    </button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || reviewComment.trim().length < 10 || reviewComment.trim().length > 1000}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                  </div>
                  
                  <p className="mt-3 text-xs text-gray-500">
                    Đánh giá sẽ được hiển thị ngay sau khi gửi
                  </p>
                </div>
              )}
            </>
          ) : (
            // Cannot write review (no completed booking)
            <>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Bạn chưa thể đánh giá tour này
              </h4>
              <p className="text-gray-600 mb-4">
                Chỉ khách hàng đã hoàn thành tour mới có thể viết đánh giá
              </p>
              <Button 
                disabled
                className="bg-gray-300 text-gray-600 px-6 py-2 cursor-not-allowed"
              >
                <LockClosedIcon className="h-5 w-5 inline mr-2" />
                Chưa thể đánh giá
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourReviews;
