import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import Icons from './Icons';
import '../styles/components/UserManagement.css';
import '../styles/shared/ManagementCommon.css';

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
  
  
  // State cho confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  

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

  // Load users khi pagination thay đổi
  useEffect(() => {
    loadUsers();
  }, [currentPage, itemsPerPage]);

  // Effect để load statistics và current user một lần khi component mount
  useEffect(() => {
    loadStats();
    loadCurrentUser();
  }, []);

  // Auto-trigger search khi filter thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset về trang đầu khi filter
      loadUsers();
    }, 300); // Debounce 300ms để tránh gọi API quá nhiều

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, statusFilter, dateRange.from, dateRange.to]);

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

  // Navigate to add user page
  const handleAddUser = () => {
    navigate('/users/add');
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

  // Clear filters function (giữ lại để có thể dùng cho button clear nếu cần)
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
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
          <button className="btn btn-primary add-user-btn" onClick={handleAddUser}>
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

      {/* Search and Filter Combined */}
      <div className="search-filter-section">
        <div className="search-filter-box">
          <div className="search-section">
            {Icons.Search && Icons.Search()}
            <input
              type="text"
              placeholder="Tìm kiếm tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-divider"></div>

          <div className="filter-section">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-section">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-section">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="filter-dropdown"
              placeholder="Từ ngày"
            />
          </div>

          <div className="filter-divider"></div>

          <div className="filter-section">
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="filter-dropdown"
              placeholder="Đến ngày"
            />
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
