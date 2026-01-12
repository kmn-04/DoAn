import React, { useState, useEffect } from 'react';
import { 
  EyeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface Review {
  id: number;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  helpfulCount: number;
  images?: string[];
  adminReply?: string;
  repliedAt?: string;
  bookingId?: number;
  user?: {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  tour?: {
    id: number;
    name: string;
    slug: string;
    mainImage?: string;
  };
  // Computed properties for backward compatibility
  tourName?: string;
  userName?: string;
  userEmail?: string;
  tourId?: number;
  userId?: number;
  isSuspicious?: boolean;
  isSpam?: boolean;
  aiAnalysis?: string;
  tags?: string;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // AI Analysis modal
  const [isAiAnalysisModalOpen, setIsAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') {
      setCurrentPage(0);
    }
  }, [searchTerm, statusFilter, ratingFilter]);

  useEffect(() => {
    fetchReviews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, ratingFilter, sortBy, sortDirection]);

  const fetchReviews = async (page: number) => {
    try {
      setLoading(true);
      
      // Fetch ALL when filtering, otherwise use pagination
      const shouldFetchAll = searchTerm || statusFilter !== 'all' || ratingFilter !== 'all';
      const pageSize = 10;
      const response = await apiClient.get(`/admin/reviews?page=${shouldFetchAll ? 0 : page}&size=${shouldFetchAll ? 1000 : pageSize}&sortBy=${sortBy}&direction=${sortDirection}`);
      
      // Map nested structure to flat structure
      let filteredData = (response.data.data?.content || []).map((review: Review) => ({
        ...review,
        tourName: review.tour?.name || 'N/A',
        userName: review.user?.name || 'Anonymous',
        userEmail: review.user?.email || '',
        tourId: review.tour?.id,
        userId: review.user?.id
      }));
      
      // Apply filters
      if (searchTerm) {
        filteredData = filteredData.filter((review: Review) =>
          review.tourName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter((r: Review) => r.status === statusFilter);
      }
      if (ratingFilter !== 'all') {
        const rating = parseInt(ratingFilter);
        filteredData = filteredData.filter((r: Review) => r.rating === rating);
      }
      
      // Apply sorting
      filteredData.sort((a: Review, b: Review) => {
        let compareA: string | number | undefined = a[sortBy as keyof Review] as string | number | undefined;
        let compareB: string | number | undefined = b[sortBy as keyof Review] as string | number | undefined;
        
        if (compareA === undefined) compareA = '';
        if (compareB === undefined) compareB = '';
        
        if (typeof compareA === 'string' && typeof compareB === 'string') {
          compareA = compareA.toLowerCase();
          compareB = compareB.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      });
      
      // Client-side pagination when filtering
      if (shouldFetchAll) {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setReviews(paginatedData);
        setTotalPages(Math.ceil(filteredData.length / pageSize));
        setTotalElements(filteredData.length);
        setFilteredCount(filteredData.length);
        
        // Calculate stats from ALL filtered data
        const total = filteredData.length;
        const approved = filteredData.filter((r: Review) => r.status === 'APPROVED').length;
        const pending = filteredData.filter((r: Review) => r.status === 'PENDING').length;
        const rejected = filteredData.filter((r: Review) => r.status === 'REJECTED').length;
        setStats({ total, approved, pending, rejected });
      } else {
        setReviews(filteredData);
        setTotalPages(response.data.data?.totalPages || 0);
        setTotalElements(response.data.data?.totalElements || 0);
        setFilteredCount(response.data.data?.totalElements || 0);
        
        // Calculate stats from current page
        const total = filteredData.length;
        const approved = filteredData.filter((r: Review) => r.status === 'APPROVED').length;
        const pending = filteredData.filter((r: Review) => r.status === 'PENDING').length;
        const rejected = filteredData.filter((r: Review) => r.status === 'REJECTED').length;
        setStats({ total, approved, pending, rejected });
      }
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReview(null);
    setReplyText('');
    setIsReplying(false);
    setIsAiAnalysisModalOpen(false);
    setAiAnalysisResult(null);
  };

  const handleApprove = async (reviewId: number) => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/reviews/${reviewId}/approve`);
      alert('Đã duyệt đánh giá thành công!');
      await fetchReviews(currentPage);
      if (selectedReview?.id === reviewId) {
        closeDetailModal();
      }
    } catch (error) {
      console.error('Error approving review:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể duyệt đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      setLoading(true);
      const reason = prompt('Nhập lý do từ chối (tùy chọn):');
      await apiClient.patch(`/admin/reviews/${reviewId}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
      alert('Đã từ chối đánh giá thành công!');
      await fetchReviews(currentPage);
      if (selectedReview?.id === reviewId) {
        closeDetailModal();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể từ chối đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId: number, newStatus: string) => {
    try {
      setLoading(true);
      let endpoint = '';
      if (newStatus === 'APPROVED') {
        await handleApprove(reviewId);
        return;
      } else if (newStatus === 'REJECTED') {
        await handleReject(reviewId);
        return;
      } else if (newStatus === 'PENDING') {
        endpoint = `/admin/reviews/${reviewId}/status?status=PENDING`;
        await apiClient.patch(endpoint);
      }
      await fetchReviews(currentPage);
    } catch (error) {
      console.error('Error updating review status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái đánh giá');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setLoading(true);

      
      await apiClient.post(`/admin/reviews/${selectedReview.id}/reply`, {
        reply: replyText
      });
      

      alert('Đã gửi phản hồi thành công!');
      setIsReplying(false);
      await fetchReviews(currentPage);
      closeDetailModal();
    } catch (error) {
      console.error('Error submitting reply:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể gửi phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedReview) return;
    
    if (!window.confirm('Bạn có chắc muốn xóa phản hồi này?')) {
      return;
    }

    try {
      setLoading(true);

      
      await apiClient.delete(`/admin/reviews/${selectedReview.id}/reply`);
      

      alert('Đã xóa phản hồi thành công!');
      await fetchReviews(currentPage);
      closeDetailModal();
    } catch (error) {
      console.error('Error deleting reply:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể xóa phản hồi');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalyzeReview = async (reviewId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.post<{ data: Record<string, unknown> }>(`/admin/reviews/${reviewId}/analyze`);
      console.log('AI Analysis Response:', response.data);
      console.log('AI Analysis Data:', response.data.data);
      if (response.data && response.data.data) {
        const analysisData = response.data.data;
        console.log('hasNegativeKeywords:', analysisData.hasNegativeKeywords, typeof analysisData.hasNegativeKeywords);
        console.log('foundNegativeKeywords:', analysisData.foundNegativeKeywords);
        console.log('hasSpamKeywords:', analysisData.hasSpamKeywords, typeof analysisData.hasSpamKeywords);
        console.log('foundSpamKeywords:', analysisData.foundSpamKeywords);
        setAiAnalysisResult(analysisData);
        setIsAiAnalysisModalOpen(true);
        // Update selected review with analysis data if modal is open
        if (selectedReview && selectedReview.id === reviewId) {
          setSelectedReview({ ...selectedReview, aiAnalysis: JSON.stringify(analysisData) });
        }
      } else {
        alert('Không nhận được dữ liệu phân tích');
      }
      await fetchReviews(currentPage);
    } catch (error) {
      console.error('Error analyzing review:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra khi phân tích review');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkSuspicious = async (reviewId: number, suspicious: boolean) => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/reviews/${reviewId}/mark-suspicious?suspicious=${suspicious}`);
      alert(`Đã ${suspicious ? 'đánh dấu' : 'bỏ đánh dấu'} review là nghi vấn`);
      await fetchReviews(currentPage);
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, isSuspicious: suspicious });
      }
    } catch (error) {
      console.error('Error marking review as suspicious:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkSpam = async (reviewId: number, spam: boolean) => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/reviews/${reviewId}/mark-spam?spam=${spam}`);
      alert(`Đã ${spam ? 'đánh dấu' : 'bỏ đánh dấu'} review là spam`);
      await fetchReviews(currentPage);
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, isSpam: spam });
      }
    } catch (error) {
      console.error('Error marking review as spam:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'admin-badge-green';
      case 'PENDING':
        return 'admin-badge-yellow';
      case 'REJECTED':
        return 'admin-badge-red';
      default:
        return 'admin-badge-gray';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'APPROVED': 'Đã duyệt',
      'PENDING': 'Chờ duyệt',
      'REJECTED': 'Đã từ chối'
    };
    return labels[status] || status;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolid
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý đánh giá</h1>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng đánh giá</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đã duyệt</p>
                <p className="admin-stat-value">{stats.approved}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Chờ duyệt</p>
                <p className="admin-stat-value">{stats.pending}</p>
              </div>
              <div className="admin-stat-icon bg-yellow-100">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đã từ chối</p>
                <p className="admin-stat-value">{stats.rejected}</p>
              </div>
              <div className="admin-stat-icon bg-red-100">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> đánh giá
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tour, người dùng, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Đánh giá</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                <option value="4">⭐⭐⭐⭐ 4 sao</option>
                <option value="3">⭐⭐⭐ 3 sao</option>
                <option value="2">⭐⭐ 2 sao</option>
                <option value="1">⭐ 1 sao</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDirection(dir as 'asc' | 'desc');
                }}
                className="admin-select"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="rating-desc">Đánh giá cao - thấp</option>
                <option value="rating-asc">Đánh giá thấp - cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container overflow-x-auto">
          <table className="admin-table min-w-full">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">ID</th>
                <th className="admin-table-th">Tour</th>
                <th className="admin-table-th">Người dùng</th>
                <th className="admin-table-th">Đánh giá</th>
                <th className="admin-table-th">Tags</th>
                <th className="admin-table-th">Phản hồi</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="admin-loading">
                    <div className="admin-spinner">
                      <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="admin-table-row">
                    <td className="admin-table-td font-semibold text-gray-900">{review.id}</td>
                    <td className="admin-table-td font-medium">{review.tourName}</td>
                    <td className="admin-table-td">
                      <div className="text-sm">
                        <div className="font-medium">{review.userName}</div>
                        <div className="text-gray-500">{review.userEmail}</div>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      {renderStars(review.rating)}
                    </td>
                    <td className="admin-table-td">
                      <div className="flex flex-wrap gap-1">
                        {review.isSuspicious && (
                          <span className="admin-badge bg-orange-100 text-orange-800 text-xs">
                            <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
                            Nghi vấn
                          </span>
                        )}
                        {review.isSpam && (
                          <span className="admin-badge bg-red-100 text-red-800 text-xs">
                            <ShieldExclamationIcon className="h-3 w-3 inline mr-1" />
                            Spam
                          </span>
                        )}
                        {!review.isSuspicious && !review.isSpam && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="admin-table-td">
                      {review.adminReply ? (
                        <div className="flex items-center gap-2">
                          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-blue-600">Đã phản hồi</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Chưa phản hồi</span>
                      )}
                    </td>
                    <td className="admin-table-td">
                      <select
                        key={`status-${review.id}-${review.status}`}
                        value={review.status}
                        onChange={(e) => {

                          handleUpdateStatus(review.id, e.target.value);
                        }}
                        className={`admin-table-select ${getStatusBadge(review.status)}`}
                        disabled={loading}
                      >
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Đã từ chối</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <button
                        onClick={() => openDetailModal(review)}
                        className="admin-icon-btn-view"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 text-center mb-2">
            Hiển thị {reviews.length} / {totalElements} đánh giá
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedReview && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeDetailModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-2xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết đánh giá</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-6">
                  {/* Review Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin đánh giá</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="admin-view-label">Tour</p>
                        <p className="admin-view-value font-semibold">{selectedReview.tourName}</p>
                      </div>
                      <div>
                        <p className="admin-view-label">Người đánh giá</p>
                        <p className="admin-view-value">{selectedReview.userName}</p>
                        <p className="text-sm text-gray-600">{selectedReview.userEmail}</p>
                      </div>
                      <div>
                        <p className="admin-view-label">Số sao</p>
                        <div className="mt-1">
                          {renderStars(selectedReview.rating)}
                        </div>
                      </div>
                      <div>
                        <p className="admin-view-label">Ngày tạo</p>
                        <p className="admin-view-value">{formatDate(selectedReview.createdAt)}</p>
                      </div>
                      <div>
                        <p className="admin-view-label">Trạng thái</p>
                        <p className="admin-view-value">
                          <span className={getStatusBadge(selectedReview.status)}>
                            {getStatusLabel(selectedReview.status)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tổng quan - AI Analysis Overview */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Tổng quan</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Cảm xúc</p>
                        <p className={`font-semibold ${
                          aiAnalysisResult && String(aiAnalysisResult.sentiment || '').toLowerCase() === 'negative' ? 'text-red-600' :
                          aiAnalysisResult && String(aiAnalysisResult.sentiment || '').toLowerCase() === 'positive' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {aiAnalysisResult ? (
                            String(aiAnalysisResult.sentiment || '').toLowerCase() === 'negative' ? 'Tiêu cực' :
                            String(aiAnalysisResult.sentiment || '').toLowerCase() === 'positive' ? 'Tích cực' : 'Trung tính'
                          ) : (
                            <span className="text-gray-400">Chưa phân tích</span>
                          )}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Đánh giá</p>
                        <p className="font-semibold">
                          {aiAnalysisResult ? (
                            `${String(aiAnalysisResult.rating || selectedReview.rating)} ⭐`
                          ) : (
                            `${selectedReview.rating} ⭐`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Nội dung đánh giá</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedReview.comment}
                      </p>
                    </div>
                  </div>

                  {/* Review Images */}
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Hình ảnh ({selectedReview.images.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedReview.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin khác</h4>
                    <div className="space-y-3">
                      {selectedReview.bookingId && (
                        <div>
                          <p className="admin-view-label">Mã booking</p>
                          <p className="admin-view-value font-mono text-blue-600">#{selectedReview.bookingId}</p>
                        </div>
                      )}
                      <div>
                        <p className="admin-view-label">Lượt hữu ích</p>
                        <p className="admin-view-value">👍 {selectedReview.helpfulCount || 0} lượt</p>
                      </div>
                      {selectedReview.createdAt && (
                        <div>
                          <p className="admin-view-label">Cập nhật lần cuối</p>
                          <p className="admin-view-value text-sm text-gray-600">
                            {formatDate(selectedReview.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Reply */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title flex items-center justify-between">
                      <span>Phản hồi của Admin</span>
                      {!isReplying && !selectedReview.adminReply && (
                        <button
                          onClick={() => setIsReplying(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          Thêm phản hồi
                        </button>
                      )}
                    </h4>
                    
                    {selectedReview.adminReply && !isReplying ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-2">
                          {selectedReview.adminReply}
                        </p>
                        {selectedReview.repliedAt && (
                          <p className="text-xs text-gray-500 mb-2">
                            Phản hồi lúc: {formatDate(selectedReview.repliedAt)}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsReplying(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            ✏️ Chỉnh sửa
                          </button>
                          <button
                            onClick={handleDeleteReply}
                            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            disabled={loading}
                          >
                            🗑️ Xóa phản hồi
                          </button>
                        </div>
                      </div>
                    ) : isReplying ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập nội dung phản hồi..."
                          rows={4}
                          className="admin-input"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmitReply}
                            className="admin-btn-primary flex-1"
                            disabled={loading || !replyText.trim()}
                          >
                            {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                          <button
                            onClick={() => {
                              setIsReplying(false);
                              setReplyText(selectedReview.adminReply || '');
                            }}
                            className="admin-btn-secondary flex-1"
                            disabled={loading}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Chưa có phản hồi</p>
                    )}
                  </div>

                  {/* AI Analysis & Moderation Actions */}
                  <div className="admin-view-section relative">
                    <h4 className="admin-view-section-title">Phân tích & Quản lý</h4>
                    <div className="space-y-3">
                      <div className="relative">
                        <button
                          onClick={() => handleAnalyzeReview(selectedReview.id)}
                          className="admin-btn-secondary w-full flex items-center justify-center space-x-2"
                          disabled={loading}
                        >
                          <SparklesIcon className="h-5 w-5" />
                          <span>{loading ? 'Đang phân tích...' : 'Phân tích AI'}</span>
                        </button>
                        
                        {/* AI Analysis Result Pop-up */}
                        {isAiAnalysisModalOpen && aiAnalysisResult && (
                          <div className="absolute left-0 top-full mt-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-lg z-50 min-w-[300px] max-w-md">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-sm text-gray-800">Kết quả phân tích AI</h5>
                              <button
                                onClick={() => {
                                  setIsAiAnalysisModalOpen(false);
                                  setAiAnalysisResult(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 ml-2"
                                title="Đóng"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="space-y-2 text-sm">
                              {(() => {
                                const hasNegative = aiAnalysisResult.hasNegativeKeywords === true || 
                                                   aiAnalysisResult.hasNegativeKeywords === 'true' ||
                                                   String(aiAnalysisResult.hasNegativeKeywords).toLowerCase() === 'true';
                                const negativeKeywords = aiAnalysisResult.foundNegativeKeywords;
                                const isArray = Array.isArray(negativeKeywords);
                                const hasItems = isArray && (negativeKeywords as string[]).length > 0;
                                
                                const hasSpam = aiAnalysisResult.hasSpamKeywords === true || 
                                               aiAnalysisResult.hasSpamKeywords === 'true' ||
                                               String(aiAnalysisResult.hasSpamKeywords).toLowerCase() === 'true';
                                const spamKeywords = aiAnalysisResult.foundSpamKeywords;
                                const spamIsArray = Array.isArray(spamKeywords);
                                const spamHasItems = spamIsArray && (spamKeywords as string[]).length > 0;

                                const isSuspicious = aiAnalysisResult.isSuspicious === true || 
                                                    String(aiAnalysisResult.isSuspicious) === 'true';
                                const isSpam = aiAnalysisResult.isSpam === true || 
                                              String(aiAnalysisResult.isSpam) === 'true';

                                return (
                                  <div>
                                    {hasNegative && hasItems && (
                                      <div className="mb-2">
                                        <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Từ khóa tiêu cực:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(negativeKeywords as string[]).slice(0, 3).map((keyword: string, index: number) => (
                                            <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                                              {String(keyword)}
                                            </span>
                                          ))}
                                          {(negativeKeywords as string[]).length > 3 && (
                                            <span className="text-xs text-gray-500">+{(negativeKeywords as string[]).length - 3}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {hasSpam && spamHasItems && (
                                      <div className="mb-2">
                                        <p className="text-xs font-semibold text-orange-600 mb-1">🚫 Từ khóa spam:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(spamKeywords as string[]).slice(0, 3).map((keyword: string, index: number) => (
                                            <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">
                                              {String(keyword)}
                                            </span>
                                          ))}
                                          {(spamKeywords as string[]).length > 3 && (
                                            <span className="text-xs text-gray-500">+{(spamKeywords as string[]).length - 3}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
                                      <p className="text-xs">
                                        <strong>Kết luận:</strong> Review này {
                                          isSuspicious 
                                            ? 'có dấu hiệu nghi vấn' 
                                            : 'không có dấu hiệu nghi vấn'
                                        }{
                                          isSpam 
                                            ? ' và có khả năng là spam' 
                                            : ''
                                        }.
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleMarkSuspicious(selectedReview.id, !selectedReview.isSuspicious)}
                          className={`${selectedReview.isSuspicious ? 'admin-btn-danger' : 'admin-btn-secondary'} flex items-center justify-center space-x-1 text-sm`}
                          disabled={loading}
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span>{selectedReview.isSuspicious ? 'Bỏ nghi vấn' : 'Đánh dấu nghi vấn'}</span>
                        </button>
                        <button
                          onClick={() => handleMarkSpam(selectedReview.id, !selectedReview.isSpam)}
                          className={`${selectedReview.isSpam ? 'admin-btn-danger' : 'admin-btn-secondary'} flex items-center justify-center space-x-1 text-sm`}
                          disabled={loading}
                        >
                          <ShieldExclamationIcon className="h-4 w-4" />
                          <span>{selectedReview.isSpam ? 'Bỏ spam' : 'Đánh dấu spam'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Pending Reviews */}
                  {selectedReview.status === 'PENDING' && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Hành động</h4>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(selectedReview.id)}
                          className="admin-btn-success flex-1"
                          disabled={loading}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          {loading ? 'Đang xử lý...' : 'Duyệt đánh giá'}
                        </button>
                        <button
                          onClick={() => handleReject(selectedReview.id)}
                          className="admin-btn-danger flex-1"
                          disabled={loading}
                        >
                          <XCircleIcon className="h-5 w-5" />
                          {loading ? 'Đang xử lý...' : 'Từ chối'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeDetailModal} className="admin-btn-secondary">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReviews;
