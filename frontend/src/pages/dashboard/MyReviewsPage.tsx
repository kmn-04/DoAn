import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StarIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { DashboardLayout, DashboardLoadingState, DashboardEmptyState } from '../../components/dashboard';
import { Button } from '../../components/ui';
import reviewService, { type ReviewResponse } from '../../services/reviewService';
import toast from 'react-hot-toast';
import i18n from '../../i18n';

const MyReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

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
      toast.error(t('dashboard.reviews.toast.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm(t('dashboard.reviews.toast.deleteConfirm'))) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success(t('dashboard.reviews.toast.deleteSuccess'));
      loadReviews();
    } catch (error: unknown) {
      console.error('Error deleting review:', error);
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || t('dashboard.reviews.toast.deleteError');
      toast.error(message);
    }
  };

  const handleEditClick = (review: ReviewResponse) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleEditSubmit = async () => {
    if (!editingReview) return;

    if (!editForm.comment.trim()) {
      toast.error(t('dashboard.reviews.toast.commentRequired'));
      return;
    }

    try {
      await reviewService.updateReview(editingReview.id, {
        rating: editForm.rating,
        comment: editForm.comment
      });
      toast.success(t('dashboard.reviews.toast.updateSuccess'));
      setEditingReview(null);
      loadReviews();
    } catch (error: unknown) {
      console.error('Error updating review:', error);
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || t('dashboard.reviews.toast.updateError');
      toast.error(message);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5`}
            style={{ color: star <= rating ? '#D4AF37' : '#e5e7eb' }}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: t('dashboard.reviews.status.pending') },
      Approved: { bg: 'bg-green-100', text: 'text-green-800', label: t('dashboard.reviews.status.approved') },
      Rejected: { bg: 'bg-red-100', text: 'text-red-800', label: t('dashboard.reviews.status.rejected') },
    };

    const badge = badges[status as keyof typeof badges] || badges.Pending;

    return (
      <span className={`${badge.bg} ${badge.text} text-xs px-3 py-1 rounded-none font-medium border border-${badge.bg.replace('bg-', '')}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoadingState message={t('dashboard.reviews.loading')} />
      </DashboardLayout>
    );
  }

  if (reviews.length === 0) {
    return (
      <DashboardLayout>
        <DashboardEmptyState
          title={t('dashboard.reviews.empty.title')}
          description={t('dashboard.reviews.empty.description')}
          action={{
            label: t('dashboard.reviews.empty.viewBookings'),
            to: '/bookings'
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-normal text-slate-900 tracking-tight">{t('dashboard.reviews.title')}</h1>
          <p className="mt-2 text-gray-600 font-normal">
            {t('dashboard.reviews.subtitle')}
          </p>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-white rounded-none border border-stone-200 p-6 hover:border-slate-700 hover:shadow-lg transition-all animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Tour Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    {review.tour.mainImage && (
                      <img
                        src={review.tour.mainImage}
                        alt={review.tour.name}
                        className="h-20 w-20 rounded-none object-cover border border-stone-200"
                      />
                    )}
                    <div>
                      <Link
                        to={`/tours/${review.tour.slug}`}
                        className="text-lg font-semibold text-slate-900 hover:opacity-80 transition-opacity tracking-tight"
                      >
                        {review.tour.name}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600 font-normal">
                          {formatDate(review.createdAt)}
                        </span>
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-gray-700 leading-relaxed mb-4 font-normal">
                    {review.comment}
                  </p>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="bg-amber-50 border-l-4 p-5 mt-4 rounded-none" style={{ borderColor: '#D4AF37' }}>
                      <p className="text-sm font-semibold text-slate-900 mb-2 tracking-tight">
                        {t('dashboard.reviews.adminReply')}
                      </p>
                      <p className="text-sm text-gray-700 font-normal leading-relaxed">{review.adminReply}</p>
                      {review.repliedAt && (
                        <p className="text-xs text-gray-500 mt-2 font-normal">
                          {formatDate(review.repliedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600 font-normal">
                    <span className="flex items-center">
                      <span className="font-semibold" style={{ color: '#D4AF37' }}>{review.helpfulCount}</span>
                      <span className="ml-1">{t('dashboard.reviews.helpful', { count: review.helpfulCount })}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Link to={`/tours/${review.tour.slug}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-2 border-stone-300 hover:border-slate-900 rounded-none"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {t('dashboard.reviews.actions.viewTour')}
                    </Button>
                  </Link>

                  {review.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-2 border-stone-300 hover:border-slate-900 rounded-none"
                        onClick={() => handleEditClick(review)}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        {t('dashboard.reviews.actions.edit')}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-2 border-red-300 hover:border-red-400 rounded-none"
                        onClick={() => handleDelete(review.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {t('dashboard.reviews.actions.delete')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-2xl font-normal text-slate-900 tracking-tight">
                  {t('dashboard.reviews.editModal.title')}
                </h2>
                <p className="text-sm text-gray-600 mt-1 font-normal">
                  {editingReview.tour.name}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.reviews.editModal.ratingRequired')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <StarIcon
                          className="h-8 w-8"
                          style={{ color: star <= editForm.rating ? '#D4AF37' : '#e5e7eb' }}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-lg font-medium text-slate-900">
                      {editForm.rating}/5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.reviews.editModal.commentRequired')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal transition-all"
                    placeholder={t('dashboard.reviews.editModal.commentPlaceholder')}
                  />
                  <p className="mt-2 text-sm text-gray-500 font-normal">
                    {t('dashboard.reviews.editModal.characters', { count: editForm.comment.length })}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-stone-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingReview(null)}
                  className="border-2 border-stone-300 hover:border-slate-900 rounded-none"
                >
                  {t('dashboard.reviews.editModal.cancel')}
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  className="text-white rounded-none hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  {t('dashboard.reviews.editModal.save')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyReviewsPage;

