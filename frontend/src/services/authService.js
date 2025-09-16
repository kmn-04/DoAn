import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Cấu hình axios interceptor để tự động thêm token
axios.defaults.baseURL = 'http://localhost:8080';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  // Đăng nhập
  login: async (emailOrPhone, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        emailOrPhone,
        password
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Social Login
  socialLogin: async (socialData) => {
    try {
      const response = await axios.post(`${API_URL}/social-login`, {
        provider: socialData.provider,
        providerId: socialData.id,
        email: socialData.email,
        name: socialData.name,
        picture: socialData.picture
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Kiểm tra role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Xác minh email
  verifyEmail: async (email, verificationCode) => {
    try {
      const response = await axios.post(`${API_URL}/verify-email`, {
        email,
        verificationCode
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Gửi lại mã xác minh
  resendVerification: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/resend-verification`, {
        email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default authService;
