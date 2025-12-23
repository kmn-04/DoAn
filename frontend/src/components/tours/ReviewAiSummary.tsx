import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import reviewService from '../../services/reviewService';
import type { ReviewAiSummary as ReviewAiSummaryType } from '../../services/reviewService';

interface ReviewAiSummaryProps {
  tourId: number;
}

const ReviewAiSummary: React.FC<ReviewAiSummaryProps> = ({ tourId }) => {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<ReviewAiSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reviewService.getAiSummary(tourId);
        setSummary(data);
      } catch (err: unknown) {
        console.error('Error fetching AI summary:', err);
        const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(errorMessage || t('tours.reviews.aiSummary.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [tourId, t]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 bg-gray-300 rounded"></div>
          <div className="h-6 w-48 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Không hiển thị gì nếu có lỗi
  }

  if (!summary) {
    return null; // Không hiển thị gì nếu không có summary
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-base font-medium text-gray-900">
            {t('tours.reviews.aiSummary.title', { defaultValue: 'Tóm tắt đánh giá từ AI' })}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {summary.totalReviews > 0 && (
            <>
              <span>📊 {summary.totalReviews}</span>
              <span>⭐ {(summary.averageRating || 0).toFixed(1)}</span>
            </>
          )}
          {summary.cached && (
            <span className="text-green-600">• {t('tours.reviews.aiSummary.cached', { defaultValue: 'Cached' })}</span>
          )}
        </div>
      </div>

      {/* Overall Summary */}
      {summary.summary ? (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{summary.summary}</p>
      ) : (
        <p className="text-sm text-gray-500 mb-3">
          {summary.totalReviews === 0 
            ? 'Hiện tại chưa có đánh giá nào cho tour này.'
            : 'Đang tạo tóm tắt đánh giá...'
          }
        </p>
      )}

      {/* Positive & Negative Points */}
      {(summary.positive || summary.negative) && (
        <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-stone-200">
          {/* Positive Points */}
          {summary.positive && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-medium text-green-900 mb-1">{t('tours.reviews.aiSummary.positive.title', { defaultValue: 'Điểm tích cực' })}</h4>
                <p className="text-xs text-green-700 leading-relaxed">{summary.positive}</p>
              </div>
            </div>
          )}

          {/* Negative Points */}
          {summary.negative && (
            <div className="flex items-start gap-2">
              <XCircleIcon className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-medium text-red-900 mb-1">{t('tours.reviews.aiSummary.negative.title', { defaultValue: 'Điểm cần cải thiện' })}</h4>
                <p className="text-xs text-red-700 leading-relaxed">{summary.negative}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer - Compact */}
      <div className="mt-3 pt-2 border-t border-stone-100 text-xs text-gray-400 text-center">
        {t('tours.reviews.aiSummary.footer.createdBy', { defaultValue: 'Tóm tắt được tạo bởi AI' })} • {new Date(summary.generatedAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </div>
    </div>
  );
};

export default ReviewAiSummary;

