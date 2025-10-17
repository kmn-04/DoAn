import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  BellIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface Notification {
  id: number;
  userId: number | null;
  userName: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  recipientType: string | null;
  isRead: boolean;
  createdAt: string;
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'INFO',
    recipientType: 'ALL',
    specificUserIds: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchNotifications = useCallback(async (page: number) => {
    try {
      setLoading(true);
      
      // Fetch ALL when filtering, otherwise use pagination
      const shouldFetchAll = searchTerm || typeFilter !== 'all' || recipientFilter !== 'all';
      const pageSize = 10;
      const response = await apiClient.get(`/admin/notifications?page=${shouldFetchAll ? 0 : page}&size=${shouldFetchAll ? 1000 : pageSize}&sortBy=${sortBy}&sortDir=${sortDirection}`);
      
      let filteredData = response.data.data?.content || [];
      
      // Apply filters
      if (searchTerm) {
        filteredData = filteredData.filter((notif: Notification) =>
          notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (typeFilter !== 'all') {
        filteredData = filteredData.filter((n: Notification) => n.type === typeFilter);
      }
      if (recipientFilter !== 'all') {
        if (recipientFilter === 'system') {
          filteredData = filteredData.filter((n: Notification) => n.userId === null);
        } else if (recipientFilter === 'user') {
          filteredData = filteredData.filter((n: Notification) => n.userId !== null);
        }
      }
      
      // Apply sorting
      filteredData.sort((a: Notification, b: Notification) => {
        const compareA = a[sortBy as keyof Notification];
        const compareB = b[sortBy as keyof Notification];
        
        let valA: string | number = '';
        let valB: string | number = '';
        
        if (typeof compareA === 'string' && typeof compareB === 'string') {
          valA = compareA.toLowerCase();
          valB = compareB.toLowerCase();
        } else if (typeof compareA === 'number' && typeof compareB === 'number') {
          valA = compareA;
          valB = compareB;
        } else {
          valA = String(compareA || '');
          valB = String(compareB || '');
        }
        
        if (sortDirection === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
      
      // Client-side pagination when filtering
      if (shouldFetchAll) {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setNotifications(paginatedData);
        setTotalPages(Math.ceil(filteredData.length / pageSize));
        setTotalElements(filteredData.length);
        setFilteredCount(filteredData.length);
        
        // Calculate stats from ALL filtered data
        const total = filteredData.length;
        const unread = filteredData.filter((n: Notification) => !n.isRead).length;
        setStats({ total, sent: unread });
      } else {
        setNotifications(filteredData);
        setTotalPages(response.data.data?.totalPages || 0);
        setTotalElements(response.data.data?.totalElements || 0);
        setFilteredCount(response.data.data?.totalElements || 0);
        
        // Calculate stats from current page
        const total = filteredData.length;
        const unread = filteredData.filter((n: Notification) => !n.isRead).length;
        setStats({ total, sent: unread });
      }
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, recipientFilter, sortBy, sortDirection]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (searchTerm || typeFilter !== 'all' || recipientFilter !== 'all') {
      setCurrentPage(0);
    }
  }, [searchTerm, typeFilter, recipientFilter]);

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage, fetchNotifications]);

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

  const openViewModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNotification(null);
  };

  const openEditModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      recipientType: notification.recipientType || 'ALL',
      specificUserIds: []
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedNotification(null);
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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedNotification) return;
    
    try {
      setLoading(true);
      await apiClient.put(`/admin/notifications/${selectedNotification.id}`, formData);
      closeEditModal();
      await fetchNotifications(currentPage);
    } catch (error) {
      console.error('Error updating notification:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notification: Notification) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa thông báo "${notification.title}"?\n\n⚠️ Hành động này không thể hoàn tác!`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await apiClient.delete(`/admin/notifications/${notification.id}`);
      await fetchNotifications(currentPage);
    } catch (error) {
      console.error('Error deleting notification:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể xóa thông báo');
    } finally {
      setLoading(false);
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
                <p className="admin-stat-label">Chưa đọc</p>
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
                <option value="system">Hệ thống</option>
                <option value="user">User</option>
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
                <th className="admin-table-th">Người nhận</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Ngày tạo</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-loading">
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
                  <td colSpan={6} className="admin-empty">
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
                      {notification.recipientType === 'ADMIN' ? (
                        <span className="admin-badge-yellow">Quản trị viên</span>
                      ) : notification.recipientType === 'USER' ? (
                        <span className="admin-badge-blue">Người dùng</span>
                      ) : (
                        <span className="admin-badge-purple">Tất cả</span>
                      )}
                    </td>
                    <td className="admin-table-td">
                      {notification.userId ? (
                        // User cụ thể: hiển thị trạng thái đọc
                        notification.isRead ? (
                          <span className="text-green-600 font-medium">Đã đọc</span>
                        ) : (
                          <span className="text-gray-500">Chưa đọc</span>
                        )
                      ) : (
                        // Hệ thống: hiển thị "Đã gửi"
                        <span className="text-blue-600 font-medium">Đã gửi</span>
                      )}
                    </td>
                    <td className="admin-table-td text-sm">{formatDate(notification.createdAt)}</td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(notification)}
                          className="admin-icon-btn-view"
                          title="Xem"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(notification)}
                          className="admin-icon-btn-edit"
                          title="Sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(notification)}
                          className="admin-icon-btn-delete"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
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

                    {/* Type & Recipient in 2 columns */}
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

      {/* View Modal */}
      {isViewModalOpen && selectedNotification && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeViewModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-2xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết thông báo</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="admin-label">Loại</label>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedNotification.type)}
                      <span className={getTypeBadge(selectedNotification.type)}>
                        {getTypeLabel(selectedNotification.type)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Người nhận</label>
                    <div>
                      {selectedNotification.recipientType === 'ADMIN' ? (
                        <span className="admin-badge-yellow">Quản trị viên</span>
                      ) : selectedNotification.recipientType === 'USER' ? (
                        <span className="admin-badge-blue">Người dùng</span>
                      ) : (
                        <span className="admin-badge-purple">Tất cả</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Tiêu đề</label>
                    <p className="text-gray-900 font-medium">{selectedNotification.title}</p>
                  </div>
                  <div>
                    <label className="admin-label">Nội dung</label>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                  </div>
                  {selectedNotification.link && (
                    <div>
                      <label className="admin-label">Liên kết</label>
                      <p className="text-blue-600">{selectedNotification.link}</p>
                    </div>
                  )}
                  <div>
                    <label className="admin-label">Ngày tạo</label>
                    <p className="text-gray-700">{formatDate(selectedNotification.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeViewModal} className="admin-btn-secondary">
                  Đóng
                </button>
                <button onClick={() => {closeViewModal(); openEditModal(selectedNotification);}} className="admin-btn-primary">
                  <PencilIcon className="h-5 w-5" />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedNotification && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeEditModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-2xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chỉnh sửa thông báo</h3>
              </div>
              <form onSubmit={handleEdit}>
                <div className="admin-modal-body">
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label htmlFor="edit-title" className="admin-label">
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`admin-input ${formErrors.title ? 'admin-input-error' : ''}`}
                        placeholder="Nhập tiêu đề thông báo"
                      />
                      {formErrors.title && <p className="admin-error-text">{formErrors.title}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="edit-message" className="admin-label">
                        Nội dung <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="edit-message"
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

                    {/* Type & Recipient in 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-type" className="admin-label">
                          Loại thông báo <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="edit-type"
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
                        <label htmlFor="edit-recipientType" className="admin-label">
                          Gửi đến <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="edit-recipientType"
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
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={closeEditModal} className="admin-btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="admin-btn-primary">
                    <CheckCircleIcon className="h-5 w-5" />
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
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
