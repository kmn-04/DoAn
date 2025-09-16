import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import activityService from '../services/activityService';
import Icons from './Icons';
import '../styles/components/UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Tab state
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilters, setActivityFilters] = useState({
    fromDate: '',
    toDate: '',
    actionType: 'all'
  });
  const [actionTypes, setActionTypes] = useState({});

  useEffect(() => {
    loadUserDetail();
    loadActionTypes();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load action types for filter dropdown
  const loadActionTypes = async () => {
    try {
      const types = await activityService.getActionTypes();
      setActionTypes(types);
    } catch (error) {
      console.error('Error loading action types:', error);
    }
  };

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user detail:', error);
      alert('Có lỗi xảy ra khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(id);
      alert('Xóa người dùng thành công!');
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'Admin',
      'STAFF': 'Staff',
      'USER': 'User'
    };
    return roleMap[role] || role;
  };

  const getStatusDisplayName = (isActive) => {
    return isActive ? 'Hoạt động' : 'Không hoạt động';
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const words = fullName.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
  };

  // Load activity logs when switching to activity tab
  const loadActivityLogs = async () => {
    try {
      setActivityLoading(true);
      console.log('🔍 Loading activity logs for user:', id);
      
      // Prepare filters
      const params = {
        page: 0,
        size: 50, // Get more logs for better display
        sortBy: 'createdAt',
        sortDir: 'desc',
        actionType: activityFilters.actionType === 'all' ? '' : activityFilters.actionType,
        fromDate: activityFilters.fromDate || '',
        toDate: activityFilters.toDate || ''
      };

      console.log('📊 Activity filters:', params);

      // Fetch real data from API
      const response = await activityService.getUserActivityLogs(id, params);
      
      // Format logs for display
      const formattedLogs = response.logs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        action: log.actionType,
        target: log.targetObject || 'Hệ thống',
        details: log.details || '',
        ipAddress: log.ipAddress || '',
        location: log.location || '',
        device: log.device || ''
      }));

      setActivityLogs(formattedLogs);
      console.log('✅ Activity logs loaded:', formattedLogs.length + ' logs');

    } catch (error) {
      console.error('❌ Error loading activity logs:', error);
      // Fallback to empty array if API fails
      setActivityLogs([]);
      alert('Không thể tải nhật ký hoạt động: ' + error.message);
    } finally {
      setActivityLoading(false);
    }
  };

  // Handle tab switch
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'activity' && activityLogs.length === 0) {
      loadActivityLogs();
    }
  };

  // Handle activity filter change
  const handleActivityFilterChange = (field, value) => {
    setActivityFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply activity filters
  const applyActivityFilters = () => {
    loadActivityLogs();
  };

  // Get action display name and color
  const getActionDisplay = (action) => {
    const actionMap = {
      'LOGIN': { name: 'Đăng nhập', color: 'blue' },
      'LOGOUT': { name: 'Đăng xuất', color: 'gray' },
      'CREATE_BOOKING': { name: 'Tạo booking', color: 'green' },
      'CONFIRM_BOOKING': { name: 'Xác nhận booking', color: 'green' },
      'CANCEL_BOOKING': { name: 'Hủy booking', color: 'red' },
      'UPDATE_PROFILE': { name: 'Cập nhật hồ sơ', color: 'orange' },
      'ADD_TO_FAVORITES': { name: 'Thêm yêu thích', color: 'purple' },
      'CREATE_PARTNER': { name: 'Tạo đối tác', color: 'blue' },
      'REPLY_CONTACT': { name: 'Trả lời liên hệ', color: 'teal' }
    };
    return actionMap[action] || { name: action, color: 'gray' };
  };

  if (loading) {
    return (
      <div className="user-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail">
        <div className="error-container">
          <p>Không tìm thấy thông tin người dùng</p>
          <button className="btn btn-primary" onClick={() => navigate('/users')}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Chi tiết Người dùng: {user.fullName}</h1>
          </div>
          <button className="btn btn-outline back-btn" onClick={() => navigate('/users')}>
            {Icons.ArrowLeft && Icons.ArrowLeft()} Quay lại
          </button>
        </div>
      </div>

      {/* Header Card - User Summary */}
      <div className="user-summary-card">
        <div className="user-summary-content">
          <div className="user-avatar-section">
            <div className="user-avatar-large">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} />
              ) : (
                <span className="avatar-initials">{getInitials(user.fullName)}</span>
              )}
            </div>
          </div>
          
          <div className="user-main-info">
            <h2 className="user-name">{user.fullName}</h2>
            <p className="user-email">{user.email}</p>
            <p className="user-join-date">Đăng ký: {formatDate(user.createdAt)}</p>
          </div>

          <div className="user-badges">
            <span className={`badge role-badge role-${user.role.toLowerCase()}`}>
              {getRoleDisplayName(user.role)}
            </span>
            <span className={`badge status-badge ${user.isActive ? 'active' : 'inactive'}`}>
              {getStatusDisplayName(user.isActive)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('overview')}
        >
          Tổng quan
        </button>
        <button 
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('activity')}
        >
          Nhật ký hoạt động
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="detail-content">
            <div className="detail-grid">
              {/* Personal Information Card */}
              <div className="detail-card">
                <div className="card-header">
                  <h3 className="card-title">Thông tin cá nhân</h3>
                </div>
                <div className="card-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <label className="info-label">Tên đầy đủ</label>
                      <span className="info-value">{user.fullName || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Email</label>
                      <span className="info-value">{user.email || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Số điện thoại</label>
                      <span className="info-value">{user.phone || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Ngày sinh</label>
                      <span className="info-value">Chưa có thông tin</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Giới tính</label>
                      <span className="info-value">Chưa có thông tin</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Địa chỉ</label>
                      <span className="info-value">{user.address || 'Chưa có thông tin'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Statistics Card */}
              <div className="detail-card">
                <div className="card-header">
                  <h3 className="card-title">Thống kê hoạt động</h3>
                </div>
                <div className="card-content">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Tổng bookings</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">0 VNĐ</div>
                      <div className="stat-label">Tổng chi tiêu</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Số reviews</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">0/5</div>
                      <div className="stat-label">Đánh giá TB</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information Card */}
              <div className="detail-card">
                <div className="card-header">
                  <h3 className="card-title">Thông tin tài khoản</h3>
                </div>
                <div className="card-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <label className="info-label">Ngày đăng ký</label>
                      <span className="info-value">{formatDateTime(user.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Cập nhật lần cuối</label>
                      <span className="info-value">{formatDateTime(user.updatedAt)}</span>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Xác thực email</label>
                      <div className="verification-status">
                        <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                          {user.emailVerified ? (
                            <>
                              <span className="verification-icon">✓</span>
                              Đã xác thực
                            </>
                          ) : (
                            <>
                              <span className="verification-icon">✕</span>
                              Chưa xác thực
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <label className="info-label">ID tài khoản</label>
                      <span className="info-value">#{user.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="detail-card actions-card">
                <div className="card-header">
                  <h3 className="card-title">Thao tác</h3>
                </div>
                <div className="card-content">
                  <button 
                    className="btn btn-danger delete-account-btn"
                    onClick={handleDeleteUser}
                  >
                    {Icons.Trash && Icons.Trash()} Xóa tài khoản
                  </button>
                  <p className="delete-warning">
                    Hành động này sẽ xóa vĩnh viễn tài khoản và không thể hoàn tác.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-content">
            <div className="activity-header">
              <h3 className="activity-title">
                Lịch sử hoạt động của {user.fullName}
              </h3>
              
              {/* Activity Filters */}
              <div className="activity-filters">
                <div className="filter-group">
                  <label className="filter-label">Từ ngày:</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={activityFilters.fromDate}
                    onChange={(e) => handleActivityFilterChange('fromDate', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Đến ngày:</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={activityFilters.toDate}
                    onChange={(e) => handleActivityFilterChange('toDate', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Loại hành động:</label>
                  <select
                    className="filter-input"
                    value={activityFilters.actionType}
                    onChange={(e) => handleActivityFilterChange('actionType', e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    {Object.entries(actionTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <button 
                  className="btn btn-primary apply-filters-btn"
                  onClick={applyActivityFilters}
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="activity-logs">
              {activityLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải nhật ký hoạt động...</p>
                </div>
              ) : (
                <>
                  {user.role === 'USER' ? (
                    // Customer Activity Logs
                    <div className="customer-activity">
                      <div className="activity-section">
                        <h4 className="section-title">Lịch sử đăng nhập</h4>
                        <div className="login-history">
                          {activityLogs.filter(log => log.action === 'LOGIN').map(log => (
                            <div key={log.id} className="login-item">
                              <div className="login-time">{formatDateTime(log.timestamp)}</div>
                              <div className="login-details">
                                <span className="login-ip">IP: {log.ipAddress}</span>
                                <span className="login-location">{log.location}</span>
                                <span className="login-device">{log.device}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="activity-section">
                        <h4 className="section-title">Hoạt động tài khoản</h4>
                        <div className="account-activity">
                          {activityLogs.filter(log => log.action !== 'LOGIN').map(log => {
                            const actionDisplay = getActionDisplay(log.action);
                            return (
                              <div key={log.id} className="activity-item">
                                <div className="activity-time">{formatDateTime(log.timestamp)}</div>
                                <div className="activity-action">
                                  <span className={`action-badge action-${actionDisplay.color}`}>
                                    {actionDisplay.name}
                                  </span>
                                </div>
                                <div className="activity-details">{log.details}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Admin/Staff Activity Logs
                    <div className="staff-activity">
                      <div className="activity-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Thời gian</th>
                              <th>Hành động</th>
                              <th>Đối tượng bị tác động</th>
                              <th>Chi tiết</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activityLogs.map(log => {
                              const actionDisplay = getActionDisplay(log.action);
                              return (
                                <tr key={log.id}>
                                  <td className="activity-time">{formatDateTime(log.timestamp)}</td>
                                  <td>
                                    <span className={`action-badge action-${actionDisplay.color}`}>
                                      {actionDisplay.name}
                                    </span>
                                  </td>
                                  <td className="activity-target">{log.target}</td>
                                  <td className="activity-details">{log.details}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="export-section">
                        <button className="btn btn-outline export-btn">
                          Xuất sang Trang tính
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="modal-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3 className="dialog-title">Xác nhận xóa tài khoản</h3>
            </div>
            <div className="dialog-body">
              <p>
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong>{user.fullName}</strong>?
              </p>
              <p className="delete-warning-text">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="dialog-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
