import React, { useEffect, useState } from 'react';
import {
  MapIcon,
  CalendarDaysIcon,
  UsersIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api';

interface StatCard {
  name: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics
        const [toursRes, bookingsRes, usersRes, promotionsRes] = await Promise.all([
          apiClient.get('/admin/tours/count'),
          apiClient.get('/admin/bookings/statistics'),
          apiClient.get('/admin/users/count'),
          apiClient.get('/admin/promotions/count')
        ]);

        const statsData: StatCard[] = [
          {
            name: 'Total Tours',
            value: toursRes.data.data || 0,
            change: '+12%',
            changeType: 'increase',
            icon: MapIcon,
          },
          {
            name: 'Total Bookings',
            value: bookingsRes.data.data?.totalBookings || 0,
            change: '+23%',
            changeType: 'increase',
            icon: CalendarDaysIcon,
          },
          {
            name: 'Total Users',
            value: usersRes.data.data || 0,
            change: '+8%',
            changeType: 'increase',
            icon: UsersIcon,
          },
          {
            name: 'Active Promotions',
            value: promotionsRes.data.data || 0,
            change: '0%',
            changeType: 'neutral',
            icon: TagIcon,
          },
        ];

        setStats(statsData);

        // Fetch recent bookings
        const bookingsListRes = await apiClient.get('/admin/bookings?page=0&size=5&sortBy=id&sortDir=desc');
        setRecentBookings(bookingsListRes.data.data?.content || []);

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

      {/* Recent bookings */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
        </div>
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
                    No recent bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

