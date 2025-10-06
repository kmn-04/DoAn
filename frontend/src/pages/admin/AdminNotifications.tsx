import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  BellIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  recipientType: string;
  createdAt: string;
  sentCount?: number;
}

interface NotificationFormData {
  title: string;
  message: string;
  type: string;
  recipientType: string;
  specificUserIds: number[];
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    sent: 0
  });
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'INFO',
    recipientType: 'ALL',
    specificUserIds: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage, searchTerm, typeFilter, recipientFilter, sortBy, sortDirection]);

  const fetchNotifications = async (page: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/notifications?page=${page}&size=10&sortBy=${sortBy}&sortDir=${sortDirection}`);
      
      let filteredData = response.data.data?.content || [];
      
      // Apply filters
      if (searchTerm) {
        filteredData = filteredData.filter((notif: Notification) =>
          notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (typeFilter !== 'all') {
        filteredData = filteredData.filter((n: Notification) => n.type === typeFilter);
      }
      if (recipientFilter !== 'all') {
        filteredData = filteredData.filter((n: Notification) => n.recipientType === recipientFilter);
      }
      
      // Apply sorting
      filteredData.sort((a: Notification, b: Notification) => {
        let compareA: any = a[sortBy as keyof Notification];
        let compareB: any = b[sortBy as keyof Notification];
        
        if (typeof compareA === 'string') {
          compareA = compareA.toLowerCase();
          compareB = compareB.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      });
      
      setNotifications(filteredData);
      setTotalPages(response.data.data?.totalPages || 0);
      setTotalElements(response.data.data?.totalElements || 0);
      
      // Calculate stats
      const total = filteredData.length;
      const sent = filteredData.reduce((sum: number, n: Notification) => sum + (n.sentCount || 0), 0);
      setStats({ total, sent });
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      message: '',
      type: 'INFO',
      recipientType: 'ALL',
      specificUserIds: []
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Tiêu đề là bắt buộc';
    }
    if (!formData.message.trim()) {
      errors.message = 'Nội dung là bắt buộc';
    }
    if (formData.message.length > 500) {
      errors.message = 'Nội dung không được vượt quá 500 ký tự';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await apiClient.post('/admin/notifications', formData);
      closeCreateModal();
      await fetchNotifications(currentPage);
    } catch (error) {
      console.error('Error creating notification:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId === id) {
      try {
        setLoading(true);
        await apiClient.delete(`/admin/notifications/${id}`);
        setDeleteConfirmId(null);
        await fetchNotifications(currentPage);
      } catch (error) {
        console.error('Error deleting notification:', error);
        const axiosError = error as AxiosError<{ message?: string }>;
        alert(axiosError.response?.data?.message || 'Không thể xóa thông báo');
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'ERROR':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'admin-badge-green';
      case 'WARNING':
        return 'admin-badge-yellow';
      case 'ERROR':
        return 'admin-badge-red';
      default:
        return 'admin-badge-blue';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'INFO': 'Thông tin',
      'SUCCESS': 'Thành công',
      'WARNING': 'Cảnh báo',
      'ERROR': 'Lỗi'
    };
    return labels[type] || type;
  };

  const getRecipientLabel = (recipientType: string) => {
    const labels: Record<string, string> = {
      'ALL': 'Tất cả',
      'ADMIN': 'Quản trị viên',
      'USER': 'Người dùng'
    };
    return labels[recipientType] || recipientType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý thông báo</h1>
          <button onClick={openCreateModal} className="admin-btn-primary">
            <PlusIcon className="h-5 w-5" />
            Tạo thông báo
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng thông báo</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <BellIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đã gửi</p>
                <p className="admin-stat-value">{stats.sent}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || typeFilter !== 'all' || recipientFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> thông báo
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tiêu đề, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Loại</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="INFO">Thông tin</option>
                <option value="SUCCESS">Thành công</option>
                <option value="WARNING">Cảnh báo</option>
                <option value="ERROR">Lỗi</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Người nhận</label>
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="ALL">Tất cả người dùng</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="USER">Người dùng</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDirection(dir as 'asc' | 'desc');
                }}
                className="admin-select"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">Loại</th>
                <th className="admin-table-th">Tiêu đề</th>
                <th className="admin-table-th">Nội dung</th>
                <th className="admin-table-th">Người nhận</th>
                <th className="admin-table-th">Đã gửi</th>
                <th className="admin-table-th">Ngày tạo</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="admin-loading">
                    <div className="admin-spinner">
                      <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr key={notification.id} className="admin-table-row">
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <span className={getTypeBadge(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                    </td>
                    <td className="admin-table-td font-medium">{notification.title}</td>
                    <td className="admin-table-td">
                      <p className="text-sm text-gray-700 line-clamp-2 max-w-md">
                        {notification.message}
                      </p>
                    </td>
                    <td className="admin-table-td">
                      <span className="admin-badge-gray">
                        {getRecipientLabel(notification.recipientType)}
                      </span>
                    </td>
                    <td className="admin-table-td">
                      <span className="font-semibold">{notification.sentCount || 0}</span>
                    </td>
                    <td className="admin-table-td text-sm">{formatDate(notification.createdAt)}</td>
                    <td className="admin-table-td">
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className={
                          deleteConfirmId === notification.id
                            ? 'admin-icon-btn-delete-confirm'
                            : 'admin-icon-btn-delete'
                        }
                        title={deleteConfirmId === notification.id ? 'Click lại để xác nhận' : 'Xóa'}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 text-center mb-2">
            Hiển thị {notifications.length} / {totalElements} thông báo
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeCreateModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-2xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Tạo thông báo mới</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="admin-label">
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`admin-input ${formErrors.title ? 'admin-input-error' : ''}`}
                        placeholder="Nhập tiêu đề thông báo"
                      />
                      {formErrors.title && <p className="admin-error-text">{formErrors.title}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="admin-label">
                        Nội dung <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`admin-textarea ${formErrors.message ? 'admin-input-error' : ''}`}
                        placeholder="Nhập nội dung thông báo (tối đa 500 ký tự)"
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {formErrors.message && <p className="admin-error-text">{formErrors.message}</p>}
                        <p className="text-xs text-gray-500 ml-auto">
                          {formData.message.length}/500 ký tự
                        </p>
                      </div>
                    </div>

                    {/* Type & Recipient */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="type" className="admin-label">
                          Loại thông báo <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="admin-select"
                        >
                          <option value="INFO">ℹ️ Thông tin</option>
                          <option value="SUCCESS">✅ Thành công</option>
                          <option value="WARNING">⚠️ Cảnh báo</option>
                          <option value="ERROR">❌ Lỗi</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="recipientType" className="admin-label">
                          Gửi đến <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="recipientType"
                          value={formData.recipientType}
                          onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                          className="admin-select"
                        >
                          <option value="ALL">Tất cả người dùng</option>
                          <option value="ADMIN">Chỉ quản trị viên</option>
                          <option value="USER">Chỉ người dùng</option>
                        </select>
                      </div>
                    </div>

                    {/* Info Alert */}
                    <div className="admin-alert-info">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-800">
                          Thông báo sẽ được gửi ngay lập tức đến tất cả người dùng theo loại bạn chọn.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={closeCreateModal} className="admin-btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="admin-btn-primary">
                    <PaperAirplaneIcon className="h-5 w-5" />
                    {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
