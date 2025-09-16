import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import Icons from './Icons';
import '../styles/components/UserManagement.css';

const UserManagement = () => {
  const navigate = useNavigate();
  
  // State cho danh sách người dùng
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // State cho selection và bulk actions
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // State cho statistics (tĩnh - không thay đổi theo filter)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    unverifiedUsers: 0,
    activePercentage: 0,
    inactivePercentage: 0,
    unverifiedPercentage: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  // State cho current user (to prevent self-delete)
  const [currentUser, setCurrentUser] = useState(null);
  
  // State cho modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // only 'add' mode
  
  // State cho confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    avatar: '',
    fullName: '',
    email: '',
    password: '',
    role: 'USER',
    status: 'active'
  });

  // Load current user profile
  const loadCurrentUser = async () => {
    try {
      const response = await userService.getCurrentUserProfile();
      setCurrentUser(response);
      console.log('👤 Current user loaded:', response);
    } catch (error) {
      console.error('❌ Error loading current user:', error);
    }
  };

  // Load statistics (tĩnh - không thay đổi theo filter)
  const loadStats = async () => {
    try {
      setStatsLoading(true);
      console.log('📊 Loading user statistics...');
      
      const response = await userService.getUserStats();
      setStats(response);
      
      console.log('✅ Statistics loaded:', response);
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
      // Keep default stats if API fails
    } finally {
      setStatsLoading(false);
    }
  };

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1, // API uses 0-based indexing
        size: itemsPerPage,
        search: searchTerm,
        role: roleFilter === 'all' ? '' : roleFilter,
        isActive: statusFilter === 'all' ? '' : statusFilter === 'active',
        fromDate: dateRange.from || '',
        toDate: dateRange.to || ''
      };
      
      console.log('🔍 Frontend sending params:', params);
      
      const response = await userService.getUsers(params);
      
      // Transform API response to match component state
      const transformedUsers = response.users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive',
        createdAt: new Date(user.createdAt).toLocaleDateString('vi-VN'),
        avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=fff`
      }));
      
      setUsers(transformedUsers);
      setTotalUsers(response.totalElements);
      
    } catch (error) {
      console.error('Error loading users:', error);
      // Show error message to user
      alert('Có lỗi xảy ra khi tải danh sách người dùng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, itemsPerPage]);

  // Effect để load statistics và current user một lần khi component mount
  useEffect(() => {
    loadStats();
    loadCurrentUser();
  }, []);

  // Since filtering is now done on the server side, we use users directly
  const currentUsers = users;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers);

  // Handle checkbox selection
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      avatar: '',
      fullName: '',
      email: '',
      password: '',
      role: 'USER',
      status: 'active'
    });
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Transform form data for API
      const apiData = {
        username: formData.email.split('@')[0], // Generate username from email
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        isActive: formData.status === 'active',
        avatarUrl: formData.avatar
      };
      
      // Only add mode
      if (!formData.password) {
        alert('Vui lòng nhập mật khẩu');
        return;
      }
      apiData.password = formData.password;
      await userService.createUser(apiData);
      alert('Tạo người dùng thành công!');
      
      closeModal();
      loadUsers(); // Reload the list
      
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change from dropdown
  const handleStatusChange = async (user, newStatus) => {
    try {
      await userService.updateUserStatus(user.id, newStatus);
      
      // Reload users to reflect the change
      await loadUsers();
      await loadStats(); // Also reload stats in case they changed
      
      console.log(`✅ User ${user.fullName} status updated to ${newStatus ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      alert(userService.handleApiError(error));
    }
  };

  // Delete handlers
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(deletingUser.id);
      alert('Xóa người dùng thành công!');
      setShowDeleteDialog(false);
      setDeletingUser(null);
      loadUsers(); // Reload the list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng: ' + error.message);
    }
  };

  const handleBulkAction = async () => {
    if (bulkAction && selectedUsers.length > 0) {
      try {
        if (bulkAction === 'delete') {
          setShowBulkDeleteDialog(true);
        } else if (bulkAction === 'activate') {
          await userService.updateUsersStatus(selectedUsers, true);
          alert('Kích hoạt người dùng thành công!');
          setSelectedUsers([]);
          setBulkAction('');
          loadUsers();
        } else if (bulkAction === 'deactivate') {
          await userService.updateUsersStatus(selectedUsers, false);
          alert('Vô hiệu hóa người dùng thành công!');
          setSelectedUsers([]);
          setBulkAction('');
          loadUsers();
        } else if (bulkAction.startsWith('role-')) {
          const role = bulkAction.replace('role-', '');
          await userService.updateUsersRole(selectedUsers, role);
          alert('Cập nhật vai trò thành công!');
          setSelectedUsers([]);
          setBulkAction('');
          loadUsers();
        }
      } catch (error) {
        console.error('Error performing bulk action:', error);
        alert('Có lỗi xảy ra: ' + error.message);
      }
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await userService.deleteUsers(selectedUsers);
      alert('Xóa người dùng thành công!');
      setShowBulkDeleteDialog(false);
      setSelectedUsers([]);
      setBulkAction('');
      loadUsers(); // Reload the list
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      alert('Có lỗi xảy ra khi xóa người dùng: ' + error.message);
    }
  };

  // Filter handlers
  const applyFilters = () => {
    setCurrentPage(1);
    loadUsers(); // Reload with new filters
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
    // Reload will be triggered by useEffect when currentPage changes
  };

  // Role và status styling
  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'STAFF': return 'role-staff';
      case 'USER': return 'role-user';
      default: return 'role-default';
    }
  };

  const getStatusClass = (status) => {
    // Handle both boolean and string status
    if (typeof status === 'boolean') {
      return status ? 'status-active' : 'status-inactive';
    }
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'STAFF': return 'Staff';
      case 'USER': return 'User';
      default: return role;
    }
  };

  const getStatusText = (status) => {
    // Handle both boolean and string status
    if (typeof status === 'boolean') {
      return status ? 'Đang hoạt động' : 'Dừng hoạt động';
    }
    return status === 'active' ? 'Đang hoạt động' : 'Dừng hoạt động';
  };

  return (
    <div className="user-management">
      {/* Simple Header */}
      <div className="simple-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Quản lý người dùng</h1>
          </div>
          <button className="btn btn-primary add-user-btn" onClick={openAddModal}>
            {Icons.Plus && Icons.Plus()} Thêm người dùng
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards-container">
        {statsLoading ? (
          <div className="stats-loading">
            <div className="loading-spinner"></div>
            <span>Đang tải thống kê...</span>
          </div>
        ) : (
            <div className="stats-cards">
              {/* Tổng tài khoản */}
              <div className="stats-card stats-card-blue">
                <div className="stats-icon">
                  {Icons.TotalUsers && Icons.TotalUsers()}
                </div>
                <div className="stats-content">
                  <div className="stats-value">{stats.totalUsers.toLocaleString()}</div>
                  <div className="stats-label">Tổng tài khoản</div>
                </div>
              </div>

              {/* Đang hoạt động */}
              <div className="stats-card stats-card-green">
                <div className="stats-icon">
                  {Icons.ActiveUsers && Icons.ActiveUsers()}
                </div>
                <div className="stats-content">
                  <div className="stats-value">{stats.activeUsers.toLocaleString()}</div>
                  <div className="stats-label">Đang hoạt động</div>
                  <div className="stats-percentage">{stats.activePercentage}%</div>
                </div>
              </div>

              {/* Dừng hoạt động */}
              <div className="stats-card stats-card-orange">
                <div className="stats-icon">
                  {Icons.InactiveUsers && Icons.InactiveUsers()}
                </div>
                <div className="stats-content">
                  <div className="stats-value">{stats.inactiveUsers.toLocaleString()}</div>
                  <div className="stats-label">Dừng hoạt động</div>
                  <div className="stats-percentage">{stats.inactivePercentage}%</div>
                </div>
              </div>

              {/* Chưa xác thực */}
              <div className="stats-card stats-card-red">
                <div className="stats-icon">
                  {Icons.UnverifiedUsers && Icons.UnverifiedUsers()}
                </div>
                <div className="stats-content">
                  <div className="stats-value">{stats.unverifiedUsers.toLocaleString()}</div>
                  <div className="stats-label">Chưa xác thực</div>
                  <div className="stats-percentage">{stats.unverifiedPercentage}%</div>
                </div>
              </div>
            </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group search-group">
            <label className="filter-label">Tìm kiếm</label>
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Vai trò</label>
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Trạng thái</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ngày tạo</label>
            <div className="date-range">
              <input
                type="date"
                className="filter-date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
              <span className="date-separator">đến</span>
              <input
                type="date"
                className="filter-date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={applyFilters}>
              Áp dụng bộ lọc
            </button>
            <button className="btn btn-outline" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">
            Đã chọn {selectedUsers.length} người dùng
          </span>
          <div className="bulk-actions-controls">
            <select
              className="bulk-select"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Chọn hành động hàng loạt</option>
              <option value="activate">Kích hoạt tài khoản đã chọn</option>
              <option value="deactivate">Vô hiệu hóa tài khoản đã chọn</option>
              <option value="role-ADMIN">Đổi thành Admin</option>
              <option value="role-STAFF">Đổi thành Staff</option>
              <option value="role-USER">Đổi thành User</option>
              <option value="delete">Xóa tài khoản đã chọn</option>
            </select>
            <button className="btn btn-secondary" onClick={handleBulkAction}>
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="table-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="actions-col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="user-info">
                      <div className="user-avatar-name">
                        <img src={user.avatar} alt={user.fullName} className="user-avatar" />
                        <span className="user-name">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`role-tag ${getRoleClass(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td>
                      {currentUser && currentUser.id === user.id ? (
                        <span className={`status-tag ${getStatusClass(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      ) : (
                        <select
                          className={`status-dropdown ${getStatusClass(user.status)}`}
                          value={user.status}
                          onChange={(e) => handleStatusChange(user, e.target.value === 'active')}
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="inactive">Dừng hoạt động</option>
                        </select>
                      )}
                    </td>
                    <td className="user-date">{user.createdAt}</td>
                    <td className="actions-col">
                      <div className="row-actions">
                        <button
                          className="action-btn view-btn"
                          title="Xem chi tiết"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          {Icons.Eye && Icons.Eye()}
                        </button>
                        {currentUser && currentUser.id !== user.id && (
                          <button
                            className="action-btn delete-btn"
                            title="Xóa"
                            onClick={() => handleDeleteUser(user)}
                          >
                            {Icons.Trash && Icons.Trash()}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-section">
        <div className="pagination-info">
          Hiển thị {startIndex + 1} - {endIndex} trên tổng số {totalUsers} người dùng
        </div>
        
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Trang đầu
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Trước
          </button>
          
          {/* Page numbers */}
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>
          
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Sau
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Trang cuối
          </button>
        </div>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                Thêm người dùng mới
              </h2>
              <button className="modal-close" onClick={closeModal}>
                {Icons.Close && Icons.Close()}
              </button>
            </div>
            
            <form className="user-form" onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="avatar-upload">
                  <label className="avatar-label">Ảnh đại diện</label>
                  <div className="avatar-input">
                    <img
                      src={formData.avatar || 'https://ui-avatars.com/api/?name=User&background=ccc&color=fff'}
                      alt="Avatar"
                      className="avatar-preview"
                    />
                    <input
                      type="url"
                      name="avatar"
                      placeholder="URL ảnh đại diện"
                      value={formData.avatar}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu {modalMode === 'edit' && '(Bỏ trống nếu không muốn thay đổi)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={modalMode === 'add'}
                    value={formData.password}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vai trò *</label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleFormChange}
                    className="form-select"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="USER">User</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleFormChange}
                    className="form-select"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="modal-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3 className="dialog-title">Xác nhận xóa người dùng</h3>
            </div>
            <div className="dialog-body">
              <p>
                Bạn có chắc chắn muốn xóa người dùng <strong>{deletingUser?.fullName}</strong>? 
                Toàn bộ dữ liệu liên quan như lịch sử booking của họ cũng sẽ bị ảnh hưởng. 
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="dialog-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Hủy bỏ
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteDialog && (
        <div className="modal-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3 className="dialog-title">Xác nhận xóa hàng loạt</h3>
            </div>
            <div className="dialog-body">
              <p>
                Bạn có chắc chắn muốn xóa <strong>{selectedUsers.length}</strong> người dùng đã chọn?
              </p>
            </div>
            <div className="dialog-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowBulkDeleteDialog(false)}
              >
                Hủy bỏ
              </button>
              <button className="btn btn-danger" onClick={confirmBulkDelete}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
