import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('tours.reviews.form.errors.ratingRequired'));
      return;
    }

    if (comment.trim().length < 10) {
      toast.error(t('tours.reviews.form.errors.commentMinLength'));
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
      
      toast.success(t('tours.reviews.form.success'));
      
      // Reset form
      setRating(5);
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      const message = (error as any)?.response?.data?.error || t('tours.reviews.form.errors.submitError');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {t('tours.reviews.form.title', { tourName })}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('tours.reviews.form.rating.label')} <span className="text-red-500">*</span>
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
              {rating > 0 ? `${rating}/5` : t('tours.reviews.form.rating.select')}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t(`tours.reviews.form.rating.labels.${rating}` as any)}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            {t('tours.reviews.form.comment.label')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('tours.reviews.form.comment.placeholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
            minLength={10}
            maxLength={1000}
          />
          <div className="mt-1 flex justify-between items-center text-sm text-gray-500">
            <span>{t('tours.reviews.form.comment.minMax')}</span>
            <span className={comment.length > 1000 ? 'text-red-500' : ''}>
              {t('tours.reviews.form.comment.counter', { count: comment.length })}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{t('tours.reviews.form.note.title')}</span> {t('tours.reviews.form.note.message')}
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
              {t('tours.reviews.form.buttons.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isSubmitting ? t('tours.reviews.form.buttons.submitting') : t('tours.reviews.form.buttons.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

