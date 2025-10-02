import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../ui';
import { reviewService, type ReviewCreateRequest } from '../../services';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  tourId: number;
  bookingId: number;
  tourName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  tourId,
  bookingId,
  tourName,
  onSuccess,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: ReviewCreateRequest = {
        tourId,
        bookingId,
        rating,
        comment: comment.trim()
      };

      await reviewService.createReview(request);
      
      toast.success('Đánh giá của bạn đã được gửi thành công! Chúng tôi sẽ duyệt và hiển thị sớm nhất.');
      
      // Reset form
      setRating(5);
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const message = error?.response?.data?.error || 'Có lỗi xảy ra khi gửi đánh giá';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Viết đánh giá cho "{tourName}"
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                {star <= (hoverRating || rating) ? (
                  <StarIcon className="h-10 w-10 text-yellow-400" />
                ) : (
                  <StarOutlineIcon className="h-10 w-10 text-gray-300" />
                )}
              </button>
            ))}
            <span className="ml-3 text-lg font-medium text-gray-900">
              {rating > 0 ? `${rating}/5` : 'Chọn số sao'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {rating === 5 && 'Tuyệt vời!'}
            {rating === 4 && 'Rất tốt'}
            {rating === 3 && 'Tốt'}
            {rating === 2 && 'Bình thường'}
            {rating === 1 && 'Cần cải thiện'}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét của bạn <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này... (Tối thiểu 10 ký tự)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
            minLength={10}
            maxLength={1000}
          />
          <div className="mt-1 flex justify-between items-center text-sm text-gray-500">
            <span>Tối thiểu 10 ký tự, tối đa 1000 ký tự</span>
            <span className={comment.length > 1000 ? 'text-red-500' : ''}>
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Lưu ý:</span> Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai. 
            Chúng tôi khuyến khích bạn chia sẻ trải nghiệm thật và chi tiết để giúp ích cho những khách hàng khác.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

