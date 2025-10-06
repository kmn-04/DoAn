import React, { useState, useEffect } from 'react';
import { 
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface Booking {
  id: number;
  bookingCode: string;
  tourName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  confirmationStatus: string;
  paymentStatus: string;
  createdAt: string;
  startDate: string;
  totalPeople: number;
}

interface BookingDetail extends Booking {
  tourLocation?: string;
  tourDuration?: string;
  specialRequests?: string;
  participants?: any[];
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats - GLOBAL (not affected by filters/pagination)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0
  });
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmationStatusFilter, setConfirmationStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchGlobalStats();
  }, []);
  
  const fetchGlobalStats = async () => {
    try {
      const response = await apiClient.get('/admin/bookings/statistics');
      const data = response.data.data;
      setStats({
        total: data.totalBookings || 0,
        pending: data.pendingCount || 0,
        confirmed: data.confirmedCount || 0,
        completed: data.completedCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage, searchTerm, confirmationStatusFilter, paymentStatusFilter, dateFilter, sortBy, sortDirection]);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      
      // Build query params with filters
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: sortBy,
        sortDir: sortDirection
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (confirmationStatusFilter !== 'all') params.append('confirmationStatus', confirmationStatusFilter);
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter);
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter);
      
      const response = await apiClient.get(`/admin/bookings?${params.toString()}`);
      
      console.log('📋 Fetched bookings:', response.data.data?.content);
      const bookingsData = (response.data.data?.content || []).map((booking: any) => ({
        ...booking,
        // Normalize status to PascalCase
        confirmationStatus: booking.confirmationStatus 
          ? booking.confirmationStatus.charAt(0).toUpperCase() + booking.confirmationStatus.slice(1)
          : booking.confirmationStatus,
        paymentStatus: booking.paymentStatus
          ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)
          : booking.paymentStatus
      }));
      
      if (bookingsData.length > 0) {
        console.log('First booking status (normalized):', {
          confirmationStatus: bookingsData[0].confirmationStatus,
          paymentStatus: bookingsData[0].paymentStatus
        });
      }
      
      setBookings(bookingsData);
      setTotalPages(response.data.data?.totalPages || 0);
      setTotalElements(response.data.data?.totalElements || 0);
      
      // Backend already filtered, so totalElements is the accurate filtered count
      setFilteredCount(response.data.data?.totalElements || 0);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (booking: Booking) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/bookings/${booking.id}`);
      setSelectedBooking(response.data.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      alert('Không thể tải thông tin booking');
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateConfirmationStatus = async (bookingId: number | string, newStatus: string) => {
    const id = typeof bookingId === 'number' ? bookingId : selectedBooking?.id;
    if (!id) return;
    
    try {
      setLoading(true);
      console.log(`Updating booking ${id} confirmation status to:`, newStatus);
      const response = await apiClient.patch(`/admin/bookings/${id}/status`, { 
        status: newStatus 
      });
      console.log('Update response:', response.data);
      if (typeof bookingId !== 'number') closeDetailModal();
      await Promise.all([
        fetchBookings(currentPage),
        fetchGlobalStats()
      ]);
      console.log('Refreshed bookings and stats');
    } catch (error) {
      console.error('Error updating confirmation status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId: number | string, newStatus: string) => {
    const id = typeof bookingId === 'number' ? bookingId : selectedBooking?.id;
    if (!id) return;
    
    try {
      setLoading(true);
      console.log(`Updating booking ${id} payment status to:`, newStatus);
      const response = await apiClient.patch(`/admin/bookings/${id}/payment-status?paymentStatus=${newStatus}`);
      console.log('Update response:', response.data);
      if (typeof bookingId !== 'number') closeDetailModal();
      await Promise.all([
        fetchBookings(currentPage),
        fetchGlobalStats()
      ]);
      console.log('Refreshed bookings and stats');
    } catch (error) {
      console.error('Error updating payment status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const getConfirmationStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'admin-badge-green';
      case 'Pending':
        return 'admin-badge-yellow';
      case 'Cancelled':
        return 'admin-badge-red';
      case 'Completed':
        return 'admin-badge-blue';
      case 'CancellationRequested':
        return 'admin-badge-red';
      default:
        return 'admin-badge-gray';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'admin-badge-green';
      case 'Unpaid':
        return 'admin-badge-red';
      case 'Refunded':
      case 'Refunding':
        return 'admin-badge-purple';
      default:
        return 'admin-badge-gray';
    }
  };

  const getConfirmationStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Pending': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận',
      'Cancelled': 'Đã hủy',
      'Completed': 'Hoàn thành',
      'CancellationRequested': 'Yêu cầu hủy'
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Unpaid': 'Chưa thanh toán',
      'Paid': 'Đã thanh toán',
      'Refunded': 'Đã hoàn tiền',
      'Refunding': 'Đang hoàn tiền'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý đặt tour</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng booking</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đã xác nhận</p>
                <p className="admin-stat-value">{stats.confirmed}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Chờ xác nhận</p>
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
                <p className="admin-stat-label">Hoàn thành</p>
                <p className="admin-stat-value">{stats.completed}</p>
              </div>
              <div className="admin-stat-icon bg-purple-100">
                <BanknotesIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || confirmationStatusFilter !== 'all' || paymentStatusFilter !== 'all' || dateFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> booking
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Mã, tên, email khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Trạng thái xác nhận</label>
              <select
                value={confirmationStatusFilter}
                onChange={(e) => setConfirmationStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="Pending">Chờ xác nhận</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
                <option value="CancellationRequested">Yêu cầu hủy</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Trạng thái thanh toán</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="Unpaid">Chưa thanh toán</option>
                <option value="Paid">Đã thanh toán</option>
                <option value="PartiallyPaid">Thanh toán 1 phần</option>
                <option value="Refunded">Đã hoàn tiền</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Thời gian</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
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
                <option value="bookingDate-desc">Mới nhất</option>
                <option value="bookingDate-asc">Cũ nhất</option>
                <option value="totalPrice-desc">Giá cao - thấp</option>
                <option value="totalPrice-asc">Giá thấp - cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">Mã booking</th>
                <th className="admin-table-th">Khách hàng</th>
                <th className="admin-table-th">Ngày đặt</th>
                <th className="admin-table-th">Số người</th>
                <th className="admin-table-th">Tổng tiền</th>
                <th className="admin-table-th">Xác nhận</th>
                <th className="admin-table-th">Thanh toán</th>
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
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  console.log(`🎨 Rendering booking ${booking.id}:`, {
                    confirmationStatus: booking.confirmationStatus,
                    paymentStatus: booking.paymentStatus
                  });
                  return (
                  <tr key={booking.id} className="admin-table-row">
                    <td className="admin-table-td">
                      <span className="font-mono text-sm font-semibold text-blue-600">{booking.bookingCode}</span>
                    </td>
                    <td className="admin-table-td">
                      <div className="text-sm">
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-gray-500">{booking.customerEmail}</div>
                      </div>
                    </td>
                    <td className="admin-table-td text-sm">{formatDate(booking.createdAt)}</td>
                    <td className="admin-table-td font-semibold">{booking.totalPeople} người</td>
                    <td className="admin-table-td font-semibold text-green-600">{formatPrice(booking.totalPrice)}</td>
                    <td className="admin-table-td">
                      <select
                        key={`conf-${booking.id}-${booking.confirmationStatus}`}
                        value={booking.confirmationStatus}
                        onChange={(e) => {
                          console.log(`🔄 Changing booking ${booking.id} confirmation from ${booking.confirmationStatus} to ${e.target.value}`);
                          handleUpdateConfirmationStatus(booking.id, e.target.value);
                        }}
                        className={`admin-table-select ${getConfirmationStatusBadge(booking.confirmationStatus)}`}
                        disabled={loading}
                      >
                        <option value="Pending">Chờ xác nhận</option>
                        <option value="Confirmed">Đã xác nhận</option>
                        <option value="Completed">Hoàn thành</option>
                        <option value="Cancelled">Đã hủy</option>
                        <option value="CancellationRequested">Yêu cầu hủy</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <select
                        key={`pay-${booking.id}-${booking.paymentStatus}`}
                        value={booking.paymentStatus}
                        onChange={(e) => {
                          console.log(`💰 Changing booking ${booking.id} payment from ${booking.paymentStatus} to ${e.target.value}`);
                          handleUpdatePaymentStatus(booking.id, e.target.value);
                        }}
                        className={`admin-table-select ${getPaymentStatusBadge(booking.paymentStatus)}`}
                        disabled={loading}
                      >
                        <option value="Unpaid">Chưa thanh toán</option>
                        <option value="Paid">Đã thanh toán</option>
                        <option value="Refunding">Đang hoàn tiền</option>
                        <option value="Refunded">Đã hoàn tiền</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <button
                        onClick={() => openDetailModal(booking)}
                        className="admin-icon-btn-view"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 text-center mb-2">
            Hiển thị {bookings.length} / {totalElements} booking
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeDetailModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-4xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết đặt tour</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-6">
                  {/* Booking Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin booking</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Mã booking</p>
                        <p className="admin-view-value font-mono text-blue-600">{selectedBooking.bookingCode}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Ngày đặt</p>
                        <p className="admin-view-value">{formatDate(selectedBooking.bookingDate)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Ngày khởi hành</p>
                        <p className="admin-view-value">{formatDate(selectedBooking.tourDate)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Số người</p>
                        <p className="admin-view-value">{selectedBooking.numberOfPeople} người</p>
                      </div>
                    </div>
                  </div>

                  {/* Tour Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin tour</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item col-span-2">
                        <p className="admin-view-label">Tên tour</p>
                        <p className="admin-view-value font-semibold">{selectedBooking.tourName}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Địa điểm</p>
                        <p className="admin-view-value">{selectedBooking.tourLocation || 'N/A'}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Thời gian</p>
                        <p className="admin-view-value">{selectedBooking.tourDuration || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin khách hàng</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tên</p>
                        <p className="admin-view-value">{selectedBooking.customerName}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Email</p>
                        <p className="admin-view-value">{selectedBooking.customerEmail}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Số điện thoại</p>
                        <p className="admin-view-value">{selectedBooking.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin thanh toán</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tổng tiền</p>
                        <p className="admin-view-value font-bold text-green-600 text-lg">{formatPrice(selectedBooking.totalPrice)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trạng thái thanh toán</p>
                        <p className="admin-view-value">
                          <span className={getPaymentStatusBadge(selectedBooking.paymentStatus)}>
                            {getPaymentStatusLabel(selectedBooking.paymentStatus)}
                          </span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trạng thái xác nhận</p>
                        <p className="admin-view-value">
                          <span className={getConfirmationStatusBadge(selectedBooking.confirmationStatus)}>
                            {getConfirmationStatusLabel(selectedBooking.confirmationStatus)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.specialRequests && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title">Yêu cầu đặc biệt</h4>
                      <p className="text-sm text-gray-700">{selectedBooking.specialRequests}</p>
                    </div>
                  )}

                  {/* Update Status */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Cập nhật trạng thái</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-label">Trạng thái xác nhận</label>
                        <select
                          value={selectedBooking.confirmationStatus}
                          onChange={(e) => handleUpdateConfirmationStatus('modal', e.target.value)}
                          className="admin-select"
                          disabled={loading}
                        >
                          <option value="Pending">Chờ xác nhận</option>
                          <option value="Confirmed">Đã xác nhận</option>
                          <option value="Completed">Hoàn thành</option>
                          <option value="Cancelled">Đã hủy</option>
                          <option value="CancellationRequested">Yêu cầu hủy</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Trạng thái thanh toán</label>
                        <select
                          value={selectedBooking.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus('modal', e.target.value)}
                          className="admin-select"
                          disabled={loading}
                        >
                          <option value="Unpaid">Chưa thanh toán</option>
                          <option value="PartiallyPaid">Thanh toán 1 phần</option>
                          <option value="Paid">Đã thanh toán</option>
                          <option value="Refunding">Đang hoàn tiền</option>
                          <option value="Refunded">Đã hoàn tiền</option>
                        </select>
                      </div>
                    </div>
                  </div>
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

export default AdminBookings;
