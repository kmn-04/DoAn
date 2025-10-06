import React, { useEffect, useState } from 'react';
import {
  MapIcon,
  CalendarDaysIcon,
  UsersIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  DocumentTextIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface StatCard {
  name: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

interface OverviewStats {
  thisMonthRevenue: number;
  thisMonthBookings: number;
  thisMonthNewUsers: number;
  bookingGrowth: number;
  activeTours: number;
}

interface RecentBooking {
  id: number;
  bookingCode: string;
  customerName: string;
  tourName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface TopTour {
  tourId: number;
  tourName: string;
  bookingCount: number;
  totalRevenue: number;
}

interface Activity {
  type: string;
  icon: string;
  title: string;
  description: string;
  time: string;
  timeAgo: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [topTours, setTopTours] = useState<TopTour[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch overview statistics
        const overviewRes = await apiClient.get('/admin/statistics/overview');
        const overviewData = overviewRes.data.data;
        setOverview(overviewData);

        const statsData: StatCard[] = [
          {
            name: 'Doanh thu tháng này',
            value: formatPrice(overviewData.thisMonthRevenue || 0),
            change: `${overviewData.bookingGrowth?.toFixed(1) || 0}%`,
            changeType: overviewData.bookingGrowth > 0 ? 'increase' : overviewData.bookingGrowth < 0 ? 'decrease' : 'neutral',
            icon: CurrencyDollarIcon,
          },
          {
            name: 'Booking tháng này',
            value: overviewData.thisMonthBookings || 0,
            change: `${overviewData.bookingGrowth?.toFixed(1) || 0}%`,
            changeType: overviewData.bookingGrowth > 0 ? 'increase' : overviewData.bookingGrowth < 0 ? 'decrease' : 'neutral',
            icon: CalendarDaysIcon,
          },
          {
            name: 'Khách hàng mới',
            value: overviewData.thisMonthNewUsers || 0,
            change: 'Tháng này',
            changeType: 'neutral',
            icon: UsersIcon,
          },
          {
            name: 'Tour Đang hoạt động',
            value: overviewData.activeTours || 0,
            change: 'Đang bán',
            changeType: 'neutral',
            icon: MapIcon,
          },
        ];

        setStats(statsData);

        // Fetch recent bookings, top tours, and activities
        const [bookingsListRes, topToursRes, activitiesRes] = await Promise.all([
          apiClient.get('/admin/bookings?page=0&size=5&sortBy=id&sortDir=desc'),
          apiClient.get('/admin/statistics/tours/top'),
          apiClient.get('/admin/activities/recent?limit=8')
        ]);
        
        setRecentBookings(bookingsListRes.data.data?.content || []);
        setTopTours(topToursRes.data.data?.slice(0, 5) || []);
        setActivities(activitiesRes.data.data || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : stat.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.changeType === 'increase' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-0.5" />
                      ) : stat.changeType === 'decrease' ? (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-0.5" />
                      ) : null}
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Left (Wide) + Right (Narrow) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent bookings */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Booking Gần đây</h3>
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Xem tất cả →
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {booking.bookingCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {booking.tourName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(booking.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(booking.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                        Không có booking gần đây
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Tours */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">🔥 Top Tour Bán chạy</h3>
                <button
                  onClick={() => navigate('/admin/statistics')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Xem chi tiết →
                </button>
              </div>
            </div>
            <div className="p-6">
              {topTours.length > 0 ? (
                <div className="space-y-4">
                  {topTours.map((tour, index) => (
                    <div key={tour.tourId} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {tour.tourName}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {tour.bookingCount} booking
                          </span>
                          <span className="text-xs font-semibold text-green-600">
                            {formatPrice(tour.totalRevenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions - COMPACT */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Thao tác nhanh</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => navigate('/admin/tours')}
                className="w-full flex items-center px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <PlusIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-900">Tạo Tour mới</span>
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="w-full flex items-center px-3 py-2 text-sm bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-900">Quản lý Booking</span>
              </button>
              <button
                onClick={() => navigate('/admin/promotions')}
                className="w-full flex items-center px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
              >
                <TagIcon className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-purple-900">Khuyến mãi</span>
              </button>
              <button
                onClick={() => navigate('/admin/statistics')}
                className="w-full flex items-center px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
              >
                <ArrowTrendingUpIcon className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-orange-900">Xem thống kê</span>
              </button>
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Cần xử lý</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  <span className="ml-2 text-sm text-yellow-900">Chờ xác nhận</span>
                </div>
                <span className="text-sm font-bold text-yellow-700">
                  {recentBookings.filter(b => b.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-sm text-blue-900">Booking mới</span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {overview?.thisMonthBookings || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="ml-2 text-sm text-green-900">Hệ thống OK</span>
                </div>
                <span className="text-xs text-green-600">✓</span>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card>
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Hoạt động gần đây</h3>
            </div>
            <div className="p-4">
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0">{activity.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {activity.timeAgo}
                        </p>
                      </div>
                      {activity.status && (
                        <span className={`flex-shrink-0 px-1.5 py-0.5 text-xs rounded ${
                          activity.status === 'Pending' || activity.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : activity.status === 'Confirmed' || activity.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : activity.status === 'Approved'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status === 'new' ? '🆕' : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">Chưa có hoạt động</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

