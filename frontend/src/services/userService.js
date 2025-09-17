import axiosInstance from './axiosConfig';

const API_URL = '/api/users';

class UserService {
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
      const response = await axiosInstance.get(`${API_URL}?${queryParams}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const response = await axiosInstance.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await axiosInstance.post(API_URL, userData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, userData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async updateUsersRole(userIds, role) {
    try {
      const response = await axiosInstance.put(`${API_URL}/role`, {
        userIds,
        role
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getCurrentUserProfile() {
    try {
      const response = await axiosInstance.get(`${API_URL}/profile`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const response = await axiosInstance.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  handleApiError(error) {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
}

export default new UserService();