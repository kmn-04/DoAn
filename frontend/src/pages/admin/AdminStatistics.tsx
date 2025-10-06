import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api';

interface MonthlyRevenue {
  month: string;
  monthName: string;
  revenue: number;
  bookingCount: number;
}

interface TopTour {
  tourId: number;
  tourName: string;
  bookingCount: number;
  totalRevenue: number;
}

interface UserGrowth {
  month: string;
  monthName: string;
  newUsers: number;
}

interface RevenueSummary {
  thisMonthRevenue: number;
  thisMonthBookings: number;
  thisYearRevenue: number;
  totalRevenue: number;
  lastMonthRevenue: number;
  growthRate: number;
}

const AdminStatistics: React.FC = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topTours, setTopTours] = useState<TopTour[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [monthlyRes, topToursRes, userGrowthRes, summaryRes] = await Promise.all([
          apiClient.get('/admin/statistics/revenue/monthly'),
          apiClient.get('/admin/statistics/tours/top'),
          apiClient.get('/admin/statistics/users/growth'),
          apiClient.get('/admin/statistics/revenue/summary')
        ]);

        // Backend returns List, frontend expects array
        const monthlyData = monthlyRes.data.data || [];
        const userGrowthData = userGrowthRes.data.data || [];
        
        setMonthlyRevenue(Array.isArray(monthlyData) ? monthlyData : Object.values(monthlyData));
        setTopTours(topToursRes.data.data || []);
        setUserGrowth(Array.isArray(userGrowthData) ? userGrowthData : Object.values(userGrowthData));
        setSummary(summaryRes.data.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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
        <h1 className="text-2xl font-bold text-gray-900">Thống kê Hệ thống</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Doanh thu tháng này</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary ? formatPrice(summary.thisMonthRevenue) : '0 đ'}
                </p>
                <p className={`text-sm mt-1 ${summary && summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary ? `${summary.growthRate.toFixed(1)}% so với tháng trước` : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MapIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Booking tháng này</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.thisMonthBookings || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">booking</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Doanh thu năm nay</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary ? formatPrice(summary.thisYearRevenue) : '0 đ'}
                </p>
                <p className="text-sm text-gray-500 mt-1">năm 2025</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary ? formatPrice(summary.totalRevenue) : '0 đ'}
                </p>
                <p className="text-sm text-gray-500 mt-1">toàn thời gian</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Revenue */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Doanh thu 12 tháng gần nhất</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {monthlyRevenue.slice(-6).reverse().map((month, index) => {
                  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue || 0));
                  return (
                    <div key={month.month || index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{month.monthName}</p>
                        <div className="mt-1 relative">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${maxRevenue > 0 ? Math.min((month.revenue / maxRevenue) * 100, 100) : 0}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(month.revenue || 0)}</p>
                        <p className="text-xs text-gray-500">{month.bookingCount} booking</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Top Tours */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top 10 Tour Bán chạy</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {topTours.slice(0, 10).map((tour, index) => (
                  <div key={tour.tourId} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="ml-3 text-sm font-medium text-gray-900 truncate">{tour.tourName}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">{tour.bookingCount} booking</p>
                      <p className="text-xs text-gray-500">{formatPrice(tour.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* User Growth */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tăng trưởng Người dùng</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {userGrowth.slice(-6).reverse().map((month, index) => {
                  const maxUsers = Math.max(...userGrowth.map(m => m.newUsers || 0));
                  return (
                    <div key={month.month || index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{month.monthName}</p>
                        <div className="mt-1 relative">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${maxUsers > 0 ? Math.min((month.newUsers / maxUsers) * 100, 100) : 0}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900">+{month.newUsers || 0}</p>
                        <p className="text-xs text-gray-500">người dùng</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Revenue Summary Table */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tổng quan Doanh thu</h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Tháng này</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {summary ? formatPrice(summary.thisMonthRevenue) : '0 đ'}
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Tháng trước</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {summary ? formatPrice(summary.lastMonthRevenue) : '0 đ'}
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Năm nay</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {summary ? formatPrice(summary.thisYearRevenue) : '0 đ'}
                  </dd>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <dt className="text-base font-medium text-gray-900">Tổng cộng</dt>
                  <dd className="text-lg font-bold text-blue-600">
                    {summary ? formatPrice(summary.totalRevenue) : '0 đ'}
                  </dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
