import React, { useEffect, useState, useRef } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MapIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    if (isExportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportDropdownOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatShortPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return price.toString();
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExportDropdownOpen(false);
      const endpoint = `/admin/statistics/export/revenue/${format}`;
      const response = await apiClient.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      link.setAttribute('download', `revenue_${new Date().toISOString().slice(0, 10)}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      alert(`Không thể xuất file ${format.toUpperCase()}. Vui lòng thử lại.`);
    }
  };

  // Colors for charts
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

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
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Thống kê Hệ thống</h1>
        <div className="relative inline-block" ref={exportDropdownRef}>
          <button
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            className={`admin-btn-primary flex items-center gap-2 ${isExportDropdownOpen ? 'bg-blue-700' : ''}`}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Xuất dữ liệu</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden transition-all duration-200 ease-in-out">
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Doanh thu (12 tháng)
                </div>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors duration-150 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <ArrowDownTrayIcon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Xuất CSV</div>
                    <div className="text-xs text-gray-500">Doanh thu 12 tháng (CSV)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors duration-150 group border-t border-gray-100"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                    <ArrowDownTrayIcon className="h-4 w-4 text-gray-600 group-hover:text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Xuất Excel</div>
                    <div className="text-xs text-gray-500">Doanh thu 12 tháng (XLSX)</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
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
          {/* Monthly Revenue - LINE CHART */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">📈 Doanh thu 12 tháng gần nhất</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="monthName" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatShortPrice(value)}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatPrice(value)}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Doanh thu"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookingCount" 
                    name="Số booking"
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    yAxisId={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Tours - BAR CHART */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">📊 Top 10 Tour Bán chạy</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topTours.slice(0, 10).map((tour, index) => ({
                    ...tour,
                    shortName: tour.tourName.length > 20 ? tour.tourName.substring(0, 20) + '...' : tour.tourName,
                    rank: index + 1
                  }))}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="shortName" 
                    tick={{ fontSize: 11 }}
                    width={150}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'totalRevenue') return [formatPrice(value), 'Doanh thu'];
                      return [value, 'Số booking'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bookingCount" name="Số booking" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* User Growth - AREA/BAR CHART */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">👥 Tăng trưởng Người dùng</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowth.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="monthName" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} người dùng`, 'Người dùng mới']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="newUsers" 
                    name="Người dùng mới"
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Revenue Summary - PIE CHART */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">🥧 Phân bổ Doanh thu</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary ? [
                      { name: 'Tháng này', value: summary.thisMonthRevenue },
                      { name: 'Tháng trước', value: summary.lastMonthRevenue },
                      { 
                        name: 'Các tháng khác (năm nay)', 
                        value: Math.max(0, summary.thisYearRevenue - summary.thisMonthRevenue - summary.lastMonthRevenue)
                      }
                    ].filter(item => item.value > 0) : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatShortPrice(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {summary && [
                      { name: 'Tháng này', value: summary.thisMonthRevenue },
                      { name: 'Tháng trước', value: summary.lastMonthRevenue },
                      { 
                        name: 'Các tháng khác', 
                        value: Math.max(0, summary.thisYearRevenue - summary.thisMonthRevenue - summary.lastMonthRevenue)
                      }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatPrice(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Tổng doanh thu năm nay</span>
                  <span className="text-lg font-bold text-blue-600">
                    {summary ? formatPrice(summary.thisYearRevenue) : '0 đ'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
