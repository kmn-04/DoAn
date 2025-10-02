import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { DashboardLayout, DashboardLoadingState, DashboardEmptyState } from '../../components/dashboard';
import { Button } from '../../components/ui';
import { reviewService, type ReviewResponse } from '../../services/reviewService';
import toast from 'react-hot-toast';

const MyReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Đã xóa đánh giá thành công');
      loadReviews(); // Reload
    } catch (error: any) {
      console.error('Error deleting review:', error);
      const message = error?.response?.data?.error || 'Không thể xóa đánh giá';
      toast.error(message);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      Approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bị từ chối' },
    };

    const badge = badges[status as keyof typeof badges] || badges.Pending;

    return (
      <span className={`${badge.bg} ${badge.text} text-xs px-2 py-1 rounded-full font-medium`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoadingState message="Đang tải đánh giá..." />
      </DashboardLayout>
    );
  }

  if (reviews.length === 0) {
    return (
      <DashboardLayout>
        <DashboardEmptyState
          title="Chưa có đánh giá nào"
          description="Bạn chưa viết đánh giá cho tour nào. Hãy hoàn thành một chuyến đi và chia sẻ trải nghiệm của bạn!"
          action={{
            label: 'Xem tour đã đặt',
            to: '/bookings'
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các đánh giá của bạn về các tour đã tham gia
          </p>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Tour Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    {review.tour.mainImage && (
                      <img
                        src={review.tour.mainImage}
                        alt={review.tour.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <Link
                        to={`/tours/${review.tour.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {review.tour.name}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {formatDate(review.createdAt)}
                        </span>
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Phản hồi từ quản trị viên:
                      </p>
                      <p className="text-sm text-blue-800">{review.adminReply}</p>
                      {review.repliedAt && (
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDate(review.repliedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <span>{review.helpfulCount} người thấy hữu ích</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Link to={`/tours/${review.tour.slug}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Xem tour
                    </Button>
                  </Link>

                  {review.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info('Chức năng chỉnh sửa đang được phát triển');
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        onClick={() => handleDelete(review.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyReviewsPage;

