import React, { useState, useEffect, useCallback } from 'react';
import { 
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
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
  customerAddress?: string;
  contactPhone?: string;
  totalPrice: number;
  confirmationStatus: string;
  paymentStatus: string;
  createdAt: string;
  startDate: string;
  totalPeople: number;
  numAdults?: number;
  numChildren?: number;
  numInfants?: number;
  unitPrice?: number;
  discountAmount?: number;
  finalAmount?: number;
  promotionId?: number;
  promotionCode?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  updatedAt?: string;
  // Tour nested object
  tour?: {
    id: number;
    name: string;
    slug?: string;
    destination?: string;
    departureLocation?: string;
    duration?: number;
    tourType?: string;
    mainImage?: string;
    price?: number;
  };
}

interface BookingDetail extends Booking {
  tourLocation?: string;
  tourDuration?: string;
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
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchGlobalStats = useCallback(async () => {
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
  }, []);

  const fetchBookings = useCallback(async (page: number) => {
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
      
      const bookingsData = (response.data.data?.content || []).map((booking: Booking) => ({
        ...booking,
        // Keep status as-is from backend (should already be uppercase ENUM values)
        confirmationStatus: booking.confirmationStatus,
        paymentStatus: booking.paymentStatus
      }));
      
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
  }, [sortBy, sortDirection, searchTerm, confirmationStatusFilter, paymentStatusFilter, dateFilter]);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage, fetchBookings]);

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
      
      // Optimistic update: Update local state immediately
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === id ? { ...b, confirmationStatus: newStatus } : b
        )
      );
      
      await apiClient.patch(`/admin/bookings/${id}/status`, { 
        status: newStatus 
      });
      
      if (typeof bookingId !== 'number') closeDetailModal();
      
      // Refresh from server to ensure consistency
      await Promise.all([
        fetchBookings(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('❌ Error updating confirmation status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái xác nhận');
      
      // Revert optimistic update on error
      await fetchBookings(currentPage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId: number | string, newStatus: string) => {
    const id = typeof bookingId === 'number' ? bookingId : selectedBooking?.id;
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Optimistic update: Update local state immediately
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === id ? { ...b, paymentStatus: newStatus } : b
        )
      );
      
      await apiClient.patch(`/admin/bookings/${id}/payment-status?paymentStatus=${newStatus}`);
      
      if (typeof bookingId !== 'number') closeDetailModal();
      
      // Refresh from server to ensure consistency
      await Promise.all([
        fetchBookings(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
      
      // Revert optimistic update on error
      await fetchBookings(currentPage);
    } finally {
      setLoading(false);
    }
  };

  const getConfirmationStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'admin-badge-green';
      case 'PENDING':
        return 'admin-badge-yellow';
      case 'CANCELLED':
        return 'admin-badge-red';
      case 'COMPLETED':
        return 'admin-badge-blue';
      case 'CANCELLATION_REQUESTED':
        return 'admin-badge-red';
      default:
        return 'admin-badge-gray';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'admin-badge-green';
      case 'UNPAID':
        return 'admin-badge-red';
      default:
        return 'admin-badge-gray';
    }
  };

  const getConfirmationStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'CANCELLED': 'Đã hủy',
      'COMPLETED': 'Hoàn thành',
      'CANCELLATION_REQUESTED': 'Yêu cầu hủy',
      'CancellationRequested': 'Yêu cầu hủy'
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'UNPAID': 'Chưa thanh toán',
      'PAID': 'Đã thanh toán'
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
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                {/* Yêu cầu hủy được xử lý tại trang /admin/cancellations */}
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
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
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
                <th className="admin-table-th">ID</th>
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
                  <td colSpan={9} className="admin-loading">
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
                  <td colSpan={9} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="admin-table-row">
                    <td className="admin-table-td">
                      <span className="text-sm text-gray-600">{booking.id}</span>
                    </td>
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
                        key={`conf-${booking.id}-${booking.confirmationStatus}-${booking.updatedAt || booking.createdAt}`}
                        value={booking.confirmationStatus}
                        onChange={(e) => handleUpdateConfirmationStatus(booking.id, e.target.value)}
                        className={`admin-table-select ${getConfirmationStatusBadge(booking.confirmationStatus)}`}
                        disabled={loading || booking.confirmationStatus === 'CANCELLATION_REQUESTED' || booking.confirmationStatus === 'CANCELLED'}
                        title={booking.confirmationStatus === 'CANCELLATION_REQUESTED' ? 'Xử lý yêu cầu hủy tại trang Yêu cầu hủy' : booking.confirmationStatus === 'CANCELLED' ? 'Không thể thay đổi booking đã hủy' : ''}
                      >
                        {booking.confirmationStatus === 'CANCELLATION_REQUESTED' ? (
                          <option value="CANCELLATION_REQUESTED">Yêu cầu hủy</option>
                        ) : booking.confirmationStatus === 'CANCELLED' ? (
                          <option value="CANCELLED">Đã hủy</option>
                        ) : (
                          <>
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <select
                        key={`pay-${booking.id}-${booking.paymentStatus}-${booking.updatedAt || booking.createdAt}`}
                        value={booking.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(booking.id, e.target.value)}
                        className={`admin-table-select ${getPaymentStatusBadge(booking.paymentStatus)}`}
                        disabled={loading}
                      >
                        <option value="UNPAID">Chưa thanh toán</option>
                        <option value="PAID">Đã thanh toán</option>
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
                ))
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
                        <p className="admin-view-value">{formatDate(selectedBooking.createdAt)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Ngày khởi hành</p>
                        <p className="admin-view-value">{formatDate(selectedBooking.startDate)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Cập nhật lần cuối</p>
                        <p className="admin-view-value">{formatDate(selectedBooking.updatedAt || selectedBooking.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tour Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin tour</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item col-span-2">
                        <p className="admin-view-label">Tên tour</p>
                        <p className="admin-view-value font-semibold">{selectedBooking.tour?.name || selectedBooking.tourName}</p>
                      </div>
                      {selectedBooking.tour?.mainImage && (
                        <div className="admin-view-item col-span-2">
                          <p className="admin-view-label">Hình ảnh</p>
                          <img 
                            src={selectedBooking.tour.mainImage} 
                            alt={selectedBooking.tour.name}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="admin-view-item">
                        <p className="admin-view-label">Loại tour</p>
                        <p className="admin-view-value">
                          {selectedBooking.tour?.tourType === 'Domestic' ? '🇻🇳 Trong nước' : 
                           selectedBooking.tour?.tourType === 'International' ? '🌍 Quốc tế' : 'N/A'}
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Điểm khởi hành</p>
                        <p className="admin-view-value">{selectedBooking.tour?.departureLocation || 'N/A'}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Điểm đến</p>
                        <p className="admin-view-value">{selectedBooking.tour?.destination || 'N/A'}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Thời gian</p>
                        <p className="admin-view-value">
                          {selectedBooking.tour?.duration ? `${selectedBooking.tour.duration} ngày` : 'N/A'}
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Giá niêm yết</p>
                        <p className="admin-view-value font-semibold text-blue-600">
                          {selectedBooking.tour?.price ? formatPrice(selectedBooking.tour.price) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin khách hàng</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tên khách hàng</p>
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
                      {selectedBooking.contactPhone && (
                        <div className="admin-view-item">
                          <p className="admin-view-label">SĐT liên hệ khác</p>
                          <p className="admin-view-value">{selectedBooking.contactPhone}</p>
                        </div>
                      )}
                      {selectedBooking.customerAddress && (
                        <div className="admin-view-item col-span-2">
                          <p className="admin-view-label">Địa chỉ</p>
                          <p className="admin-view-value">{selectedBooking.customerAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Participants Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Số lượng hành khách</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Người lớn</p>
                        <p className="admin-view-value font-semibold">{selectedBooking.numAdults || 0} người</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trẻ em</p>
                        <p className="admin-view-value font-semibold">{selectedBooking.numChildren || 0} người</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Em bé</p>
                        <p className="admin-view-value font-semibold">{selectedBooking.numInfants || 0} người</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tổng số người</p>
                        <p className="admin-view-value font-bold text-blue-600">{selectedBooking.totalPeople} người</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin thanh toán</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Đơn giá</p>
                        <p className="admin-view-value">{formatPrice(selectedBooking.unitPrice || 0)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tổng tiền (chưa giảm)</p>
                        <p className="admin-view-value">{formatPrice(selectedBooking.totalPrice)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Giảm giá</p>
                        <p className="admin-view-value text-red-600">
                          {selectedBooking.discountAmount ? `-${formatPrice(selectedBooking.discountAmount)}` : '0 ₫'}
                        </p>
                      </div>
                      {selectedBooking.promotionCode && (
                        <div className="admin-view-item">
                          <p className="admin-view-label">Mã khuyến mãi</p>
                          <p className="admin-view-value font-mono text-green-600">{selectedBooking.promotionCode}</p>
                        </div>
                      )}
                      <div className="admin-view-item">
                        <p className="admin-view-label">Thành tiền</p>
                        <p className="admin-view-value font-bold text-green-600 text-lg">{formatPrice(selectedBooking.finalAmount || selectedBooking.totalPrice)}</p>
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
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{selectedBooking.specialRequests}</p>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Info */}
                  {selectedBooking.cancellationReason && (
                    <div className="admin-view-section">
                      <h4 className="admin-view-section-title text-red-600">Thông tin hủy booking</h4>
                      <div className="admin-view-grid">
                        {selectedBooking.cancelledAt && (
                          <div className="admin-view-item">
                            <p className="admin-view-label">Thời gian hủy</p>
                            <p className="admin-view-value">{formatDate(selectedBooking.cancelledAt)}</p>
                          </div>
                        )}
                        <div className="admin-view-item col-span-2">
                          <p className="admin-view-label">Lý do hủy</p>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-700 whitespace-pre-line">{selectedBooking.cancellationReason}</p>
                          </div>
                        </div>
                      </div>
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
                          disabled={loading || selectedBooking.confirmationStatus === 'CANCELLATION_REQUESTED' || selectedBooking.confirmationStatus === 'CANCELLED'}
                          title={selectedBooking.confirmationStatus === 'CANCELLATION_REQUESTED' ? 'Xử lý yêu cầu hủy tại trang Yêu cầu hủy' : selectedBooking.confirmationStatus === 'CANCELLED' ? 'Không thể thay đổi booking đã hủy' : ''}
                        >
                          {selectedBooking.confirmationStatus === 'CANCELLATION_REQUESTED' ? (
                            <option value="CANCELLATION_REQUESTED">Yêu cầu hủy</option>
                          ) : selectedBooking.confirmationStatus === 'CANCELLED' ? (
                            <option value="CANCELLED">Đã hủy</option>
                          ) : (
                            <>
                              <option value="PENDING">Chờ xác nhận</option>
                              <option value="CONFIRMED">Đã xác nhận</option>
                              <option value="COMPLETED">Hoàn thành</option>
                              <option value="CANCELLED">Đã hủy</option>
                            </>
                          )}
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
                          <option value="UNPAID">Chưa thanh toán</option>
                          <option value="PAID">Đã thanh toán</option>
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
