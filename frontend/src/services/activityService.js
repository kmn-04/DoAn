import authService from './authService';

const API_URL = 'http://localhost:8080/api/activity-logs';

class ActivityService {
  // Get authorization header
  getAuthHeader() {
    const user = authService.getCurrentUser();
    if (user && user.accessToken) {
      return { Authorization: 'Bearer ' + user.accessToken };
    } else {
      return {};
    }
  }

  // Get activity logs for a specific user
  async getUserActivityLogs(userId, params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortDir = 'desc',
      actionType = '',
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    if (actionType) queryParams.append('actionType', actionType);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    console.log('🔍 Fetching activity logs for user:', userId, 'with params:', params);

    try {
      const response = await fetch(`${API_URL}/user/${userId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tải nhật ký hoạt động');
      }

      const data = await response.json();
      console.log('📊 Activity logs received:', data);
      return data;

    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  // Get all activity logs (Admin only)
  async getAllActivityLogs(params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortDir = 'desc',
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    try {
      const response = await fetch(`${API_URL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tải tất cả nhật ký');
      }

      return await response.json();

    } catch (error) {
      console.error('Error fetching all activity logs:', error);
      throw error;
    }
  }

  // Create activity log
  async createActivityLog(logData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo nhật ký');
      }

      return await response.json();

    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  }

  // Get activity statistics for a user
  async getUserActivityStats(userId) {
    try {
      const response = await fetch(`${API_URL}/user/${userId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tải thống kê');
      }

      return await response.json();

    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  // Get available action types
  async getActionTypes() {
    try {
      const response = await fetch(`${API_URL}/action-types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tải loại hành động');
      }

      return await response.json();

    } catch (error) {
      console.error('Error fetching action types:', error);
      throw error;
    }
  }

  // Helper: Log user activity automatically
  async logActivity(actionType, targetObject = '', details = '', additionalData = {}) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      const logData = {
        userId: currentUser.id,
        actionType,
        targetObject,
        details,
        ipAddress: additionalData.ipAddress || '',
        location: additionalData.location || '',
        device: additionalData.device || this.getBrowserInfo()
      };

      await this.createActivityLog(logData);
      console.log('📝 Activity logged:', actionType, targetObject);

    } catch (error) {
      // Don't throw error for logging failures, just log it
      console.warn('Failed to log activity:', error.message);
    }
  }

  // Get browser/device info
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return `${browser} - ${os}`;
  }

  // Format activity log for display
  formatActivityLog(log) {
    const actionDisplayMap = {
      'LOGIN': { name: 'Đăng nhập', color: 'blue' },
      'LOGOUT': { name: 'Đăng xuất', color: 'gray' },
      'CREATE_BOOKING': { name: 'Tạo booking', color: 'green' },
      'CONFIRM_BOOKING': { name: 'Xác nhận booking', color: 'green' },
      'CANCEL_BOOKING': { name: 'Hủy booking', color: 'red' },
      'UPDATE_PROFILE': { name: 'Cập nhật hồ sơ', color: 'orange' },
      'ADD_TO_FAVORITES': { name: 'Thêm yêu thích', color: 'purple' },
      'CREATE_PARTNER': { name: 'Tạo đối tác', color: 'blue' },
      'REPLY_CONTACT': { name: 'Trả lời liên hệ', color: 'teal' },
      'CREATE_USER': { name: 'Tạo người dùng', color: 'blue' },
      'UPDATE_USER': { name: 'Cập nhật người dùng', color: 'orange' },
      'DELETE_USER': { name: 'Xóa người dùng', color: 'red' }
    };

    return {
      ...log,
      actionDisplay: actionDisplayMap[log.actionType] || { 
        name: log.actionType, 
        color: 'gray' 
      }
    };
  }

  // Handle API errors
  handleApiError(error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Token expired, logout user
      authService.logout();
      window.location.href = '/login';
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
}

export default new ActivityService();
