import React, { useEffect, useState, useRef } from 'react';
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
  CheckCircleIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

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
  tour?: {
    id: number;
    name: string;
  };
  totalPrice: number;
  confirmationStatus: string;
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

interface QuickStats {
  today: {
    newUsers: number;
    newBookings: number;
    revenue: number;
    activeUsers: number;
    cancelledBookings: number;
    cancellationRate: number;
  };
  thisWeek: {
    newUsers: number;
    newBookings: number;
    revenue: number;
    averageDaily: number;
  };
  thisMonth: {
    newUsers: number;
    newBookings: number;
    revenue: number;
    growth: number;
  };
  custom?: {
    newUsers: number;
    newBookings: number;
    revenue: number;
    cancelledBookings: number;
    cancellationRate: number;
    startDate: string;
    endDate: string;
  };
  alerts: {
    pendingBookings: number;
  };
}

interface TopPartner {
  partnerId: number;
  partnerName: string;
  totalRevenue: number;
  bookingCount: number;
}

interface ChartData {
  daily: Array<{ date: string; bookings: number; revenue: number }>;
  monthly: Array<{ month: string; bookings: number; revenue: number }>;
  byStatus: Array<{ status: string; count: number; percentage: number }>;
}

type TimeFilter = 'today' | 'week' | 'month' | 'custom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [topTours, setTopTours] = useState<TopTour[]>([]);
  const [topPartners, setTopPartners] = useState<TopPartner[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Calculate date range based on filter
        let startDate: string | undefined = undefined;
        let endDate: string | undefined = undefined;
        
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (timeFilter === 'today') {
          startDate = todayStart.toISOString();
          endDate = now.toISOString();
        } else if (timeFilter === 'week') {
          const weekStart = new Date(todayStart);
          weekStart.setDate(weekStart.getDate() - 7);
          startDate = weekStart.toISOString();
          endDate = now.toISOString();
        } else if (timeFilter === 'month') {
          const monthStart = new Date(todayStart);
          monthStart.setDate(monthStart.getDate() - 30);
          startDate = monthStart.toISOString();
          endDate = now.toISOString();
        } else if (timeFilter === 'custom' && customStartDate && customEndDate) {
          startDate = new Date(customStartDate).toISOString();
          endDate = new Date(customEndDate + 'T23:59:59').toISOString();
        }

        // Fetch quick stats with date range
        const quickStatsParams = new URLSearchParams();
        if (startDate) quickStatsParams.append('startDate', startDate);
        if (endDate) quickStatsParams.append('endDate', endDate);
        
        const [overviewRes, quickStatsRes, bookingsListRes, topToursRes, topPartnersRes, activitiesRes, chartRes] = await Promise.all([
          apiClient.get('/admin/statistics/overview'),
          apiClient.get(`/admin/dashboard/quick-stats?${quickStatsParams.toString()}`),
          apiClient.get('/admin/bookings?page=0&size=5&sortBy=id&sortDir=desc'),
          apiClient.get('/admin/statistics/tours/top'),
          apiClient.get(`/admin/dashboard/top-partners?limit=5${startDate ? `&startDate=${startDate}&endDate=${endDate}` : ''}`),
          apiClient.get('/admin/activities/recent?limit=8'),
          apiClient.get(`/admin/dashboard/charts/bookings${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`)
        ]);
        
        // Fetch AI insights separately (may take longer, has its own loading state)
        fetchAIInsights();
        
        const overviewData = overviewRes.data.data;
        const quickStatsData = quickStatsRes.data.data;
        setOverview(overviewData);
        setQuickStats(quickStatsData);
        setChartData(chartRes.data.data);
        
        // Update stats based on time filter
        let statsData: StatCard[] = [];
        if (quickStatsData) {
          const selectedStats = timeFilter === 'today' ? quickStatsData.today :
                               timeFilter === 'week' ? quickStatsData.thisWeek :
                               timeFilter === 'month' ? quickStatsData.thisMonth :
                               quickStatsData.custom || quickStatsData.thisMonth;
          
          if (selectedStats) {
            const revenue = typeof selectedStats.revenue === 'number' ? selectedStats.revenue : 
                           (selectedStats.revenue ? parseFloat(selectedStats.revenue.toString()) : 0);
            const averageDaily = typeof selectedStats.averageDaily === 'number' ? selectedStats.averageDaily : 
                                (selectedStats.averageDaily ? parseFloat(selectedStats.averageDaily.toString()) : 0);
            
            statsData = [
              {
                name: 'Doanh thu',
                value: formatPrice(revenue),
                change: timeFilter === 'month' && quickStatsData.thisMonth.growth ? 
                  `${quickStatsData.thisMonth.growth > 0 ? '+' : ''}${quickStatsData.thisMonth.growth.toFixed(1)}%` : 
                  timeFilter === 'week' && averageDaily > 0 ? `TB: ${formatPrice(averageDaily)}` : '',
                changeType: timeFilter === 'month' && quickStatsData.thisMonth.growth ? 
                  (quickStatsData.thisMonth.growth > 0 ? 'increase' : 'decrease') : 'neutral',
                icon: CurrencyDollarIcon,
              },
              {
                name: 'Booking mới',
                value: selectedStats.newBookings || 0,
                change: timeFilter === 'today' ? 'Hôm nay' : 
                       timeFilter === 'week' ? '7 ngày' : 
                       timeFilter === 'month' ? '30 ngày' : 'Tùy chọn',
                changeType: 'neutral',
                icon: CalendarDaysIcon,
              },
              {
                name: 'User mới',
                value: selectedStats.newUsers || 0,
                change: timeFilter === 'today' ? 'Hôm nay' : 
                       timeFilter === 'week' ? '7 ngày' : 
                       timeFilter === 'month' ? '30 ngày' : 'Tùy chọn',
                changeType: 'neutral',
                icon: UsersIcon,
              },
              {
                name: timeFilter === 'today' || timeFilter === 'custom' ? 'Tỉ lệ hủy' : 'Tour hoạt động',
                value: timeFilter === 'today' || timeFilter === 'custom' ? 
                  `${selectedStats.cancellationRate?.toFixed(1) || 0}%` : 
                  (overviewData.activeTours || 0),
                change: timeFilter === 'today' || timeFilter === 'custom' ? 
                  `${selectedStats.cancelledBookings || 0} hủy` : 
                  'Đang bán',
                changeType: 'neutral',
                icon: timeFilter === 'today' || timeFilter === 'custom' ? ExclamationTriangleIcon : MapIcon,
              },
            ];
          }
        }
        
        // Fallback to overview if quickStats not available
        if (statsData.length === 0) {
          statsData = [
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
        }

        setStats(statsData);
        setRecentBookings(bookingsListRes.data.data?.content || []);
        setTopTours(topToursRes.data.data?.slice(0, 5) || []);
        setTopPartners(topPartnersRes.data.data || []);
        setActivities(activitiesRes.data.data || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Lỗi khi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter, customStartDate, customEndDate]);
  
  // Fetch AI insights separately (cached for 1 hour)
  const fetchAIInsights = async () => {
    try {
      setLoadingAI(true);
      const response = await apiClient.get('/admin/ai/insights');
      if (response.data && response.data.data) {
        setAiInsights(response.data.data);
      } else {
        console.warn('AI insights response format unexpected:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching AI insights:', error);
      // Show user-friendly error message
      if (error.response?.status === 500) {
        toast.error('Lỗi khi tải AI insights. Vui lòng thử lại sau.');
      }
      // Don't set aiInsights to null to keep UI clean
    } finally {
      setLoadingAI(false);
    }
  };

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

  const formatShortPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return price.toString();
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams();
      
      if (timeFilter === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', new Date(customStartDate).toISOString());
        params.append('endDate', new Date(customEndDate + 'T23:59:59').toISOString());
      } else {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate: Date;
        
        if (timeFilter === 'today') {
          startDate = todayStart;
        } else if (timeFilter === 'week') {
          startDate = new Date(todayStart);
          startDate.setDate(startDate.getDate() - 7);
        } else {
          startDate = new Date(todayStart);
          startDate.setDate(startDate.getDate() - 30);
        }
        
        params.append('startDate', startDate.toISOString());
        params.append('endDate', now.toISOString());
      }
      
      const response = await apiClient.get(`/admin/dashboard/export/${format}?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Đã xuất báo cáo ${format.toUpperCase()} thành công`);
      setIsExportDropdownOpen(false);
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      toast.error('Lỗi khi xuất báo cáo');
    }
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    if (filter !== 'custom') {
      setShowCustomDatePicker(false);
      setCustomStartDate('');
      setCustomEndDate('');
    } else {
      setShowCustomDatePicker(true);
    }
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
          
          {/* Time Filter & Export */}
          <div className="flex items-center gap-3">
            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <select
                value={timeFilter}
                onChange={(e) => handleTimeFilterChange(e.target.value as TimeFilter)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="custom">Tùy chọn</option>
              </select>
              
              {showCustomDatePicker && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">đến</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {customStartDate && customEndDate && (
                    <button
                      onClick={() => {
                        setCustomStartDate('');
                        setCustomEndDate('');
                        setTimeFilter('today');
                        setShowCustomDatePicker(false);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Xuất dữ liệu
              </button>
              
              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                      Xuất CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <DocumentTextIcon className="h-4 w-4 text-green-500" />
                      Xuất Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
                          {booking.tour?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(booking.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.confirmationStatus === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : booking.confirmationStatus === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.confirmationStatus === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : booking.confirmationStatus === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.confirmationStatus === 'CONFIRMED'
                              ? 'Đã xác nhận'
                              : booking.confirmationStatus === 'PENDING'
                              ? 'Chờ xác nhận'
                              : booking.confirmationStatus === 'CANCELLED'
                              ? 'Đã hủy'
                              : booking.confirmationStatus === 'COMPLETED'
                              ? 'Hoàn thành'
                              : booking.confirmationStatus}
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

          {/* Charts */}
          {chartData && (
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">📊 Biểu đồ Doanh thu & Booking</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.daily?.slice(-14) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatShortPrice(value)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'revenue') return [formatPrice(value), 'Doanh thu'];
                        return [value, 'Booking'];
                      }}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      name="Doanh thu" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="bookings" 
                      name="Booking" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

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

          {/* Top Partners */}
          {topPartners.length > 0 && (
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">⭐ Top Đối tác</h3>
                  <button
                    onClick={() => navigate('/admin/partners')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xem tất cả →
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topPartners.map((partner, index) => (
                    <div key={partner.partnerId} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-purple-100 text-purple-800' :
                          index === 1 ? 'bg-indigo-100 text-indigo-800' :
                          index === 2 ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {partner.partnerName}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {partner.bookingCount} booking
                          </span>
                          <span className="text-xs font-semibold text-green-600">
                            {formatPrice(partner.totalRevenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
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
                  {recentBookings.filter(b => b.confirmationStatus === 'PENDING').length}
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
                          activity.status === 'PENDING' || activity.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : activity.status === 'CONFIRMED' || activity.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : activity.status === 'APPROVED'
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

      {/* AI Insights Card - Moved to bottom */}
      {aiInsights && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dự đoán từ AI</h2>
            </div>
            {loadingAI && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            )}
          </div>
          
          {/* Revenue Forecast with Chart */}
          {aiInsights.revenueForecast && (
            <div className="md:col-span-2 lg:col-span-4">
              <Card className="p-6 bg-white border-2 border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Doanh thu dự đoán</h3>
                      <p className="text-sm text-gray-500">Tháng tới</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(parseFloat(aiInsights.revenueForecast.nextMonth?.toString() || '0'))}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${
                        parseFloat(aiInsights.revenueForecast.growthRate?.toString() || '0') >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {parseFloat(aiInsights.revenueForecast.growthRate?.toString() || '0') >= 0 ? '+' : ''}
                        {parseFloat(aiInsights.revenueForecast.growthRate?.toString() || '0').toFixed(1)}%
                      </span>
                      <ArrowTrendingUpIcon className={`h-4 w-4 ${
                        parseFloat(aiInsights.revenueForecast.growthRate?.toString() || '0') >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} />
                    </div>
                  </div>
                </div>
                
                {/* Revenue Chart */}
                {aiInsights.revenueForecast.historicalData && Array.isArray(aiInsights.revenueForecast.historicalData) && (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart 
                        data={aiInsights.revenueForecast.historicalData.map((item: any) => {
                          // Safely parse revenue value - handle BigDecimal from backend
                          const revenueValue = item.revenue != null 
                            ? (typeof item.revenue === 'number' 
                                ? item.revenue 
                                : parseFloat(String(item.revenue)) || 0)
                            : 0;
                          const isPrediction = item.isPrediction === true;
                          
                          return {
                            name: item.monthName || item.month,
                            value: revenueValue,
                            actual: isPrediction ? null : revenueValue,
                            prediction: isPrediction ? revenueValue : null
                          };
                        })}
                        margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
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
                          formatter={(value: number, name: string, props: any) => {
                            if (value == null || isNaN(value)) return ['-', name === 'prediction' ? 'Dự đoán' : 'Thực tế'];
                            return [formatPrice(value), name === 'prediction' ? 'Dự đoán' : 'Thực tế'];
                          }}
                          labelFormatter={(label) => label}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#10b981' }}
                          activeDot={{ r: 6 }}
                          name="Thực tế"
                          connectNulls={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="prediction" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 5, fill: '#f59e0b' }}
                          activeDot={{ r: 6 }}
                          name="Dự đoán"
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Confidence: {parseFloat(aiInsights.revenueForecast.confidence?.toString() || '0').toFixed(1)}%</span>
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Thực tế
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          Dự đoán
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Booking Forecast with Chart */}
          {aiInsights.bookingForecast && (
            <div className="md:col-span-2 lg:col-span-4">
              <Card className="p-6 bg-white border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Booking dự đoán</h3>
                      <p className="text-sm text-gray-500">Tuần tới & Tháng tới</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {aiInsights.bookingForecast.nextWeek || 0} / tuần
                    </p>
                    <p className="text-lg text-gray-600 mt-1">
                      {aiInsights.bookingForecast.nextMonth || 0} / tháng
                    </p>
                  </div>
                </div>
                
                {/* Booking Chart */}
                {aiInsights.bookingForecast.historicalData && Array.isArray(aiInsights.bookingForecast.historicalData) && (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart 
                        data={aiInsights.bookingForecast.historicalData.map((item: any) => {
                          // Safely parse bookings value
                          const bookingsValue = item.bookings != null
                            ? (typeof item.bookings === 'number'
                                ? item.bookings
                                : parseInt(String(item.bookings)) || 0)
                            : 0;
                          const isPrediction = item.isPrediction === true;
                          
                          return {
                            name: item.monthName || item.month,
                            value: bookingsValue,
                            isPrediction: isPrediction
                          };
                        })}
                        margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number) => {
                            if (value == null || isNaN(value)) return ['-', 'Bookings'];
                            return [value, 'Bookings'];
                          }}
                          labelFormatter={(label) => label}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[4, 4, 0, 0]}
                          name="Bookings"
                        >
                          {aiInsights.bookingForecast.historicalData.map((item: any, index: number) => {
                            const isPrediction = item.isPrediction === true;
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={isPrediction ? '#f59e0b' : '#3b82f6'} 
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Confidence: {parseFloat(aiInsights.bookingForecast.confidence?.toString() || '0').toFixed(1)}%</span>
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Thực tế
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          Dự đoán
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            
            {/* Churn Prediction */}
            {aiInsights.churnPrediction && (
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${
                    aiInsights.churnPrediction.riskLevel === 'HIGH' ? 'text-red-600' :
                    aiInsights.churnPrediction.riskLevel === 'MEDIUM' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                  <h3 className="text-sm font-semibold text-gray-700">Nguy cơ rời bỏ</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {aiInsights.churnPrediction.atRiskUsers || 0} users
                </p>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  aiInsights.churnPrediction.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                  aiInsights.churnPrediction.riskLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {aiInsights.churnPrediction.riskLevel || 'LOW'}
                </span>
              </div>
            )}
            
            {/* Alerts Count */}
            {aiInsights.alerts && Array.isArray(aiInsights.alerts) && (
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="h-5 w-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Cảnh báo</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {aiInsights.alerts.length}
                </p>
                <span className="text-xs text-gray-500">
                  {aiInsights.alerts.filter((a: any) => a.severity === 'HIGH').length} HIGH
                </span>
              </div>
            )}
          </div>
          
          {/* Enhanced Alerts Section */}
          {aiInsights.alerts && Array.isArray(aiInsights.alerts) && aiInsights.alerts.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-orange-600" />
                  Cảnh báo & Thông báo
                </h3>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                  {aiInsights.alerts.length} cảnh báo
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiInsights.alerts.slice(0, 4).map((alert: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      alert.severity === 'HIGH' ? 'bg-red-50 border-red-300' :
                      alert.severity === 'MEDIUM' ? 'bg-orange-50 border-orange-300' :
                      'bg-yellow-50 border-yellow-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'HIGH' ? 'bg-red-100' :
                        alert.severity === 'MEDIUM' ? 'bg-orange-100' :
                        'bg-yellow-100'
                      }`}>
                        <span className="text-xl">{alert.icon || '⚠️'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">{alert.title}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            alert.severity === 'HIGH' ? 'bg-red-200 text-red-800' :
                            alert.severity === 'MEDIUM' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {aiInsights.alerts.length > 4 && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500">
                    và {aiInsights.alerts.length - 4} cảnh báo khác...
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      </div>
    </div>
  );
};

export default AdminDashboard;

