import React, { useState, useEffect } from 'react';
import { 
  EyeIcon,
  EnvelopeIcon,
  InboxIcon,
  ClockIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest: string | null;
  status: 'New' | 'In_Progress' | 'Resolved' | 'Closed';
  assignedToId: number | null;
  assignedToName: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const AdminContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats - GLOBAL
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0
  });
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchGlobalStats();
  }, []);
  
  const fetchGlobalStats = async () => {
    try {
      const [totalRes, newRes] = await Promise.all([
        apiClient.get('/admin/contacts/count'),
        apiClient.get('/admin/contacts/count/new')
      ]);
      
      // Get all contacts to calculate stats
      const allContactsRes = await apiClient.get('/admin/contacts?page=0&size=1000');
      const allContacts = allContactsRes.data.data?.content || [];
      
      const inProgress = allContacts.filter((c: Contact) => c.status === 'In_Progress').length;
      const resolved = allContacts.filter((c: Contact) => c.status === 'Resolved').length;
      
      setStats({
        total: totalRes.data.data || 0,
        new: newRes.data.data || 0,
        inProgress,
        resolved
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    if (searchTerm || statusFilter !== 'all') {
      setCurrentPage(0);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage, searchTerm, statusFilter, sortBy, sortDirection]);

  const fetchContacts = async (page: number) => {
    try {
      setLoading(true);
      
      // Fetch ALL contacts when filtering, otherwise use pagination
      const shouldFetchAll = searchTerm || statusFilter !== 'all';
      const params = new URLSearchParams({
        page: shouldFetchAll ? '0' : page.toString(),
        size: shouldFetchAll ? '1000' : '10',
        sortBy: sortBy,
        direction: sortDirection
      });
      
      const response = await apiClient.get(`/admin/contacts?${params.toString()}`);
      
      let data = response.data.data?.content || [];
      
      // Client-side filtering
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        data = data.filter((contact: Contact) => 
          contact.name.toLowerCase().includes(search) ||
          contact.email.toLowerCase().includes(search) ||
          contact.phone?.toLowerCase().includes(search) ||
          contact.subject?.toLowerCase().includes(search)
        );
      }
      
      if (statusFilter && statusFilter !== 'all') {
        data = data.filter((contact: Contact) => contact.status === statusFilter);
      }
      
      // Client-side pagination when filtering
      if (shouldFetchAll) {
        const pageSize = 10;
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = data.slice(startIndex, endIndex);
        
        setContacts(paginatedData);
        setTotalPages(Math.ceil(data.length / pageSize));
        setTotalElements(data.length);
        setFilteredCount(data.length);
      } else {
        setContacts(data);
        setTotalPages(response.data.data?.totalPages || 0);
        setTotalElements(response.data.data?.totalElements || 0);
        setFilteredCount(response.data.data?.totalElements || 0);
      }
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (contact: Contact) => {
    try {
      const response = await apiClient.get(`/admin/contacts/${contact.id}`);
      setSelectedContact(response.data.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching contact details:', error);
      alert('Không thể tải thông tin liên hệ');
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContact(null);
  };

  const handleUpdateStatus = async (contactId: number, newStatus: string) => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/contacts/${contactId}/status`, null, {
        params: { status: newStatus }
      });
      closeDetailModal();
      await Promise.all([
        fetchContacts(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi khi cập nhật trạng thái!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (window.confirm(`Bạn có chắc muốn xóa liên hệ từ "${contact.name}"?`)) {
      try {
        setLoading(true);
        await apiClient.delete(`/admin/contacts/${contact.id}`);
        await Promise.all([
          fetchContacts(currentPage),
          fetchGlobalStats()
        ]);
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Lỗi khi xóa liên hệ!');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'New': 'admin-badge-blue',
      'In_Progress': 'admin-badge-yellow',
      'Resolved': 'admin-badge-green',
      'Closed': 'admin-badge-gray'
    };
    return badges[status as keyof typeof badges] || 'admin-badge-gray';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'New': 'Mới',
      'In_Progress': 'Đang xử lý',
      'Resolved': 'Đã giải quyết',
      'Closed': 'Đã đóng'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusClassName = (status: string) => {
    const classes = {
      'New': 'admin-table-select-pending',
      'In_Progress': 'admin-table-select-confirmed',
      'Resolved': 'admin-table-select-completed',
      'Closed': 'admin-table-select-rejected'
    };
    return classes[status as keyof typeof classes] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý liên hệ</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng liên hệ</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Mới</p>
                <p className="admin-stat-value">{stats.new}</p>
              </div>
              <div className="admin-stat-icon bg-yellow-100">
                <InboxIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đang xử lý</p>
                <p className="admin-stat-value">{stats.inProgress}</p>
              </div>
              <div className="admin-stat-icon bg-purple-100">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đã giải quyết</p>
                <p className="admin-stat-value">{stats.resolved}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> liên hệ
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="New">Mới</option>
                <option value="In_Progress">Đang xử lý</option>
                <option value="Resolved">Đã giải quyết</option>
                <option value="Closed">Đã đóng</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-select"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="name">Tên</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Thứ tự</label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="admin-select"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">Khách hàng</th>
                <th className="admin-table-th">Liên hệ</th>
                <th className="admin-table-th">Tour quan tâm</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {loading ? (
                <tr>
                  <td colSpan={5} className="admin-table-td text-center py-8">
                    <div className="admin-loading">
                      <div className="admin-spinner border-4 border-blue-200 border-t-blue-600 rounded-full w-8 h-8"></div>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-td">
                    <div className="admin-empty">
                      <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Chưa có liên hệ nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="admin-table-row">
                    <td className="admin-table-td">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="admin-table-td">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                      <div className="text-xs text-gray-500">{contact.phone}</div>
                    </td>
                    <td className="admin-table-td">
                      {contact.tourInterest ? (
                        <div className="max-w-xs truncate text-sm text-blue-600" title={contact.tourInterest}>
                          {contact.tourInterest}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="admin-table-td">
                      <select
                        value={contact.status}
                        onChange={(e) => handleUpdateStatus(contact.id, e.target.value)}
                        className={`admin-table-select ${getStatusClassName(contact.status)}`}
                      >
                        <option value="New">Mới</option>
                        <option value="In_Progress">Đang xử lý</option>
                        <option value="Resolved">Đã giải quyết</option>
                        <option value="Closed">Đã đóng</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(contact)}
                          className="admin-icon-btn-view"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact)}
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
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={closeDetailModal}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Chi tiết liên hệ</h2>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-view-label">ID</label>
                      <p className="admin-view-value">#{selectedContact.id}</p>
                    </div>
                    <div>
                      <label className="admin-view-label">Trạng thái</label>
                      <span className={`admin-badge ${getStatusBadge(selectedContact.status)}`}>
                        {getStatusLabel(selectedContact.status)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="admin-view-section">
                    <h3 className="admin-view-section-title">Thông tin khách hàng</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-view-label">Tên khách hàng</label>
                        <p className="admin-view-value">{selectedContact.name}</p>
                      </div>
                      <div>
                        <label className="admin-view-label">Email</label>
                        <p className="admin-view-value">{selectedContact.email}</p>
                      </div>
                      <div>
                        <label className="admin-view-label">Số điện thoại</label>
                        <p className="admin-view-value">{selectedContact.phone || '-'}</p>
                      </div>
                      {selectedContact.tourInterest && (
                        <div>
                          <label className="admin-view-label">Tour quan tâm</label>
                          <p className="admin-view-value text-blue-600">{selectedContact.tourInterest}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="admin-view-section">
                    <h3 className="admin-view-section-title">Nội dung liên hệ</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="admin-view-label">Chủ đề</label>
                        <p className="admin-view-value">{selectedContact.subject}</p>
                      </div>
                      <div>
                        <label className="admin-view-label">Nội dung</label>
                        <p className="admin-view-value whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Note */}
                  {selectedContact.adminNote && (
                    <div className="admin-view-section">
                      <h3 className="admin-view-section-title">Ghi chú của Admin</h3>
                      <p className="admin-view-value whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        {selectedContact.adminNote}
                      </p>
                    </div>
                  )}

                  {/* Assignment */}
                  {selectedContact.assignedToName && (
                    <div className="admin-view-section">
                      <h3 className="admin-view-section-title">Phân công</h3>
                      <div>
                        <label className="admin-view-label">Được giao cho</label>
                        <p className="admin-view-value">{selectedContact.assignedToName}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="admin-view-section">
                    <h3 className="admin-view-section-title">Thời gian</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-view-label">Ngày tạo</label>
                        <p className="admin-view-value">{formatDate(selectedContact.createdAt)}</p>
                      </div>
                      <div>
                        <label className="admin-view-label">Cập nhật lần cuối</label>
                        <p className="admin-view-value">{formatDate(selectedContact.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between gap-3">
                <div className="flex gap-2">
                  <select
                    value={selectedContact.status}
                    onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)}
                    className="admin-select"
                  >
                    <option value="New">Mới</option>
                    <option value="In_Progress">Đang xử lý</option>
                    <option value="Resolved">Đã giải quyết</option>
                    <option value="Closed">Đã đóng</option>
                  </select>
                </div>
                <button onClick={closeDetailModal} className="admin-btn-secondary">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;