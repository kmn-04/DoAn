import authService from './authService';

const API_URL = 'http://localhost:8080/api/users';

class UserService {
  // Get authorization header
  getAuthHeader() {
    const user = authService.getCurrentUser();
    if (user && user.accessToken) {
      return { Authorization: 'Bearer ' + user.accessToken };
    } else {
      return {};
    }
  }

  // Get all users with pagination and filters
  async getUsers(params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortDir = 'desc',
      search = '',
      role = '',
      isActive = '',
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);
    if (isActive !== '') queryParams.append('isActive', isActive.toString());
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
        throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy danh sách người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không tìm thấy người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi xóa người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Delete multiple users
  async deleteUsers(userIds) {
    try {
      const response = await fetch(`${API_URL}/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(userIds)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi xóa người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  }

  // Update single user status
  async updateUserStatus(id, isActive) {
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Update users status
  async updateUsersStatus(userIds, isActive) {
    try {
      const response = await fetch(`${API_URL}/bulk/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({ userIds, isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating users status:', error);
      throw error;
    }
  }

  // Update users role
  async updateUsersRole(userIds, role) {
    try {
      const response = await fetch(`${API_URL}/bulk/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({ userIds, role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật vai trò');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating users role:', error);
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy thông tin profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Get user statistics (for dashboard cards)
  async getUserStats() {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi lấy thống kê người dùng');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
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

export default new UserService();

