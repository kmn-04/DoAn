import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  avatarUrl?: string;
  role: {
    id: number;
    name: string;
  };
  createdAt?: string;
}

interface Role {
  id: number;
  name: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    banned: 0,
    admin: 0
  });
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRoleId, setNewRoleId] = useState<number>(0);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: 3, // Default to Customer
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'BANNED'
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchRoles();
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (searchTerm || statusFilter !== 'all' || roleFilter !== 'all') {
      setCurrentPage(0);
    }
  }, [searchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, roleFilter, sortBy, sortDirection]);

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const statsRes = await apiClient.get('/admin/users/stats');
      const statsData = statsRes.data.data;
      
      // Get admin count from all users
      const allUsersRes = await apiClient.get('/admin/users?page=0&size=1000');
      const allUsers = allUsersRes.data.data?.content || [];
      const admin = allUsers.filter((u: User) => u.role?.name?.toUpperCase() === 'ADMIN').length;
      
      setStats({
        total: statsData.totalUsers || 0,
        active: statsData.activeUsers || 0,
        inactive: statsData.inactiveUsers || 0,
        banned: statsData.bannedUsers || 0,
        admin
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      
      // Fetch ALL when filtering, otherwise use pagination
      const shouldFetchAll = searchTerm || statusFilter !== 'all' || roleFilter !== 'all';
      const pageSize = 10;
      const response = await apiClient.get(`/admin/users?page=${shouldFetchAll ? 0 : page}&size=${shouldFetchAll ? 1000 : pageSize}&sortBy=${sortBy}&sortDir=${sortDirection}`);
      
      let filteredData = response.data.data?.content || [];
      
      // Apply filters
      if (searchTerm) {
        filteredData = filteredData.filter((user: User) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter((u: User) => u.status === statusFilter);
      }
      if (roleFilter !== 'all') {
        filteredData = filteredData.filter((u: User) => u.role?.name?.toUpperCase() === roleFilter);
      }
      
      // Apply sorting
      filteredData.sort((a: User, b: User) => {
        let compareA: any = a[sortBy as keyof User];
        let compareB: any = b[sortBy as keyof User];
        
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
      
      // Client-side pagination when filtering
      if (shouldFetchAll) {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setUsers(paginatedData);
        setTotalPages(Math.ceil(filteredData.length / pageSize));
        setTotalElements(filteredData.length);
        setFilteredCount(filteredData.length);
      } else {
        setUsers(filteredData);
        setTotalPages(response.data.data?.totalPages || 0);
        setTotalElements(response.data.data?.totalElements || 0);
        setFilteredCount(response.data.data?.totalElements || 0);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRoleId(user.role.id);
    setIsRoleModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsRoleModalOpen(false);
    setViewingUser(null);
    setSelectedUser(null);
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRoleId) return;
    
    try {
      setLoading(true);
      await apiClient.put(`/admin/users/${selectedUser.id}/role`, { roleId: newRoleId });
      closeModal();
      await fetchUsers(currentPage);
    } catch (error) {
      console.error('Error changing role:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra khi đổi quyền');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    
    try {
      setLoading(true);
      await apiClient.put(`/admin/users/${userId}/status`, { status: newStatus });
      await fetchUsers(currentPage);
    } catch (error) {
      console.error('Error toggling status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: 'ACTIVE' | 'INACTIVE' | 'BANNED') => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/users/${userId}/status?status=${newStatus}`);
      await Promise.all([
        fetchUsers(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('Error updating status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user is Admin
  const isAdmin = (user: User) => user.role?.name?.toUpperCase() === 'ADMIN';

  // CREATE
  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      roleId: 3,
      status: 'ACTIVE'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      setLoading(true);
      await apiClient.post('/admin/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        roleId: formData.roleId,
        status: formData.status
      });
      
      setIsCreateModalOpen(false);
      await Promise.all([
        fetchUsers(currentPage),
        fetchGlobalStats()
      ]);
      alert('Thêm người dùng thành công!');
    } catch (error) {
      console.error('Error creating user:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể thêm người dùng');
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const openEditModal = (user: User) => {
    if (isAdmin(user)) {
      alert('Không thể chỉnh sửa tài khoản Admin');
      return;
    }
    
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      phone: user.phone || '',
      roleId: user.role?.id || 3,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;

    try {
      if (!formData.name || !formData.email) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      setLoading(true);
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roleId: formData.roleId,
        status: formData.status
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiClient.put(`/admin/users/${editingUser.id}`, updateData);
      
      setIsEditModalOpen(false);
      await Promise.all([
        fetchUsers(currentPage),
        fetchGlobalStats()
      ]);
      alert('Cập nhật người dùng thành công!');
    } catch (error) {
      console.error('Error updating user:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (user: User) => {
    if (isAdmin(user)) {
      alert('Không thể xóa tài khoản Admin');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa người dùng "${user.name}" (${user.email})?\n\n⚠️ Hành động này không thể hoàn tác!`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await apiClient.delete(`/admin/users/${user.id}`);
      await Promise.all([
        fetchUsers(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error('Error deleting user:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể xóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'admin-table-select-active';
      case 'INACTIVE':
        return 'admin-table-select-inactive';
      case 'BANNED':
        return 'admin-table-select-rejected';
      default:
        return 'admin-table-select-inactive';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <button
            onClick={openCreateModal}
            className="admin-btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Thêm người dùng
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng người dùng</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đang hoạt động</p>
                <p className="admin-stat-value">{stats.active}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Không hoạt động</p>
                <p className="admin-stat-value">{stats.inactive}</p>
              </div>
              <div className="admin-stat-icon bg-yellow-100">
                <LockClosedIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Bị cấm</p>
                <p className="admin-stat-value">{stats.banned}</p>
              </div>
              <div className="admin-stat-icon bg-red-100">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> người dùng
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="STAFF">Nhân viên</option>
                <option value="CUSTOMER">Khách hàng</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="BANNED">Bị cấm</option>
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
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="email-desc">Email Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">ID</th>
                <th className="admin-table-th">Tên</th>
                <th className="admin-table-th">Email</th>
                <th className="admin-table-th">Vai trò</th>
                <th className="admin-table-th">Trạng thái</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="admin-table-row">
                    <td className="admin-table-td">{user.id}</td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatarUrl ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </td>
                    <td className="admin-table-td text-sm">{user.email}</td>
                    <td className="admin-table-td">
                      <span className={
                        user.role?.name?.toUpperCase() === 'ADMIN' ? 'admin-badge-purple' :
                        user.role?.name?.toUpperCase() === 'STAFF' ? 'admin-badge-blue' :
                        'admin-badge-gray'
                      }>
                        {user.role?.name === 'Admin' ? 'Quản trị viên' :
                         user.role?.name === 'Staff' ? 'Nhân viên' :
                         'Khách hàng'}
                      </span>
                    </td>
                    <td className="admin-table-td">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value as 'ACTIVE' | 'INACTIVE' | 'BANNED')}
                        className={getStatusClassName(user.status)}
                        disabled={loading || isAdmin(user)}
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                        <option value="BANNED">Bị cấm</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(user)}
                          className="admin-icon-btn-view"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {!isAdmin(user) && (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="admin-icon-btn-edit"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="admin-icon-btn-delete"
                              title="Xóa"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
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
            Hiển thị {users.length} / {totalElements} người dùng
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết người dùng</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {viewingUser.avatarUrl ? (
                        <img className="h-20 w-20 rounded-full" src={viewingUser.avatarUrl} alt={viewingUser.name} />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-10 w-10 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{viewingUser.name}</h4>
                      <p className="text-sm text-gray-600">{viewingUser.email}</p>
                    </div>
                  </div>

                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin tài khoản</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">ID</p>
                        <p className="admin-view-value">{viewingUser.id}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Số điện thoại</p>
                        <p className="admin-view-value">{viewingUser.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Vai trò</p>
                        <p className="admin-view-value">
                          <span className={
                            viewingUser.role?.name?.toUpperCase() === 'ADMIN' ? 'admin-badge-purple' :
                            viewingUser.role?.name?.toUpperCase() === 'STAFF' ? 'admin-badge-blue' :
                            'admin-badge-gray'
                          }>
                            {viewingUser.role?.name === 'Admin' ? 'Quản trị viên' :
                             viewingUser.role?.name === 'Staff' ? 'Nhân viên' :
                             'Khách hàng'}
                          </span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trạng thái</p>
                        <p className="admin-view-value">
                          <span className={
                            viewingUser.status === 'ACTIVE' ? 'admin-badge-green' :
                            viewingUser.status === 'INACTIVE' ? 'admin-badge-gray' :
                            'admin-badge-red'
                          }>
                            {viewingUser.status === 'ACTIVE' ? 'Hoạt động' :
                             viewingUser.status === 'INACTIVE' ? 'Không hoạt động' :
                             'Bị cấm'}
                          </span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Ngày tạo</p>
                        <p className="admin-view-value">{formatDate(viewingUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Đóng
                </button>
                <button onClick={() => { closeModal(); openRoleModal(viewingUser); }} className="admin-btn-primary">
                  Đổi vai trò
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-md">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Đổi vai trò người dùng</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Người dùng:</p>
                    <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vai trò hiện tại:</p>
                    <span className={
                      selectedUser.role?.name?.toUpperCase() === 'ADMIN' ? 'admin-badge-purple' :
                      selectedUser.role?.name?.toUpperCase() === 'STAFF' ? 'admin-badge-blue' :
                      'admin-badge-gray'
                    }>
                      {selectedUser.role?.name === 'Admin' ? 'Quản trị viên' :
                       selectedUser.role?.name === 'Staff' ? 'Nhân viên' :
                       'Khách hàng'}
                    </span>
                  </div>

                  <div>
                    <label htmlFor="newRole" className="admin-label">
                      Vai trò mới <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="newRole"
                      value={newRoleId}
                      onChange={(e) => setNewRoleId(parseInt(e.target.value))}
                      className="admin-select"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name === 'Admin' ? 'Quản trị viên' :
                           role.name === 'Staff' ? 'Nhân viên' :
                           role.name === 'Customer' ? 'Khách hàng' :
                           role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-alert-warning">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của người dùng.
                    </p>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Hủy
                </button>
                <button 
                  onClick={handleChangeRole} 
                  disabled={loading || newRoleId === selectedUser.role.id}
                  className="admin-btn-primary"
                >
                  {loading ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => setIsCreateModalOpen(false)} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Thêm người dùng mới</h2>
              </div>
              <div className="admin-modal-body max-h-[70vh] overflow-y-auto">
                <div className="space-y-6 p-1">
                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập mật khẩu"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Vai trò
                    </label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                      className="admin-select w-full"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name === 'Admin' ? 'Quản trị viên' :
                           role.name === 'Staff' ? 'Nhân viên' :
                           role.name === 'Customer' ? 'Khách hàng' :
                           role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'BANNED' })}
                      className="admin-select w-full"
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
                      <option value="BANNED">Bị cấm</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={() => setIsCreateModalOpen(false)} className="admin-btn-secondary">
                  Hủy
                </button>
                <button onClick={handleCreate} disabled={loading} className="admin-btn-primary">
                  {loading ? 'Đang tạo...' : 'Tạo người dùng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={() => setIsEditModalOpen(false)} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Chỉnh sửa người dùng: {editingUser.name}</h2>
              </div>
              <div className="admin-modal-body max-h-[70vh] overflow-y-auto">
                <div className="space-y-6 p-1">
                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Mật khẩu mới <span className="text-gray-500">(để trống nếu không đổi)</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="admin-input w-full"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Vai trò
                    </label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                      className="admin-select w-full"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name === 'Admin' ? 'Quản trị viên' :
                           role.name === 'Staff' ? 'Nhân viên' :
                           role.name === 'Customer' ? 'Khách hàng' :
                           role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="admin-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'BANNED' })}
                      className="admin-select w-full"
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
                      <option value="BANNED">Bị cấm</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={() => setIsEditModalOpen(false)} className="admin-btn-secondary">
                  Hủy
                </button>
                <button onClick={handleEdit} disabled={loading} className="admin-btn-primary">
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
