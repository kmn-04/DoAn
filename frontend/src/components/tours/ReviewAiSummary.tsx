import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import reviewService from '../../services/reviewService';
import type { ReviewAiSummary as ReviewAiSummaryType } from '../../services/reviewService';

interface ReviewAiSummaryProps {
  tourId: number;
}

const ReviewAiSummary: React.FC<ReviewAiSummaryProps> = ({ tourId }) => {
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
      } catch (err: any) {
        console.error('Error fetching AI summary:', err);
        setError(err.response?.data?.message || 'Không thể tải tóm tắt AI');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [tourId]);

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

  if (error || !summary) {
    return null; // Không hiển thị gì nếu có lỗi
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">
          Tóm tắt đánh giá từ AI
        </h3>
        {summary.cached && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Cached
          </span>
        )}
      </div>

      {/* Overall Summary */}
      {summary.summary && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span>📊 {summary.totalReviews} đánh giá</span>
            <span>⭐ {summary.averageRating?.toFixed(1)}/5</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Positive Points */}
        {summary.positive && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Điểm tích cực</h4>
                <p className="text-sm text-green-800 whitespace-pre-line">{summary.positive}</p>
              </div>
            </div>
          </div>
        )}

        {/* Negative Points */}
        {summary.negative && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start gap-2 mb-2">
              <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Điểm cần cải thiện</h4>
                <p className="text-sm text-red-800 whitespace-pre-line">{summary.negative}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Tóm tắt được tạo bởi AI • Cập nhật: {new Date(summary.generatedAt).toLocaleString('vi-VN')}
      </div>
    </div>
  );
};

export default ReviewAiSummary;

