import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api';

interface Booking {
  id: number;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  tourName: string;
  startDate: string;
  totalPrice: number;
  confirmationStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Additional Filters
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchBookings = async (page = 0, status = 'all') => {
    try {
      setLoading(true);
      const statusParam = status !== 'all' ? `&status=${status}` : '';
      const response = await apiClient.get(`/admin/bookings?page=${page}&size=10&sortBy=${sortBy}&sortDir=${sortDir}${statusParam}`);
      
      let filtered = response.data.data.content;
      
      // Apply filters
      if (searchTerm) {
        filtered = filtered.filter((b: Booking) => 
          b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.tourName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (paymentFilter !== 'all') {
        filtered = filtered.filter((b: Booking) => b.paymentStatus === paymentFilter);
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter((b: Booking) => {
          const bookingDate = new Date(b.createdAt);
          if (dateFilter === 'today') {
            return bookingDate.toDateString() === now.toDateString();
          } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= weekAgo;
          } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDate >= monthAgo;
          }
          return true;
        });
      }
      
      if (priceFilter !== 'all') {
        if (priceFilter === 'low') {
          filtered = filtered.filter((b: Booking) => b.totalPrice < 5000000);
        } else if (priceFilter === 'medium') {
          filtered = filtered.filter((b: Booking) => b.totalPrice >= 5000000 && b.totalPrice <= 15000000);
        } else if (priceFilter === 'high') {
          filtered = filtered.filter((b: Booking) => b.totalPrice > 15000000);
        }
      }
      
      setBookings(filtered);
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0, statusFilter);
  }, [statusFilter, searchTerm, paymentFilter, dateFilter, priceFilter, sortBy, sortDir]);

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings(currentPage, statusFilter);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đặt tour</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Mã booking, khách hàng, tour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Confirmation Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thanh toán</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="Paid">Đã thanh toán</option>
                <option value="Unpaid">Chưa thanh toán</option>
                <option value="Refunded">Đã hoàn tiền</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
            {/* Price Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="low">Dưới 5 triệu</option>
                <option value="medium">5-15 triệu</option>
                <option value="high">Trên 15 triệu</option>
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDir(direction as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="id-desc">Mới nhất</option>
                <option value="id-asc">Cũ nhất</option>
                <option value="totalPrice-desc">Giá cao</option>
                <option value="totalPrice-asc">Giá thấp</option>
                <option value="startDate-desc">Ngày khởi hành gần</option>
                <option value="startDate-asc">Ngày khởi hành xa</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setDateFilter('all');
                  setPriceFilter('all');
                  setSortBy('id');
                  setSortDir('desc');
                }}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 rounded-md"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-500">
            <span>Tìm thấy <strong>{bookings.length}</strong> booking</span>
          </div>
        </Card>

      {/* Bookings table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {booking.bookingCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {booking.tourName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(booking.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.confirmationStatus === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.confirmationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.confirmationStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.confirmationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {booking.confirmationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                              title="Confirm"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBookings(currentPage - 1, statusFilter)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBookings(currentPage + 1, statusFilter)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
};

export default AdminBookings;

