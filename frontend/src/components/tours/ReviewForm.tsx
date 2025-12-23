import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../ui';
import { reviewService, type ReviewCreateRequest } from '../../services';
import api from '../../services/api';
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
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined
      };

      await reviewService.createReview(request);
      
      toast.success(t('tours.reviews.form.success'));
      
      // Reset form
      setRating(5);
      setComment('');
      setImages([]);
      
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = 5 - images.length;

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
      setImages(prev => [...prev, ...imageUrls]);
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
    setImages(prev => prev.filter((_, i) => i !== index));
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

        {/* Images Upload */}
        <div>
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
            {images.length < 5 && (
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
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((imageUrl, index) => (
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

