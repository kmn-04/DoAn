import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import Pagination from '../../components/ui/Pagination';
import '../../styles/admin.css';

interface CancellationItem {
  id: number;
  booking: {
    id: number;
    bookingCode: string;
    tourName: string;
    startDate: string;
    totalPrice: number;
  };
  cancelledBy: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  reason: string;
  reasonCategory: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_APPLICABLE';
  originalAmount: number;
  finalRefundAmount: number;
  cancellationFee: number;
  processingFee: number;
  cancelledAt: string;
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
  hoursBeforeDeparture: number;
  cancellationPolicy?: {
    name: string;
  };
}

const CancellationsPage: React.FC = () => {
  const [cancellations, setCancellations] = useState<CancellationItem[]>([]);
  const [filteredCancellations, setFilteredCancellations] = useState<CancellationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCancellation, setSelectedCancellation] = useState<CancellationItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const pageSize = 10;

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadCancellations();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    filterCancellations();
  }, [cancellations, searchTerm, statusFilter, sortBy, sortDirection]);

  const loadStats = async () => {
    try {
      const response = await api.get('/cancellations/admin/statistics');
      const data = response.data.data;
      
      console.log('📊 Cancellation statistics:', data);
      
      setStats({
        total: data.totalCancellations || 0,
        pending: data.pendingCount || 0,
        approved: data.approvedCount || 0,
        rejected: data.rejectedCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values on error
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    }
  };

  const loadCancellations = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading cancellations with filter:', statusFilter);
      
      // Try /admin/all first, fallback to /admin/pending if it fails
      let response;
      try {
        response = await api.get(`/cancellations/admin/all?page=${currentPage}&size=100`);
      } catch (err) {
        console.warn('⚠️ /admin/all failed, trying /admin/pending as fallback');
        // Fallback to pending endpoint if /all doesn't work
        response = await api.get(`/cancellations/admin/pending?page=${currentPage}&size=100`);
      }
      
      console.log('📦 Cancellations response:', response.data);
      
      const allCancellations = response.data.data?.content || [];
      
      // Filter by status on frontend if needed
      let filtered = allCancellations;
      if (statusFilter !== 'all') {
        filtered = allCancellations.filter((c: CancellationItem) => c.status === statusFilter);
      }
      
      console.log(`✅ Loaded ${filtered.length} cancellations after filtering`);
      
      setCancellations(filtered);
      setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    } catch (error) {
      console.error('❌ Error loading cancellations:', error);
      console.error('❌ Error details:', (error as any).response?.data);
      
      // Show user-friendly message
      alert('Không thể tải danh sách yêu cầu hủy. Vui lòng kiểm tra backend logs và restart backend nếu cần.');
      
      setCancellations([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCancellations = () => {
    let filtered = [...cancellations];

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.booking?.bookingCode?.toLowerCase().includes(search) ||
        c.booking?.tourName?.toLowerCase().includes(search) ||
        c.cancelledBy?.name?.toLowerCase().includes(search) ||
        c.cancelledBy?.email?.toLowerCase().includes(search)
      );
    }

    // Status filter is already handled in loadCancellations

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'bookingCode':
          aValue = a.booking?.bookingCode || '';
          bValue = b.booking?.bookingCode || '';
          break;
        case 'tourName':
          aValue = a.booking?.tourName || '';
          bValue = b.booking?.tourName || '';
          break;
        case 'customerName':
          aValue = a.cancelledBy?.name || '';
          bValue = b.cancelledBy?.name || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCancellations(filtered);
  };

  const handleApprove = async () => {
    if (!selectedCancellation) return;

    try {
      setIsProcessing(true);
      await api.put(`/cancellations/admin/${selectedCancellation.id}/approve`, null, {
        params: { adminNotes }
      });

      alert('✅ Đã phê duyệt yêu cầu hủy thành công!');
      setShowApproveModal(false);
      setAdminNotes('');
      loadStats();
      loadCancellations();
    } catch (error: any) {
      console.error('Error approving cancellation:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.error || 'Không thể phê duyệt'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCancellation || !adminNotes.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setIsProcessing(true);
      await api.put(`/cancellations/admin/${selectedCancellation.id}/reject`, null, {
        params: { adminNotes }
      });

      alert('✅ Đã từ chối yêu cầu hủy. Booking đã được khôi phục.');
      setShowRejectModal(false);
      setAdminNotes('');
      loadStats();
      loadCancellations();
    } catch (error: any) {
      console.error('Error rejecting cancellation:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối'));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleStatusChange = async (cancellationId: number, newStatus: string) => {
    try {
      if (newStatus === 'APPROVED') {
        const cancellation = cancellations.find(c => c.id === cancellationId);
        setSelectedCancellation(cancellation || null);
        setShowApproveModal(true);
      } else if (newStatus === 'REJECTED') {
        const cancellation = cancellations.find(c => c.id === cancellationId);
        setSelectedCancellation(cancellation || null);
        setShowRejectModal(true);
      }
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      PENDING: 'admin-table-select-pending',
      APPROVED: 'admin-table-select-completed',
      REJECTED: 'admin-table-select-rejected'
    };
    return classes[status] || 'admin-table-select-pending';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      APPROVED: 'Đã phê duyệt',
      REJECTED: 'Đã từ chối'
    };
    return labels[status] || status;
  };

  const getRefundStatusClass = (refundStatus: string) => {
    const classes: Record<string, string> = {
      PENDING: 'admin-table-select-pending',
      PROCESSING: 'admin-badge-yellow',
      COMPLETED: 'admin-badge-green',
      FAILED: 'admin-badge-red',
      NOT_APPLICABLE: 'admin-badge-gray'
    };
    return `admin-table-select ${classes[refundStatus] || 'admin-badge-gray'}`;
  };

  const handleRefundStatusChange = async (cancellationId: number, newRefundStatus: string) => {
    try {
      console.log(`🔄 Updating refund status for cancellation ${cancellationId} to ${newRefundStatus}`);
      
      await api.put(`/cancellations/admin/${cancellationId}/refund-status`, null, {
        params: { refundStatus: newRefundStatus }
      });

      alert('✅ Đã cập nhật trạng thái hoàn tiền thành công!');
      loadStats();
      loadCancellations();
    } catch (error: any) {
      console.error('Error updating refund status:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.error || 'Không thể cập nhật trạng thái hoàn tiền'));
      loadCancellations(); // Reload to revert changes
    }
  };

  const reasonCategoryLabels: Record<string, string> = {
    PERSONAL_EMERGENCY: 'Khẩn cấp cá nhân',
    MEDICAL_EMERGENCY: 'Khẩn cấp y tế',
    WEATHER_CONDITIONS: 'Điều kiện thời tiết',
    FORCE_MAJEURE: 'Bất khả kháng',
    TRAVEL_RESTRICTIONS: 'Hạn chế đi lại',
    SCHEDULE_CONFLICT: 'Xung đột lịch trình',
    FINANCIAL_DIFFICULTY: 'Khó khăn tài chính',
    DISSATISFACTION: 'Không hài lòng',
    DUPLICATE_BOOKING: 'Đặt trùng lặp',
    TECHNICAL_ERROR: 'Lỗi kỹ thuật',
    OTHER: 'Khác'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý yêu cầu hủy tour</h1>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã phê duyệt</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCancellations.length}</span> yêu cầu hủy
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Mã booking, tour, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="admin-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="APPROVED">Đã phê duyệt</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-select"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="bookingCode">Mã booking</option>
                <option value="tourName">Tên tour</option>
                <option value="customerName">Tên khách hàng</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Thứ tự</label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="admin-select"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>

            <div>
              <label className="admin-label">&nbsp;</label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCurrentPage(0);
                }}
                className="admin-btn-secondary w-full"
              >
                <FunnelIcon className="h-5 w-5" />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        ) : filteredCancellations.length === 0 ? (
          <div className="admin-empty">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có yêu cầu hủy</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Thử thay đổi bộ lọc' 
                : 'Chưa có yêu cầu hủy nào'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">ID</th>
                <th className="admin-table-th">Booking</th>
                <th className="admin-table-th">Khách hàng</th>
                <th className="admin-table-th">Số tiền</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Hoàn tiền</th>
                <th className="admin-table-th">Ngày hủy</th>
                <th className="admin-table-th text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {filteredCancellations.map((cancellation) => (
                <tr key={cancellation.id} className="admin-table-row">
                  <td className="admin-table-td">
                    <span className="text-sm text-gray-600">{cancellation.id}</span>
                  </td>
                  <td className="admin-table-td">
                    <div className="font-medium text-blue-600">{cancellation.booking?.bookingCode}</div>
                    <div className="text-xs text-gray-500">{cancellation.booking?.tourName}</div>
                  </td>
                  <td className="admin-table-td">
                    <div className="font-medium">{cancellation.cancelledBy?.name}</div>
                    <div className="text-xs text-gray-500">{cancellation.cancelledBy?.email}</div>
                  </td>
                  <td className="admin-table-td">
                    <div className="font-medium">{formatCurrency(cancellation.originalAmount)}</div>
                    <div className="text-xs text-green-600">
                      Hoàn: {formatCurrency(cancellation.finalRefundAmount)}
                    </div>
                  </td>
                  <td className="admin-table-td">
                    <select
                      value={cancellation.status}
                      onChange={(e) => handleStatusChange(cancellation.id, e.target.value)}
                      className={getStatusClass(cancellation.status)}
                      disabled={cancellation.status === 'APPROVED' || cancellation.status === 'REJECTED'}
                    >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="APPROVED">Phê duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                    </select>
                  </td>
                  <td className="admin-table-td">
                    <select
                      value={cancellation.refundStatus}
                      onChange={(e) => handleRefundStatusChange(cancellation.id, e.target.value)}
                      className={getRefundStatusClass(cancellation.refundStatus)}
                      disabled={cancellation.status !== 'APPROVED' || cancellation.refundStatus === 'COMPLETED'}
                    >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PROCESSING">Đang hoàn tiền</option>
                        <option value="COMPLETED">Đã hoàn tiền</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="NOT_APPLICABLE">Không hoàn tiền</option>
                    </select>
                  </td>
                  <td className="admin-table-td text-sm text-gray-600">
                    {new Date(cancellation.cancelledAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="admin-table-td">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => {
                          setSelectedCancellation(cancellation);
                          setShowDetailModal(true);
                        }}
                        className="admin-icon-btn-view"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCancellation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => setShowDetailModal(false)} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Chi tiết yêu cầu hủy</h2>
                <button onClick={() => setShowDetailModal(false)} className="admin-modal-close">×</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-view-section">
                  <h3 className="admin-view-section-title">Thông tin booking</h3>
                  <div className="admin-view-grid">
                    <div className="admin-view-item">
                      <p className="admin-view-label">Mã booking</p>
                      <p className="admin-view-value font-mono">{selectedCancellation.booking?.bookingCode}</p>
                    </div>
                    <div className="admin-view-item">
                      <p className="admin-view-label">Tour</p>
                      <p className="admin-view-value">{selectedCancellation.booking?.tourName}</p>
                    </div>
                  </div>
                </div>

                <div className="admin-view-section">
                  <h3 className="admin-view-section-title">Khách hàng</h3>
                  <div className="admin-view-grid">
                    <div className="admin-view-item">
                      <p className="admin-view-label">Tên</p>
                      <p className="admin-view-value">{selectedCancellation.cancelledBy?.name}</p>
                    </div>
                    <div className="admin-view-item">
                      <p className="admin-view-label">Email</p>
                      <p className="admin-view-value">{selectedCancellation.cancelledBy?.email}</p>
                    </div>
                    <div className="admin-view-item">
                      <p className="admin-view-label">Số điện thoại</p>
                      <p className="admin-view-value">{selectedCancellation.cancelledBy?.phone}</p>
                    </div>
                    <div className="admin-view-item">
                      <p className="admin-view-label">Ngày hủy</p>
                      <p className="admin-view-value">{formatDate(selectedCancellation.cancelledAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="admin-view-section">
                  <h3 className="admin-view-section-title">Lý do hủy</h3>
                  <div className="mb-2">
                    <p className="admin-view-label">Danh mục</p>
                    <p className="admin-view-value">{reasonCategoryLabels[selectedCancellation.reasonCategory]}</p>
                  </div>
                  <div>
                    <p className="admin-view-label">Chi tiết</p>
                    <p className="text-sm text-gray-700">{selectedCancellation.reason}</p>
                  </div>
                </div>

                <div className="admin-view-section">
                  <h3 className="admin-view-section-title">Thông tin tài chính</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Số tiền gốc:</span>
                      <span className="font-medium">{formatCurrency(selectedCancellation.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Phí hủy:</span>
                      <span>-{formatCurrency(selectedCancellation.cancellationFee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Phí xử lý:</span>
                      <span>-{formatCurrency(selectedCancellation.processingFee || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold text-green-600">
                      <span>Hoàn lại:</span>
                      <span>{formatCurrency(selectedCancellation.finalRefundAmount || 0)}</span>
                    </div>
                  </div>
                </div>

                {selectedCancellation.adminNotes && (
                  <div className="admin-alert-warning">
                    <p className="text-sm font-medium text-gray-700">Ghi chú admin:</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedCancellation.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button onClick={() => setShowDetailModal(false)} className="admin-btn-secondary">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedCancellation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => setShowApproveModal(false)} />
          <div className="admin-modal-container">
            <div className="admin-modal" style={{ maxWidth: '32rem' }}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Phê duyệt yêu cầu hủy</h2>
              </div>

              <div className="admin-modal-body">
                <p className="text-gray-700 mb-4">
                  Phê duyệt yêu cầu hủy booking <strong>{selectedCancellation.booking?.bookingCode}</strong>?
                </p>

                <div className="admin-alert-warning mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Booking sẽ được hủy và khách hàng nhận hoàn tiền <strong>{formatCurrency(selectedCancellation.finalRefundAmount)}</strong>
                  </p>
                </div>

                <div>
                  <label className="admin-label">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Nhập ghi chú..."
                    rows={3}
                    className="admin-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setAdminNotes('');
                  }}
                  disabled={isProcessing}
                  className="admin-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="admin-btn-success"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Phê duyệt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCancellation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => setShowRejectModal(false)} />
          <div className="admin-modal-container">
            <div className="admin-modal" style={{ maxWidth: '32rem' }}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Từ chối yêu cầu hủy</h2>
              </div>

              <div className="admin-modal-body">
                <p className="text-gray-700 mb-4">
                  Từ chối yêu cầu hủy booking <strong>{selectedCancellation.booking?.bookingCode}</strong>?
                </p>

                <div className="admin-alert-info mb-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ Booking sẽ được khôi phục và khách hàng có thể tiếp tục sử dụng.
                  </p>
                </div>

                <div>
                  <label className="admin-label">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Vui lòng nhập lý do từ chối..."
                    rows={3}
                    className="admin-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setAdminNotes('');
                  }}
                  disabled={isProcessing}
                  className="admin-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !adminNotes.trim()}
                  className="admin-btn-danger"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationsPage;

