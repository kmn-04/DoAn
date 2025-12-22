import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Pagination, BookingCardSkeleton } from '../../components/ui';
import { bookingService } from '../../services';
import { vnpayService } from '../../services/vnpayService';
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

const BookingHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // 0-based indexing to match Pagination component
  const [highlightBookingId, setHighlightBookingId] = useState<string | null>(
    searchParams.get('highlight')
  );
  
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
        }
        
        // Get bookings for current user
        const bookingResponses = await bookingService.getBookingsByUser(user.id);
        
        console.log('📊 All bookings from API:', bookingResponses.length);
        bookingResponses.forEach(booking => {
          console.log(`  - Booking ${booking.id}: confirmationStatus = "${booking.confirmationStatus}"`);
        });
        
        // Filter out cancelled bookings first
        const activeBookingResponses = bookingResponses.filter(booking => {
          const status = booking.confirmationStatus || '';
          // Backend returns status in UPPERCASE (e.g., "CANCELLED", "CANCELLATION_REQUESTED")
          const shouldExclude = ['CANCELLED', 'CANCELLATION_REQUESTED'].includes(status);
          console.log(`  Filter booking ${booking.id}: status="${status}", exclude=${shouldExclude}`);
          return !shouldExclude;
        });
        
        console.log('✅ Active bookings after filter:', activeBookingResponses.length);
        
        // Convert BookingResponse to local Booking interface
        const convertedBookings: Booking[] = activeBookingResponses.map(booking => {
          // Map confirmationStatus from backend enum (Pending, Confirmed, etc.) to lowercase
          const mapConfirmationStatus = (status: string | undefined): 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'cancellation_requested' => {
            if (!status) return 'pending';
            const statusUpper = status.toUpperCase();
            if (statusUpper === 'CANCELLATION_REQUESTED') return 'cancellation_requested';
            return statusUpper.toLowerCase() as 'confirmed' | 'pending' | 'completed' | 'cancelled';
          };

          // Map paymentStatus from backend enum (Unpaid, Paid, etc.) to frontend format
          const mapPaymentStatus = (status: string | undefined): 'paid' | 'pending' | 'failed' => {
            if (!status) return 'pending';
            const statusUpper = status.toUpperCase();
            if (statusUpper === 'PAID') {
              return 'paid';
            } else if (statusUpper === 'UNPAID' || statusUpper === 'PARTIALLYPAID') {
              return 'pending';
            } else if (statusUpper === 'REFUNDING' || statusUpper === 'REFUNDED') {
              return 'failed';
            }
            return 'pending';
          };

          return {
            id: String(booking.id), // Use booking ID as string for frontend compatibility
            tourId: booking.tour?.id || 0,
            tourName: booking.tour?.name || 'Unknown Tour',
            tourSlug: booking.tour?.slug || '',
            tourImage: booking.tour?.mainImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            startDate: booking.startDate,
            endDate: booking.schedule?.returnDate || booking.startDate,
            duration: booking.tour?.duration ? `${booking.tour.duration} ngày` : '1 ngày',
            location: booking.tour?.destination || booking.tour?.departureLocation || 'Unknown',
            adults: booking.numAdults,
            children: booking.numChildren,
            totalPrice: Number(booking.finalAmount || booking.totalPrice),
            status: mapConfirmationStatus(booking.confirmationStatus),
            paymentStatus: mapPaymentStatus(booking.paymentStatus),
            bookingDate: booking.createdAt,
            specialRequests: booking.specialRequests
          };
        });
        
        setBookings(convertedBookings);
        
      } catch (error) {
        console.error('Error fetching bookings:', error);
        
        const errorEvent = new CustomEvent('show-toast', {
          detail: {
            type: 'error',
            title: t('booking.history.errors.loadError'),
            message: t('booking.history.errors.loadMessage')
          }
        });
        window.dispatchEvent(errorEvent);
        
        setBookings([]);
        
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  // Handle highlight and auto-scroll
  useEffect(() => {
    if (highlightBookingId && bookings.length > 0) {
      // Find the booking to get its name for toast
      const highlightedBooking = bookings.find(b => b.id === highlightBookingId);
      
      // Show toast notification
      if (highlightedBooking) {
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            title: t('booking.history.errors.found'),
            message: t('booking.history.errors.foundMessage', { name: highlightedBooking.tourName })
          }
        });
        window.dispatchEvent(event);
      }
      
      // Auto-scroll to highlighted booking after a short delay
      const timer = setTimeout(() => {
        const element = document.getElementById(`booking-${highlightBookingId}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            setHighlightBookingId(null);
            // Remove highlight param from URL
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('highlight');
            setSearchParams(newSearchParams, { replace: true });
          }, 5000);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [highlightBookingId, bookings, searchParams, setSearchParams]);

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
          (booking.status === 'confirmed' || booking.status === 'pending') && new Date(booking.startDate) > new Date()
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
    setCurrentPage(0);
  }, [filters, bookings, activeTab, setSearchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ComponentType<any> }> = {
      confirmed: { label: t('booking.history.status.confirmed'), className: 'bg-amber-50 text-amber-800 border-amber-200', icon: CheckCircleIcon },
      pending: { label: t('booking.history.status.pending'), className: 'bg-stone-100 text-slate-700 border-stone-300', icon: ClockIcon },
      completed: { label: t('booking.history.status.completed'), className: 'bg-slate-900 text-white border-slate-700', icon: CheckCircleIcon },
      cancelled: { label: t('booking.history.status.cancelled'), className: 'bg-stone-200 text-slate-600 border-stone-400', icon: XCircleIcon }
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200', icon: ClockIcon };
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      paid: { label: t('booking.history.payment.paid'), className: 'bg-amber-50 text-amber-800' },
      pending: { label: t('booking.history.payment.pending'), className: 'bg-stone-100 text-slate-700' },
      unpaid: { label: t('booking.history.payment.unpaid'), className: 'bg-stone-100 text-slate-700' },
      partiallypaid: { label: t('booking.history.payment.partial'), className: 'bg-amber-100 text-amber-700' },
      refunding: { label: t('booking.history.payment.refunding'), className: 'bg-slate-100 text-slate-700' },
      refunded: { label: t('booking.history.payment.refunded'), className: 'bg-slate-900 text-white' },
      failed: { label: t('booking.history.payment.failed'), className: 'bg-stone-200 text-slate-600' }
    };
    return badges[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-800' };
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
    setSelectedBookingForCancellation(bookingId);
    setShowCancellationForm(true);
  };


  // Tour detail methods
  const handleViewTourDetail = (tourId: number, tourSlug?: string) => {
    setSelectedTourForDetail({ id: tourId, slug: tourSlug });
    setShowTourDetailModal(true);
  };

  const handleRetryPayment = async (booking: Booking) => {
    try {
      // Create VNPay payment directly
      const vnpayRequest = {
        bookingId: parseInt(booking.id),
        amount: booking.totalPrice,
        orderInfo: `Thanh toan tour ${booking.tourName} - ${booking.id}`
      };
      
      console.log('Creating VNPay payment for retry:', vnpayRequest);
      
      const response = await vnpayService.createPayment(vnpayRequest);
      
      console.log('VNPay payment URL created:', response.paymentUrl);
      
      // Redirect to VNPay
      window.location.href = response.paymentUrl;
    } catch (error: unknown) {
      console.error('Error creating VNPay payment:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('booking.history.errors.paymentFailed');
      alert(`${t('booking.history.errors.paymentError')} ${errorMessage}`);
    }
  };

  const handleCancellationSuccess = (cancellationData: any) => {
    // IMMEDIATE UPDATE: Remove the booking from the list immediately for better UX
    // Try to get booking ID from cancellation data or fallback to selected booking
    const bookingIdToUpdate = cancellationData?.bookingId || selectedBookingForCancellation;
    
    if (bookingIdToUpdate) {
      setBookings(prev => {
        const updated = prev.map(booking => {
          const bookingIdStr = String(booking.id);
          const targetIdStr = String(bookingIdToUpdate);
          return bookingIdStr === targetIdStr 
            ? { ...booking, status: 'cancellation_requested' as any }
            : booking;
        });
        
        return updated;
      });
    } else {
    }
    
    // Show success message
    const event = new CustomEvent('show-toast', {
      detail: {
        type: 'success',
        title: t('booking.history.errors.cancellationSuccess'),
        message: t('booking.history.errors.cancellationMessage'),
        duration: 5000
      }
    });
    window.dispatchEvent(event);

    // Store the new cancellation data
    setNewCancellationData(cancellationData);

    // IMPORTANT: Refresh bookings to reflect status changes from backend
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
    // Can request cancellation if:
    // 1. Start date is in the future
    // 2. Not already cancelled, completed, or cancellation requested
    // 3. Payment status is 'paid' (đã thanh toán)
    const startDate = new Date(booking.startDate);
    const now = new Date();
    const isInFuture = startDate > now;
    const notCancelledOrCompleted = booking.status !== 'cancellation_requested' && booking.status !== 'cancelled' && booking.status !== 'completed';
    const isPaid = booking.paymentStatus === 'paid';
    
    return isInFuture && notCancelledOrCompleted && isPaid;
  };

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', dateRange: 'all' });
  };

  // Pagination (0-based indexing)
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = currentPage * bookingsPerPage;
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
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-normal text-slate-900 mb-2 tracking-tight">{t('booking.history.title')}</h1>
          <p className="text-gray-600 font-normal">{t('booking.history.subtitle')}</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 animate-fade-in-up opacity-0 delay-100">
          <div className="bg-white border border-stone-200 rounded-none p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => handleTabChange('bookings')}
                className={`flex-1 py-3 px-6 font-medium text-sm rounded-none transition-all duration-300 ${
                  activeTab === 'bookings'
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
                style={activeTab === 'bookings' ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
              >
                {t('booking.history.tabs.bookings', { count: bookings.length })}
              </button>
              <button
                onClick={() => handleTabChange('cancellations')}
                className={`flex-1 py-3 px-6 font-medium text-sm rounded-none transition-all duration-300 ${
                  activeTab === 'cancellations'
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
                style={activeTab === 'cancellations' ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
              >
                {t('booking.history.tabs.cancellations')}
              </button>
            </nav>
          </div>
        </div>

      {/* Tab Content */}
      {activeTab === 'bookings' ? (
        <>
          {/* Filters */}
          <Card className="p-6 mb-6 bg-white border border-stone-200 rounded-none animate-fade-in-up opacity-0 delay-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-xl font-medium text-slate-900 flex items-center tracking-tight">
                <FunnelIcon className="h-5 w-5 mr-2" style={{ color: '#D4AF37' }} />
                {t('booking.history.filters.title')}
              </h2>
              
              <div className="text-sm font-normal" style={{ color: '#D4AF37' }}>
                {t('booking.history.filters.showing', { display: filteredBookings.length, total: bookings.length })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5" style={{ color: '#D4AF37' }} />
                <input
                  type="text"
                  placeholder={t('booking.history.filters.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
              >
                <option value="all">{t('booking.history.filters.status.all')}</option>
                <option value="upcoming">{t('booking.history.filters.status.upcoming')}</option>
                <option value="confirmed">{t('booking.history.filters.status.confirmed')}</option>
                <option value="pending">{t('booking.history.filters.status.pending')}</option>
                <option value="completed">{t('booking.history.filters.status.completed')}</option>
                <option value="cancelled">{t('booking.history.filters.status.cancelled')}</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
              >
                <option value="all">{t('booking.history.filters.dateRange.all')}</option>
                <option value="last_month">{t('booking.history.filters.dateRange.lastMonth')}</option>
                <option value="last_3_months">{t('booking.history.filters.dateRange.last3Months')}</option>
                <option value="last_year">{t('booking.history.filters.dateRange.lastYear')}</option>
              </select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="whitespace-nowrap border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
              >
                {t('booking.history.filters.clear')}
              </Button>
            </div>
          </Card>

      {/* Bookings List */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          // Show skeleton cards while loading
          Array.from({ length: 3 }).map((_, index) => (
            <BookingCardSkeleton key={index} />
          ))
        ) : currentBookings.length === 0 ? (
          // Empty state
          <Card className="p-12 text-center bg-white border border-stone-200 rounded-none">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
              {t('booking.history.empty.title')}
            </h3>
            <p className="text-gray-600 mb-6 font-normal">
              {t('booking.history.empty.description')}
            </p>
            <a href="/tours" className="inline-flex items-center justify-center px-6 py-3 text-white rounded-none font-medium transition-all duration-300 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
              {t('booking.history.empty.explore')}
            </a>
          </Card>
        ) : (
          currentBookings.map((booking) => {
          const statusBadge = getStatusBadge(booking.status);
          const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
          const StatusIcon = statusBadge.icon;
          
          // Debug
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
            <Card 
              key={booking.id} 
              id={`booking-${booking.id}`}
              className={`p-6 bg-white border rounded-none hover:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in opacity-0 ${
                highlightBookingId === booking.id 
                  ? 'border-yellow-400 bg-yellow-50 shadow-lg ring-2 ring-yellow-200' 
                  : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Tour Image & Info */}
                <div className="flex space-x-4 flex-1">
                  <img
                    src={booking.tourImage}
                    alt={booking.tourName}
                    className="w-24 h-24 object-cover rounded-none flex-shrink-0 border border-stone-200"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1 tracking-tight">
                          {booking.tourName}
                        </h3>
                        <p className="text-sm text-gray-600 font-normal">
                          {t('booking.history.bookingCode')} <span className="font-mono font-medium" style={{ color: '#D4AF37' }}>{booking.id}</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {/* Confirmation Status Badge */}
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-none text-xs font-medium border ${statusBadge.className}`}>
                          <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                          {statusBadge.label}
                        </div>
                        {/* Payment Status Badge */}
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-none text-xs font-medium ${paymentBadge.className}`}>
                          <CreditCardIcon className="h-3.5 w-3.5 mr-1.5" />
                          {paymentBadge.label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                        <span className="font-normal">{booking.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                        <span className="font-normal">{formatDate(booking.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                        <span className="font-normal">{booking.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                        <span className="font-normal">
                          {t('booking.history.details.adults', { count: booking.adults })}
                          {booking.children > 0 && `, ${t('booking.history.details.children', { count: booking.children })}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-normal" style={{ color: '#D4AF37' }}>
                          {formatPrice(booking.totalPrice)}
                        </span>
                        <p className="text-xs text-gray-600 font-normal">
                          {t('booking.history.details.bookedOn', { date: formatDate(booking.bookingDate) })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 lg:w-32">
                  {/* Nút Xem chi tiết - Hiển thị cho TẤT CẢ booking */}
                  <button 
                    onClick={() => handleViewTourDetail(booking.tourId, booking.tourSlug)}
                    className="inline-flex items-center justify-center px-3 py-2 text-white rounded-none text-sm font-medium transition-all duration-300 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {t('booking.history.actions.view')}
                  </button>

                  {/* Nút Yêu cầu hủy - Chỉ hiển thị cho booking đã thanh toán */}
                  {booking.paymentStatus === 'paid' && canCancelBooking(booking) && (
                    <button 
                      onClick={() => handleCancelBooking(Number(booking.id))}
                      className="inline-flex items-center justify-center px-3 py-2 border-2 border-slate-900 rounded-none text-sm font-medium text-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      {t('booking.history.actions.cancel')}
                    </button>
                  )}

                  {/* Nút Thanh toán - Hiển thị cho booking chưa thanh toán */}
                  {booking.paymentStatus === 'pending' && (
                    <button 
                      onClick={() => handleRetryPayment(booking)}
                      className="inline-flex items-center justify-center px-3 py-2 text-white rounded-none text-sm font-medium transition-all duration-300 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                    >
                      <CreditCardIcon className="h-4 w-4 mr-1" />
                      {t('booking.history.actions.pay')}
                    </button>
                  )}

                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('booking.history.specialRequests')}</span> {booking.specialRequests}
                  </p>
                </div>
              )}

              {/* Upcoming Tour Alert */}
              {shouldShowWarning() && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-none">
                    <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                    <div className="text-sm">
                      <p className="font-medium text-slate-900 tracking-tight">{t('booking.history.upcomingAlert.title')}</p>
                      <p className="text-gray-700 font-normal">
                        {(() => {
                          const now = new Date();
                          const startDate = new Date(booking.startDate);
                          const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return t('booking.history.upcomingAlert.message', { days: daysUntilStart });
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
            {t('booking.history.empty.noResults')}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
              ? t('booking.history.empty.noResultsDescription')
              : t('booking.history.empty.noBookingsDescription')
            }
          </p>
          <div className="flex justify-center space-x-4">
            {(filters.search || filters.status !== 'all' || filters.dateRange !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                {t('booking.history.filters.clear')}
              </Button>
            )}
            <Link to="/tours">
              <Button className="text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                {t('booking.history.empty.explore')}
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
    </div>
  );
};

export default BookingHistoryPage;
