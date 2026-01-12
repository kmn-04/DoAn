import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Pagination from '../../components/ui/Pagination';
import { apiClient } from '../../services/api';
import '../../styles/admin.css';

interface LoyaltyConfig {
  id: number;
  configKey: string;
  configValue: string;
  configType: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PointTransaction {
  id: number;
  userId: number;
  points: number;
  transactionType: string;
  sourceType: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  expiresAt?: string | null;
}

interface TransactionStats {
  totalTransactions: number;
  earnedCount: number;
  redeemedCount: number;
  expiredCount: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

interface MonthlyAnalytics {
  month: string;
  monthLabel: string;
  earned: number;
  redeemed: number;
  expired: number;
  net: number;
}

interface LoyaltyPoints {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  level: string;
}

const AdminLoyalty: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'transactions' | 'analytics' | 'topUsers'>('config');
  
  // Config state
  const [configs, setConfigs] = useState<LoyaltyConfig[]>([]);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<LoyaltyConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    configValue: '',
    description: '',
    isActive: true
  });

  // Transaction state
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);
  
  // Filters
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  
  // Analytics state
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Top users state
  const [topUsers, setTopUsers] = useState<LoyaltyPoints[]>([]);
  const [topUsersLoading, setTopUsersLoading] = useState(false);
  
  // Export dropdown
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'config') {
      fetchConfigs();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
      fetchTransactionStats();
    } else if (activeTab === 'analytics') {
      fetchMonthlyAnalytics();
    } else if (activeTab === 'topUsers') {
      fetchTopUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, userIdFilter, transactionTypeFilter, startDateFilter, endDateFilter]);
  
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

  const fetchConfigs = useCallback(async () => {
    try {
      setConfigsLoading(true);
      const response = await apiClient.get('/admin/loyalty/configs');
      setConfigs(response.data.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setConfigsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        size: 20
      };
      if (userIdFilter) {
        params.userId = parseInt(userIdFilter);
      }
      if (transactionTypeFilter !== 'all') {
        params.transactionType = transactionTypeFilter;
      }
      if (startDateFilter) {
        params.startDate = startDateFilter;
      }
      if (endDateFilter) {
        params.endDate = endDateFilter;
      }
      
      const response = await apiClient.get('/admin/loyalty/transactions', { params });
      const pageData = response.data.data;
      setTransactions(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [currentPage, userIdFilter, transactionTypeFilter, startDateFilter, endDateFilter]);

  const fetchTransactionStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/loyalty/transactions/stats');
      setTransactionStats(response.data.data);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
    }
  }, []);
  
  const fetchMonthlyAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const response = await apiClient.get('/admin/loyalty/analytics/monthly', {
        params: { months: 12 }
      });
      setMonthlyAnalytics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching monthly analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);
  
  const fetchTopUsers = useCallback(async () => {
    try {
      setTopUsersLoading(true);
      const response = await apiClient.get('/admin/loyalty/top-users', {
        params: { limit: 20 }
      });
      setTopUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching top users:', error);
    } finally {
      setTopUsersLoading(false);
    }
  }, []);
  
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const params: Record<string, string> = {};
      if (userIdFilter) {
        params.userId = userIdFilter;
      }
      if (transactionTypeFilter !== 'all') {
        params.transactionType = transactionTypeFilter;
      }
      if (startDateFilter) {
        params.startDate = startDateFilter;
      }
      if (endDateFilter) {
        params.endDate = endDateFilter;
      }
      
      const response = await apiClient.get(`/admin/loyalty/transactions/export/${format}`, {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `point_transactions_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setIsExportDropdownOpen(false);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu');
    }
  };
  
  const handleExportTopUsers = async (format: 'csv' | 'excel') => {
    try {
      const response = await apiClient.get(`/admin/loyalty/top-users/export/${format}`, {
        params: { limit: 20 },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `top_users_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting top users:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu');
    }
  };

  const handleUpdateConfig = async (configId: number) => {
    try {
      await apiClient.put(`/admin/loyalty/configs/${configId}`, configForm);
      await fetchConfigs();
      setEditingConfig(null);
      setConfigForm({ configValue: '', description: '', isActive: true });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || 'Có lỗi xảy ra';
      alert(message);
    }
  };

  const startEditConfig = (config: LoyaltyConfig) => {
    setEditingConfig(config);
    setConfigForm({
      configValue: config.configValue,
      description: config.description || '',
      isActive: config.isActive
    });
  };

  const cancelEdit = () => {
    setEditingConfig(null);
    setConfigForm({ configValue: '', description: '', isActive: true });
  };

  const getConfigTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'EARNING_RATE': 'Tỷ lệ tích điểm',
      'LEVEL_THRESHOLD': 'Ngưỡng level',
      'REDEMPTION_RATE': 'Tỷ lệ đổi điểm',
      'BONUS_RULE': 'Quy tắc thưởng',
      'EXPIRY_RULE': 'Quy tắc hết hạn',
      'GENERAL': 'Cấu hình chung'
    };
    return labels[type] || type;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'EARNED': 'Tích điểm',
      'REDEEMED': 'Đổi điểm',
      'EXPIRED': 'Hết hạn',
      'ROLLBACK': 'Hoàn trả'
    };
    return labels[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    if (type === 'EARNED') return 'text-green-600 bg-green-50';
    if (type === 'REDEEMED' || type === 'EXPIRED') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="admin-title">Quản lý điểm thưởng</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'config'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 inline mr-2" />
              Cấu hình
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5 inline mr-2" />
              Lịch sử giao dịch
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartPieIcon className="h-5 w-5 inline mr-2" />
              Phân tích
            </button>
            <button
              onClick={() => setActiveTab('topUsers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'topUsers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Top Users
            </button>
          </nav>
        </div>

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="admin-table-container">
            {configsLoading ? (
              <div className="admin-loading">
                <ArrowPathIcon className="admin-spinner" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="admin-table-th">Key</th>
                      <th className="admin-table-th">Loại</th>
                      <th className="admin-table-th">Giá trị</th>
                      <th className="admin-table-th">Mô tả</th>
                      <th className="admin-table-th">Trạng thái</th>
                      <th className="admin-table-th text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="admin-table-body">
                    {configs.map((config) => (
                      <tr key={config.id} className="admin-table-row">
                        <td className="admin-table-td font-medium">
                          {config.configKey}
                        </td>
                        <td className="admin-table-td text-gray-500">
                          {getConfigTypeLabel(config.configType)}
                        </td>
                        <td className="admin-table-td">
                          {editingConfig?.id === config.id ? (
                            <input
                              type="text"
                              value={configForm.configValue}
                              onChange={(e) => setConfigForm({ ...configForm, configValue: e.target.value })}
                              className="admin-input"
                            />
                          ) : (
                            <span className="font-mono">{config.configValue}</span>
                          )}
                        </td>
                        <td className="admin-table-td text-gray-500">
                          {editingConfig?.id === config.id ? (
                            <input
                              type="text"
                              value={configForm.description}
                              onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                              className="admin-input"
                            />
                          ) : (
                            config.description || '-'
                          )}
                        </td>
                        <td className="admin-table-td whitespace-nowrap">
                          {editingConfig?.id === config.id ? (
                            <select
                              value={configForm.isActive ? 'true' : 'false'}
                              onChange={(e) => setConfigForm({ ...configForm, isActive: e.target.value === 'true' })}
                              className="admin-select"
                            >
                              <option value="true">Hoạt động</option>
                              <option value="false">Tắt</option>
                            </select>
                          ) : (
                            config.isActive ? (
                              <span className="admin-badge-green">
                                <CheckCircleIcon className="h-4 w-4 mr-1 inline" />
                                Hoạt động
                              </span>
                            ) : (
                              <span className="admin-badge-red">
                                <XCircleIcon className="h-4 w-4 mr-1 inline" />
                                Tắt
                              </span>
                            )
                          )}
                        </td>
                        <td className="admin-table-td text-right">
                          {editingConfig?.id === config.id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleUpdateConfig(config.id)}
                                className="admin-icon-btn text-green-600 hover:bg-green-50"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="admin-icon-btn text-red-600 hover:bg-red-50"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditConfig(config)}
                              className="admin-icon-btn-edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Stats */}
            {transactionStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="admin-stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-stat-label">Tổng điểm tích</p>
                      <p className="admin-stat-value">
                        {transactionStats.totalPointsEarned.toLocaleString()}
                      </p>
                    </div>
                    <div className="admin-stat-icon bg-green-100">
                      <SparklesIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-stat-label">Tổng điểm đã đổi</p>
                      <p className="admin-stat-value">
                        {transactionStats.totalPointsRedeemed.toLocaleString()}
                      </p>
                    </div>
                    <div className="admin-stat-icon bg-red-100">
                      <ChartBarIcon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-stat-label">Tổng giao dịch</p>
                      <p className="admin-stat-value">
                        {transactionStats.totalTransactions.toLocaleString()}
                      </p>
                    </div>
                    <div className="admin-stat-icon bg-blue-100">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="admin-filter-container">
              <div className="admin-filter-grid">
                <div>
                  <label className="admin-label">User ID</label>
                  <input
                    type="number"
                    value={userIdFilter}
                    onChange={(e) => {
                      setUserIdFilter(e.target.value);
                      setCurrentPage(0);
                    }}
                    placeholder="Lọc theo User ID"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Loại giao dịch</label>
                  <select
                    value={transactionTypeFilter}
                    onChange={(e) => {
                      setTransactionTypeFilter(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="admin-select"
                  >
                    <option value="all">Tất cả</option>
                    <option value="EARNED">Tích điểm</option>
                    <option value="REDEEMED">Đổi điểm</option>
                    <option value="EXPIRED">Hết hạn</option>
                    <option value="ROLLBACK">Hoàn trả</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Từ ngày</label>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => {
                      setStartDateFilter(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Đến ngày</label>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => {
                      setEndDateFilter(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="admin-input"
                  />
                </div>
                <div className="flex items-end">
                  <div className="relative" ref={exportDropdownRef}>
                    <button
                      onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                      className="admin-btn-secondary flex items-center space-x-2"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span>Xuất dữ liệu</span>
                    </button>
                    {isExportDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <button
                          onClick={() => handleExport('csv')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>Xuất CSV</span>
                        </button>
                        <button
                          onClick={() => handleExport('excel')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>Xuất Excel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="admin-table-container">
              {transactionsLoading ? (
                <div className="admin-loading">
                  <ArrowPathIcon className="admin-spinner" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="admin-table">
                      <thead className="admin-table-header">
                        <tr>
                          <th className="admin-table-th">ID</th>
                          <th className="admin-table-th">User ID</th>
                          <th className="admin-table-th">Loại</th>
                          <th className="admin-table-th">Điểm</th>
                          <th className="admin-table-th">Mô tả</th>
                          <th className="admin-table-th">Số dư</th>
                          <th className="admin-table-th">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="admin-table-body">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="admin-table-row">
                            <td className="admin-table-td">
                              #{tx.id}
                            </td>
                            <td className="admin-table-td text-gray-500">
                              {tx.userId}
                            </td>
                            <td className="admin-table-td whitespace-nowrap">
                              <span className={`admin-badge ${getTransactionTypeColor(tx.transactionType)}`}>
                                {getTransactionTypeLabel(tx.transactionType)}
                              </span>
                            </td>
                            <td className={`admin-table-td font-medium ${
                              tx.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                            </td>
                            <td className="admin-table-td text-gray-500">
                              {tx.description}
                            </td>
                            <td className="admin-table-td whitespace-nowrap">
                              {tx.balanceAfter.toLocaleString()}
                            </td>
                            <td className="admin-table-td whitespace-nowrap text-gray-500">
                              {formatDate(tx.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Phân tích điểm thưởng theo tháng</h2>
            </div>
            
            {analyticsLoading ? (
              <div className="admin-loading">
                <ArrowPathIcon className="admin-spinner" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Xu hướng điểm thưởng (12 tháng gần nhất)</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={2} name="Tích điểm" />
                      <Line type="monotone" dataKey="redeemed" stroke="#ef4444" strokeWidth={2} name="Đổi điểm" />
                      <Line type="monotone" dataKey="expired" stroke="#f59e0b" strokeWidth={2} name="Hết hạn" />
                      <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Ròng" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">So sánh tích/đổi/hết hạn</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="earned" fill="#10b981" name="Tích điểm" />
                      <Bar dataKey="redeemed" fill="#ef4444" name="Đổi điểm" />
                      <Bar dataKey="expired" fill="#f59e0b" name="Hết hạn" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Top Users Tab */}
        {activeTab === 'topUsers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Top Users theo điểm tích lũy</h2>
              <div className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="admin-btn-secondary flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Xuất dữ liệu</span>
                </button>
                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <button
                      onClick={() => handleExportTopUsers('csv')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>Xuất CSV</span>
                    </button>
                    <button
                      onClick={() => handleExportTopUsers('excel')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>Xuất Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {topUsersLoading ? (
              <div className="admin-loading">
                <ArrowPathIcon className="admin-spinner" />
              </div>
            ) : (
              <div className="admin-table-container">
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead className="admin-table-header">
                      <tr>
                        <th className="admin-table-th">Hạng</th>
                        <th className="admin-table-th">User ID</th>
                        <th className="admin-table-th">Tên</th>
                        <th className="admin-table-th">Email</th>
                        <th className="admin-table-th">Số dư điểm</th>
                        <th className="admin-table-th">Tổng tích lũy</th>
                        <th className="admin-table-th">Tổng đã đổi</th>
                        <th className="admin-table-th">Tổng hết hạn</th>
                        <th className="admin-table-th">Cấp độ</th>
                      </tr>
                    </thead>
                    <tbody className="admin-table-body">
                      {topUsers.map((lp, index) => (
                        <tr key={lp.id} className="admin-table-row">
                          <td className="admin-table-td font-bold">
                            #{index + 1}
                          </td>
                          <td className="admin-table-td text-gray-500">
                            {lp.user?.id || '-'}
                          </td>
                          <td className="admin-table-td font-medium">
                            {lp.user?.name || '-'}
                          </td>
                          <td className="admin-table-td text-gray-500">
                            {lp.user?.email || '-'}
                          </td>
                          <td className="admin-table-td font-semibold text-blue-600">
                            {lp.pointsBalance?.toLocaleString() || 0}
                          </td>
                          <td className="admin-table-td text-green-600">
                            {lp.totalEarned?.toLocaleString() || 0}
                          </td>
                          <td className="admin-table-td text-red-600">
                            {lp.totalRedeemed?.toLocaleString() || 0}
                          </td>
                          <td className="admin-table-td text-orange-600">
                            {lp.totalExpired?.toLocaleString() || 0}
                          </td>
                          <td className="admin-table-td">
                            <span className="admin-badge bg-purple-100 text-purple-800">
                              {lp.level || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoyalty;

