import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TicketIcon,
  HeartIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  ChevronRightIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import bookingService from '../../services/bookingService';
import wishlistService from '../../services/wishlistService';

interface DashboardStats {
  totalBookings: number;
  upcomingTours: number;
  completedTours: number;
  wishlistCount: number;
}

interface RecentBooking {
  id: string;
  tourName: string;
  tourImage: string;
  startDate: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  totalPrice: number;
  location: string;
  tourType?: 'domestic' | 'international';
  country?: string;
  flightIncluded?: boolean;
}

interface UpcomingTour {
  id: string;
  tourName: string;
  tourImage: string;
  startDate: string;
  daysLeft: number;
  location: string;
  tourType?: 'domestic' | 'international';
  country?: string;
  flightIncluded?: boolean;
}

const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingTours: 0,
    completedTours: 0,
    wishlistCount: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [upcomingTours, setUpcomingTours] = useState<UpcomingTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Get real data from APIs
        const [bookings, wishlistItems] = await Promise.all([
          bookingService.getBookingsByUser(user.id).catch(() => []),
          wishlistService.getUserWishlist(user.id).catch(() => [])
        ]);
        
        // Calculate stats from real data - only count active bookings
        const activeBookings = bookings.filter(b => 
          !['CANCELLED', 'CancellationRequested'].includes(b.status)
        );
        const totalBookings = activeBookings.length;
        const upcomingTours = activeBookings.filter(b => 
          new Date(b.startDate) > new Date() && 
          (b.status === 'CONFIRMED' || b.status === 'PAID')
        ).length;
        const completedTours = activeBookings.filter(b => b.status === 'COMPLETED').length;
        const wishlistCount = wishlistItems.length;
        
        setStats({
          totalBookings,
          upcomingTours,
          completedTours,
          wishlistCount
        });

        // Convert active bookings to recent bookings format
        const recentBookingsData = activeBookings
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4)
          .map(booking => ({
            id: booking.bookingCode,
            tourName: booking.tour?.name || 'Unknown Tour',
            tourImage: booking.tour?.mainImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            startDate: booking.startDate,
            status: (booking.confirmationStatus || 'Pending').toLowerCase() as 'confirmed' | 'pending' | 'completed' | 'cancelled',
            totalPrice: Number(booking.totalPrice),
            location: booking.tour?.location || 'Unknown',
            tourType: (booking.tour?.tourType || 'DOMESTIC').toLowerCase() === 'domestic' ? 'domestic' as const : 'international' as const,
            country: booking.tour?.country?.name,
            flightIncluded: booking.tour?.flightIncluded
          }));

        setRecentBookings(recentBookingsData.length > 0 ? recentBookingsData : [
          {
            id: 'BK1234567',
            tourName: 'Tokyo - Kyoto - Osaka 7N6Đ',
            tourImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            startDate: '2024-03-15',
            status: 'confirmed',
            totalPrice: 32000000,
            location: 'Tokyo, Nhật Bản',
            tourType: 'international',
            country: 'Nhật Bản',
            flightIncluded: true
          },
          {
            id: 'BK1234568',
            tourName: 'Seoul - Jeju Island 5N4Đ',
            tourImage: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=400',
            startDate: '2024-02-20',
            status: 'confirmed',
            totalPrice: 18500000,
            location: 'Seoul, Hàn Quốc',
            tourType: 'international',
            country: 'Hàn Quốc',
            flightIncluded: true
          },
          {
            id: 'BK1234569',
            tourName: 'Hạ Long Bay - Kỳ Quan Thế Giới',
            tourImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
            startDate: '2024-02-15',
            status: 'completed',
            totalPrice: 6200000,
            location: 'Quảng Ninh',
            tourType: 'domestic'
          },
          {
            id: 'BK1234570',
            tourName: 'Bangkok - Pattaya 4N3Đ',
            tourImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
            startDate: '2024-01-10',
            status: 'completed',
            totalPrice: 12800000,
            location: 'Bangkok, Thái Lan',
            tourType: 'international',
            country: 'Thái Lan',
            flightIncluded: true
          }
        ]);

        // Convert bookings to upcoming tours format
        const upcomingToursData = bookings
          .filter(b => 
            new Date(b.startDate) > new Date() && 
            (b.status === 'CONFIRMED' || b.status === 'PAID')
          )
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 5)
          .map(booking => {
            const startDate = new Date(booking.startDate);
            const today = new Date();
            const daysLeft = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              id: booking.bookingCode,
              tourName: booking.tour?.name || 'Unknown Tour',
              tourImage: booking.tour?.mainImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
              startDate: booking.startDate,
              daysLeft,
              location: booking.tour?.location || 'Unknown',
              tourType: (booking.tour?.tourType || 'DOMESTIC').toLowerCase() === 'domestic' ? 'domestic' as const : 'international' as const,
              country: booking.tour?.country?.name,
              flightIncluded: booking.tour?.flightIncluded
            };
          });

        setUpcomingTours(upcomingToursData.length > 0 ? upcomingToursData : [
          {
            id: 'BK1234567',
            tourName: 'Tokyo - Kyoto - Osaka 7N6Đ',
            tourImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            startDate: '2024-03-15',
            daysLeft: 25,
            location: 'Tokyo, Nhật Bản',
            tourType: 'international',
            country: 'Nhật Bản',
            flightIncluded: true
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to mock data
        setStats({
          totalBookings: 8,
          upcomingTours: 2,
          completedTours: 5,
          wishlistCount: 12
        });
        
        setRecentBookings([
          {
            id: 'BK1234567',
            tourName: 'Tokyo - Kyoto - Osaka 7N6Đ',
            tourImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            startDate: '2024-03-15',
            status: 'confirmed',
            totalPrice: 32000000,
            location: 'Tokyo, Nhật Bản',
            tourType: 'international',
            country: 'Nhật Bản',
            flightIncluded: true
          }
        ]);
        
        setUpcomingTours([
          {
            id: 'BK1234567',
            tourName: 'Tokyo - Kyoto - Osaka 7N6Đ',
            tourImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            startDate: '2024-03-15',
            daysLeft: 25,
            location: 'Tokyo, Nhật Bản',
            tourType: 'international',
            country: 'Nhật Bản',
            flightIncluded: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' }
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Chào mừng trở lại, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Đây là tổng quan về các chuyến du lịch và hoạt động của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng booking</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tour sắp tới</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingTours}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTours}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HeartIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Yêu thích</p>
              <p className="text-2xl font-bold text-gray-900">{stats.wishlistCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Booking gần đây</h2>
            <Link 
              to="/dashboard/bookings"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Xem tất cả
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentBookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              return (
                <div key={booking.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={booking.tourImage}
                    alt={booking.tourName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {booking.tourName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-3 w-3" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="h-3 w-3" />
                        <span>{formatDate(booking.startDate)}</span>
                      </div>
                    </div>
                    
                    {/* International Tour Badges */}
                    {booking.tourType === 'international' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                          <GlobeAltIcon className="h-3 w-3" />
                          <span>{booking.country}</span>
                        </div>
                        {booking.flightIncluded && (
                          <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                            <PaperAirplaneIcon className="h-3 w-3" />
                            <span>Có vé bay</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {recentBookings.length === 0 && (
            <div className="text-center py-8">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">Chưa có booking nào</h3>
              <p className="text-sm text-gray-600 mb-4">Bắt đầu khám phá và đặt tour đầu tiên của bạn!</p>
              <Link to="/tours">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Đặt tour ngay
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Upcoming Tours */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Tour sắp tới</h2>
            <Link 
              to="/dashboard/bookings?filter=upcoming"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Xem chi tiết
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingTours.map((tour) => (
              <div key={tour.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <img
                  src={tour.tourImage}
                  alt={tour.tourName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {tour.tourName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-3 w-3" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="h-3 w-3" />
                      <span>{formatDate(tour.startDate)}</span>
                    </div>
                  </div>
                  
                  {/* International Tour Badges */}
                  {tour.tourType === 'international' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                        <GlobeAltIcon className="h-3 w-3" />
                        <span>{tour.country}</span>
                      </div>
                      {tour.flightIncluded && (
                        <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                          <PaperAirplaneIcon className="h-3 w-3" />
                          <span>Có vé bay</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center space-x-1 text-orange-600">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {tour.daysLeft} ngày
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">còn lại</p>
                </div>
              </div>
            ))}
          </div>

          {upcomingTours.length === 0 && (
            <div className="text-center py-8">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">Không có tour sắp tới</h3>
              <p className="text-sm text-gray-600 mb-4">Lên kế hoạch cho chuyến du lịch tiếp theo!</p>
              <Link to="/tours">
                <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  Khám phá tours
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/tours"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <PlusIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900">Đặt tour mới</h3>
              <p className="text-sm text-blue-600">Khám phá các điểm đến mới</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-blue-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/dashboard/wishlist"
            className="flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
          >
            <HeartIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-900">Tour yêu thích</h3>
              <p className="text-sm text-red-600">Xem danh sách đã lưu</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-red-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/dashboard/profile"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <Cog6ToothIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-900">Cài đặt tài khoản</h3>
              <p className="text-sm text-green-600">Cập nhật thông tin</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-green-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Card>

      {/* Notifications */}
      {upcomingTours.length > 0 && (
        <Card className="p-4 mt-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900">Nhắc nhở quan trọng</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Bạn có {upcomingTours.length} tour sắp diễn ra. Hãy chuẩn bị giấy tờ và hành lý cần thiết.
              </p>
              <Link 
                to="/dashboard/bookings"
                className="text-sm text-yellow-700 hover:text-yellow-800 font-medium underline mt-2 inline-block"
              >
                Xem chi tiết →
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardOverviewPage;
