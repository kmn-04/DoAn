import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Pagination, SkeletonBookingCard } from '../../components/ui';
import { bookingService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { CancellationRequestForm, CancellationHistory } from '../../components/cancellation';
import { TourDetailModal } from '../../components/tour';

interface Booking {
  id: string;
  tourId: number;
  tourName: string;
  tourSlug: string;
  tourImage: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'cancellation_requested';
  paymentStatus: 'paid' | 'pending' | 'failed';
  bookingDate: string;
  specialRequests?: string;
}

const mockBookings: Booking[] = [
  {
    id: 'BK1234567',
    tourId: 1,
    tourName: 'Hạ Long Bay - Kỳ Quan Thế Giới',
    tourSlug: 'ha-long-bay-ky-quan-the-gioi',
    tourImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    duration: '2 ngày 1 đêm',
    location: 'Quảng Ninh',
    adults: 2,
    children: 1,
    totalPrice: 6200000,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-20',
    specialRequests: 'Phòng view biển'
  },
  {
    id: 'BK1234568',
    tourId: 2,
    tourName: 'Sapa - Thiên Đường Mây Trắng',
    tourSlug: 'sapa-thien-duong-may-trang',
    tourImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    duration: '3 ngày 2 đêm',
    location: 'Lào Cai',
    adults: 2,
    children: 0,
    totalPrice: 3600000,
    status: 'completed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-05'
  },
  {
    id: 'BK1234569',
    tourId: 3,
    tourName: 'Phú Quốc - Đảo Ngọc Xanh',
    tourSlug: 'phu-quoc-dao-ngoc-xanh',
    tourImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    startDate: '2024-03-10',
    endDate: '2024-03-13',
    duration: '4 ngày 3 đêm',
    location: 'Kiên Giang',
    adults: 4,
    children: 2,
    totalPrice: 9600000,
    status: 'pending',
    paymentStatus: 'pending',
    bookingDate: '2024-01-25',
    specialRequests: 'Ăn chay cho 2 người'
  },
  {
    id: 'BK1234570',
    tourId: 4,
    tourName: 'Hội An - Phố Cổ Thơ Mộng',
    tourSlug: 'hoi-an-pho-co-tho-mong',
    tourImage: 'https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=400',
    startDate: '2023-12-15',
    endDate: '2023-12-16',
    duration: '2 ngày 1 đêm',
    location: 'Quảng Nam',
    adults: 2,
    children: 0,
    totalPrice: 3000000,
    status: 'completed',
    paymentStatus: 'paid',
    bookingDate: '2023-12-01'
  },
  {
    id: 'BK1234571',
    tourId: 5,
    tourName: 'Đà Lạt - Thành Phố Ngàn Hoa',
    tourSlug: 'da-lat-thanh-pho-ngan-hoa',
    tourImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    startDate: '2023-11-20',
    endDate: '2023-11-22',
    duration: '3 ngày 2 đêm',
    location: 'Lâm Đồng',
    adults: 1,
    children: 0,
    totalPrice: 1200000,
    status: 'cancelled',
    paymentStatus: 'failed',
    bookingDate: '2023-11-10'
  }
];

const BookingHistoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'bookings' | 'cancellations'>(
    (searchParams.get('tab') as 'bookings' | 'cancellations') || 'bookings'
  );
  
  // Cancellation states
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<number | null>(null);
  const [cancellationRefreshTrigger, setCancellationRefreshTrigger] = useState(0);
  const [newCancellationData, setNewCancellationData] = useState<any>(null);
  
  // Tour detail modal states
  const [showTourDetailModal, setShowTourDetailModal] = useState(false);
  const [selectedTourForDetail, setSelectedTourForDetail] = useState<{ id: number; slug?: string } | null>(null);
  
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    dateRange: searchParams.get('dateRange') || 'all'
  });

  const bookingsPerPage = 5;

  // Move fetchBookings outside useEffect so it can be called from other functions
  const fetchBookings = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
        
        // Check if we need to refresh due to recent payment
        const shouldRefresh = localStorage.getItem('refreshBookings');
        if (shouldRefresh) {
          localStorage.removeItem('refreshBookings');
          console.log('🔄 Refreshing bookings after payment success');
        }
        
        // Get bookings for current user
        console.log('🔍 Fetching bookings for user ID:', user.id);
        const bookingResponses = await bookingService.getBookingsByUser(user.id);
        console.log('📥 Received bookings from API:', bookingResponses);
        
        // Filter out cancelled bookings first
        const activeBookingResponses = bookingResponses.filter(booking => 
          !['CANCELLED', 'CancellationRequested'].includes(booking.status)
        );
        
        // Convert BookingResponse to local Booking interface
        const convertedBookings: Booking[] = activeBookingResponses.map(booking => ({
          id: String(booking.id), // Use booking ID as string for frontend compatibility
          tourId: booking.tour?.id || 0,
          tourName: booking.tour?.name || 'Unknown Tour',
          tourSlug: booking.tour?.slug || '',
        tourImage: booking.tour?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        startDate: booking.startDate,
        endDate: booking.startDate, // API doesn't have endDate, using startDate
        duration: '1 ngày', // API doesn't have duration
        location: booking.tour?.location || 'Unknown',
          adults: booking.numAdults,
          children: booking.numChildren,
          totalPrice: Number(booking.totalPrice),
          status: (() => {
            const status = booking.status.toLowerCase();
            if (status === 'cancellationrequested') return 'cancellation_requested';
            return status as 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'cancellation_requested';
          })(),
          paymentStatus: 'paid', // Default since API doesn't specify
          bookingDate: booking.createdAt,
          specialRequests: booking.specialRequests
        }));
        
        setBookings(convertedBookings);
        
      } catch (error) {
        console.error('Error fetching bookings:', error);
        
        // Fallback to mock data on error
        setBookings(mockBookings);
        
        const errorEvent = new CustomEvent('show-toast', {
          detail: {
            type: 'warning',
            title: 'Không thể tải dữ liệu',
            message: 'Đang hiển thị dữ liệu mẫu. Vui lòng thử lại sau.'
          }
        });
        window.dispatchEvent(errorEvent);
        
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    setSearchParams(params);

    // Filter bookings
    let filtered = [...bookings];

    // For the bookings tab, exclude bookings that have been requested for cancellation
    if (activeTab === 'bookings') {
      filtered = filtered.filter(booking => booking.status !== 'cancellation_requested');
    }

    if (filters.search) {
      filtered = filtered.filter(booking => 
        booking.tourName.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      if (filters.status === 'upcoming') {
        filtered = filtered.filter(booking => 
          booking.status === 'confirmed' && new Date(booking.startDate) > new Date()
        );
      } else {
        filtered = filtered.filter(booking => booking.status === filters.status);
      }
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'last_month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'last_year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(booking => 
        new Date(booking.bookingDate) >= filterDate
      );
    }

    // Sort by booking date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [filters, bookings, activeTab, setSearchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ComponentType<any> }> = {
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon },
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon },
      completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircleIcon },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircleIcon }
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200', icon: ClockIcon };
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800' }
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Tab change handler
  const handleTabChange = (tab: 'bookings' | 'cancellations') => {
    setActiveTab(tab);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams);
  };

  // Cancellation methods
  const handleCancelBooking = (bookingId: number) => {
    console.log('🚀 User clicked cancel booking for ID:', bookingId);
    setSelectedBookingForCancellation(bookingId);
    setShowCancellationForm(true);
    console.log('📝 Opening cancellation form with preselected booking:', bookingId);
  };


  // Tour detail methods
  const handleViewTourDetail = (tourId: number, tourSlug?: string) => {
    console.log('👁️ User clicked view tour detail:', { tourId, tourSlug });
    setSelectedTourForDetail({ id: tourId, slug: tourSlug });
    setShowTourDetailModal(true);
  };

  const handleCancellationSuccess = (cancellationData: any) => {
    console.log('🎉 Cancellation success with data:', cancellationData);
    
    // IMMEDIATE UPDATE: Remove the booking from the list immediately for better UX
    // Try to get booking ID from cancellation data or fallback to selected booking
    const bookingIdToUpdate = cancellationData?.bookingId || selectedBookingForCancellation;
    
    if (bookingIdToUpdate) {
      console.log('🔄 Immediately removing booking from list:', bookingIdToUpdate);
      console.log('🔍 Current bookings before update:', bookings.map(b => ({ id: b.id, status: b.status })));
      
      setBookings(prev => {
        const updated = prev.map(booking => {
          const bookingIdStr = String(booking.id);
          const targetIdStr = String(bookingIdToUpdate);
          console.log('🔍 Comparing:', { bookingId: bookingIdStr, targetId: targetIdStr, match: bookingIdStr === targetIdStr });
          
          return bookingIdStr === targetIdStr 
            ? { ...booking, status: 'cancellation_requested' as any }
            : booking;
        });
        
        console.log('🔍 Updated bookings:', updated.map(b => ({ id: b.id, status: b.status })));
        return updated;
      });
    } else {
      console.log('⚠️ No booking ID found to update');
    }
    
    // Show success message
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: 'Thành công!',
        message: 'Yêu cầu hủy booking đã được gửi thành công',
        duration: 5000
      }
    });
    window.dispatchEvent(event);

    // Store the new cancellation data
    setNewCancellationData(cancellationData);

    // IMPORTANT: Refresh bookings to reflect status changes from backend
    console.log('🔄 Refreshing bookings after cancellation request');
    setTimeout(() => {
      fetchBookings(); // This will reload the booking list after a delay
    }, 1000);

    // Close modal and reset state
    setShowCancellationForm(false);
    setSelectedBookingForCancellation(null);

    // Switch to cancellations tab to show the new request
    setActiveTab('cancellations');
    setSearchParams(prev => {
      prev.set('tab', 'cancellations');
      return prev;
    });

    // Trigger refresh of cancellation history
    setCancellationRefreshTrigger(prev => prev + 1);
  };

  const canCancelBooking = (booking: Booking): boolean => {
    // Can cancel if status is confirmed or pending and start date is in the future
    // Cannot cancel if already requested for cancellation
    const startDate = new Date(booking.startDate);
    const now = new Date();
    const isInFuture = startDate > now;
    const canCancelStatus = booking.status === 'confirmed' || booking.status === 'pending';
    const notAlreadyCancelling = booking.status !== 'cancellation_requested';
    
    return isInFuture && canCancelStatus && notAlreadyCancelling;
  };

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', dateRange: 'all' });
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý booking</h1>
        <p className="text-gray-600">Theo dõi tất cả booking và yêu cầu hủy của bạn</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Booking của tôi ({bookings.length})
            </button>
            <button
              onClick={() => handleTabChange('cancellations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancellations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử hủy booking
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookings' ? (
        <>
          {/* Filters */}
          <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bộ lọc
          </h2>
          
          <div className="text-sm text-gray-600">
            Hiển thị {filteredBookings.length} / {bookings.length} booking
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên tour, mã booking..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="last_month">Tháng trước</option>
            <option value="last_3_months">3 tháng trước</option>
            <option value="last_year">Năm trước</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="whitespace-nowrap"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          // Show skeleton cards while loading
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBookingCard key={index} />
          ))
        ) : currentBookings.length === 0 ? (
          // Empty state
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có booking nào
            </h3>
            <p className="text-gray-600 mb-4">
              Hãy đặt tour đầu tiên của bạn để bắt đầu hành trình!
            </p>
            <a href="/tours" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Khám phá tours
            </a>
          </Card>
        ) : (
          currentBookings.map((booking) => {
          const statusBadge = getStatusBadge(booking.status);
          const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
          const StatusIcon = statusBadge.icon;
          const isUpcoming = (booking.status === 'confirmed' || booking.status === 'pending') && new Date(booking.startDate) > new Date();
          
          // Check if tour should show warning (within 10 days)
          const shouldShowWarning = () => {
            if (!isUpcoming) return false;
            const now = new Date();
            const startDate = new Date(booking.startDate);
            const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilStart <= 10 && daysUntilStart > 0;
          };

          return (
            <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Tour Image & Info */}
                <div className="flex space-x-4 flex-1">
                  <img
                    src={booking.tourImage}
                    alt={booking.tourName}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {booking.tourName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Mã booking: <span className="font-mono font-semibold">{booking.id}</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusBadge.label}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentBadge.className}`}>
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{formatDate(booking.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{booking.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="h-4 w-4" />
                        <span>
                          {booking.adults} người lớn
                          {booking.children > 0 && `, ${booking.children} trẻ em`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(booking.totalPrice)}
                        </span>
                        <p className="text-xs text-gray-600">
                          Đặt ngày {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 lg:w-32">
                  {canCancelBooking(booking) && (
                    <button 
                      onClick={() => handleCancelBooking(Number(booking.id))}
                      className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Hủy booking
                    </button>
                  )}

                  {isUpcoming && (
                    <button 
                      onClick={() => handleViewTourDetail(booking.tourId, booking.tourSlug)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Xem tour
                    </button>
                  )}
                  
                  <button className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    PDF
                  </button>

                  {booking.status === 'pending' && booking.paymentStatus === 'pending' && (
                    <button className="inline-flex items-center justify-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Thanh toán
                    </button>
                  )}

                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Yêu cầu đặc biệt:</span> {booking.specialRequests}
                  </p>
                </div>
              )}

              {/* Upcoming Tour Alert */}
              {shouldShowWarning() && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Tour sắp diễn ra</p>
                      <p className="text-blue-700">
                        {(() => {
                          const now = new Date();
                          const startDate = new Date(booking.startDate);
                          const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return `Hãy chuẩn bị giấy tờ tùy thân và hành lý cần thiết. Chúng tôi sẽ liên hệ trước ${daysUntilStart} ngày khởi hành.`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        }))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <Card className="p-12 text-center">
          <CalendarDaysIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy booking nào
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc tìm kiếm khác'
              : 'Bạn chưa có booking nào. Hãy bắt đầu khám phá và đặt tour đầu tiên!'
            }
          </p>
          <div className="flex justify-center space-x-4">
            {(filters.search || filters.status !== 'all' || filters.dateRange !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
            <Link to="/tours">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Khám phá tours
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
        </>
      ) : (
        // Cancellation History Tab
        <div className="mb-6">
          <CancellationHistory 
            refreshTrigger={cancellationRefreshTrigger} 
            newCancellationData={newCancellationData}
          />
        </div>
      )}

      {/* Cancellation Request Modal */}
      <CancellationRequestForm
        isOpen={showCancellationForm}
        onClose={() => {
          setShowCancellationForm(false);
          setSelectedBookingForCancellation(null);
        }}
        onSuccess={handleCancellationSuccess}
        preselectedBookingId={selectedBookingForCancellation || undefined}
      />

      {/* Tour Detail Modal */}
      {selectedTourForDetail && (
        <TourDetailModal
          isOpen={showTourDetailModal}
          onClose={() => {
            setShowTourDetailModal(false);
            setSelectedTourForDetail(null);
          }}
          tourId={selectedTourForDetail.id}
          tourSlug={selectedTourForDetail.slug}
        />
      )}

    </div>
  );
};

export default BookingHistoryPage;
