import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCircleIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  LockClosedIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { reviewService } from '../../services';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Review interface is defined but not used directly in this component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  onReviewSubmitted?: () => void; // Callback to refresh stats from parent
}


const TourReviews: React.FC<TourReviewsProps> = ({
  tourId,
  overallRating,
  totalReviews,
  ratingDistribution,
  onReviewSubmitted
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState<Array<{
    id: number;
    user?: {
      id: number;
      name: string;
      avatarUrl?: string;
    };
    rating: number;
    comment?: string;
    status: string;
    helpfulCount: number;
    images?: string[];
    createdAt: string;
    updatedAt?: string;
    adminReply?: string;
    repliedAt?: string;
  }>>([]);
  const [canReview, setCanReview] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      window.alert(t('tours.reviews.loginToLike'));
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
      window.alert(t('tours.reviews.helpfulError'));
    }
  };
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) return;
    
    // Validate comment length
    const commentLength = reviewComment.trim().length;
    if (commentLength < 10) {
      setReviewError(t('tours.reviews.commentTooShort'));
      return;
    }
    if (commentLength > 1000) {
      setReviewError(t('tours.reviews.commentTooLong'));
      return;
    }
    
    setReviewError('');
    
    try {
      setIsSubmittingReview(true);
      
      // Find user's booking for this tour
      const userBookings = await fetch(`http://localhost:8080/api/bookings/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());
      
      const tourBooking = userBookings.data?.find((b: {
        tour?: { id: number };
        confirmationStatus: string;
        paymentStatus: string;
        id: number;
      }) => 
        b.tour?.id === tourId && 
        (b.confirmationStatus === 'COMPLETED' || b.confirmationStatus === 'CONFIRMED') &&
        b.paymentStatus === 'PAID'
      );
      
      if (!tourBooking) {
        setReviewError(t('tours.reviews.noBooking'));
        return;
      }
      
      // Submit review
      await reviewService.createReview({
        tourId: tourId,
        bookingId: tourBooking.id,
        rating: reviewRating,
        comment: reviewComment,
        images: reviewImages.length > 0 ? reviewImages : undefined
      });
      
      window.alert(t('tours.reviews.submitSuccess'));
      
      // Reset form
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
      setReviewImages([]);
      setReviewError('');
      setCanReview(false);
      
      // Reload reviews
      const data = await reviewService.getTourReviews(tourId);
      setReviews(data);
      
      // Notify parent to refresh rating stats
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      const errorMsg = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error 
        || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message;
      setReviewError(errorMsg || t('tours.reviews.submitError'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = 5 - reviewImages.length;

    if (fileArray.length > remainingSlots) {
      toast.error(t('tours.reviews.form.images.tooMany', { count: remainingSlots }));
      return;
    }

    // Validate file types
    const invalidFiles = fileArray.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error(t('tours.reviews.form.images.invalidType'));
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(t('tours.reviews.form.images.tooLarge'));
      return;
    }

    setIsUploadingImages(true);

    try {
      const formData = new FormData();
      fileArray.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/upload/review-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrls = response.data?.data || [];
      setReviewImages(prev => [...prev, ...imageUrls]);
      toast.success(t('tours.reviews.form.images.uploadSuccess'));
    } catch (err) {
      console.error('Error uploading images:', err);
      toast.error(t('tours.reviews.form.images.uploadError'));
    } finally {
      setIsUploadingImages(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
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
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
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
          {t('tours.reviews.title')}
        </h3>

        {/* Overall Rating */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {overallRating > 0 ? overallRating.toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(overallRating), 'lg')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {t('tours.reviews.count', { count: totalReviews })}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 max-w-md space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-8">{t('tours.reviews.ratingLabel', { rating })}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        minWidth: count > 0 ? '2px' : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div className="flex flex-wrap items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">{t('tours.reviews.sort.newest')}</option>
            <option value="oldest">{t('tours.reviews.sort.oldest')}</option>
            <option value="highest">{t('tours.reviews.sort.highest')}</option>
            <option value="lowest">{t('tours.reviews.sort.lowest')}</option>
            <option value="helpful">{t('tours.reviews.sort.helpful')}</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('tours.reviews.filter.all')}</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {t('tours.reviews.filter.value', { rating })}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {t('tours.reviews.showing', { display: displayedReviews.length, total: filteredReviews.length })}
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
                  <h4 className="font-semibold text-gray-900">{review.user?.name || t('tours.reviews.anonymous')}</h4>
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
                  {review.images.map((image: string, index: number) => (
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
                  <span>{t('tours.reviews.helpful', { count: review.helpfulCount || 0 })}</span>
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
                        <span className="font-semibold text-blue-900">{t('tours.reviews.adminReply')}</span>
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
              ? t('tours.reviews.collapse') 
              : t('tours.reviews.loadMore', { count: filteredReviews.length - 3 })
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
                {t('tours.reviews.loginTitle')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('tours.reviews.loginDescription')}
              </p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
              >
                <LockClosedIcon className="h-5 w-5 inline mr-2" />
                {t('tours.reviews.loginButton')}
              </Button>
            </>
          ) : canReview ? (
            // Can write review
            <>
              {!showReviewModal ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('tours.reviews.ctaTitle')}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {t('tours.reviews.ctaDescription')}
                  </p>
                  <Button 
                    onClick={() => setShowReviewModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    {t('tours.reviews.ctaButton')}
                  </Button>
                </>
              ) : (
                // Inline review form
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('tours.reviews.formTitle')}
                  </h4>
                  
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tours.reviews.ratingField')}
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
                      {t('tours.reviews.commentField')}
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
                      placeholder={t('tours.reviews.commentPlaceholder')}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs ${reviewComment.length < 10 || reviewComment.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                        {t('tours.reviews.commentCounter', { count: reviewComment.length })}
                      </p>
                    </div>
                    {reviewError && (
                      <p className="mt-1 text-xs text-red-500">
                        {reviewError}
                      </p>
                    )}
                  </div>
                  
                  {/* Images Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tours.reviews.form.images.label')}
                      <span className="text-gray-500 text-xs ml-2">({t('tours.reviews.form.images.max')})</span>
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <div className="space-y-3">
                      {/* Upload Button */}
                      {reviewImages.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImages}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {isUploadingImages 
                                ? t('tours.reviews.form.images.uploading')
                                : t('tours.reviews.form.images.upload')
                              }
                            </span>
                          </div>
                        </button>
                      )}

                      {/* Image Preview */}
                      {reviewImages.length > 0 && (
                        <div className="grid grid-cols-5 gap-2">
                          {reviewImages.map((imageUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowReviewModal(false);
                        setReviewRating(5);
                        setReviewComment('');
                        setReviewImages([]);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {t('tours.reviews.cancel')}
                    </button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || reviewComment.trim().length < 10 || reviewComment.trim().length > 1000}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReview ? t('tours.reviews.submitting') : t('tours.reviews.submit')}
                    </Button>
                  </div>
                  
                  <p className="mt-3 text-xs text-gray-500">
                    {t('tours.reviews.note')}
                  </p>
                </div>
              )}
            </>
          ) : (
            // Cannot write review (no completed booking)
            <>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {t('tours.reviews.cannotTitle')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('tours.reviews.cannotDescription')}
              </p>
              <Button 
                disabled
                className="bg-gray-300 text-gray-600 px-6 py-2 cursor-not-allowed"
              >
                <LockClosedIcon className="h-5 w-5 inline mr-2" />
                {t('tours.reviews.cannotButton')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourReviews;
