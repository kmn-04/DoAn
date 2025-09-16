import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

// Tạo axios instance với config mặc định
const categoryAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào headers
categoryAPI.interceptors.request.use(
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

// Interceptor để xử lý response và error
categoryAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const categoryService = {
  // ========================
  // PUBLIC ENDPOINTS
  // ========================

  // Lấy danh sách categories đang active (cho public)
  getActiveCategories: async () => {
    try {
      const response = await categoryAPI.get('/active');
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách danh mục',
        status: error.response?.status
      };
    }
  },

  // Lấy category theo ID (public)
  getCategoryById: async (id) => {
    try {
      const response = await categoryAPI.get(`/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi lấy thông tin danh mục',
        status: error.response?.status
      };
    }
  },

  // Lấy category theo slug (public)
  getCategoryBySlug: async (slug) => {
    try {
      const response = await categoryAPI.get(`/slug/${slug}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi lấy thông tin danh mục',
        status: error.response?.status
      };
    }
  },

  // ========================
  // ADMIN ENDPOINTS
  // ========================

  // Lấy tất cả categories với phân trang (admin)
  getAllCategories: async (page = 0, size = 10, sortBy = 'displayOrder', sortDir = 'asc') => {
    try {
      const response = await categoryAPI.get('/admin', {
        params: { page, size, sortBy, sortDir }
      });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách danh mục',
        status: error.response?.status
      };
    }
  },

  // Lấy tất cả categories sắp xếp theo display_order (admin)
  getAllCategoriesOrderByDisplay: async () => {
    try {
      const response = await categoryAPI.get('/admin/all');
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi lấy danh sách danh mục',
        status: error.response?.status
      };
    }
  },

  // Tìm kiếm categories theo tên (admin)
  searchCategories: async (name) => {
    try {
      const response = await categoryAPI.get('/admin/search', {
        params: { name }
      });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tìm kiếm danh mục',
        status: error.response?.status
      };
    }
  },

  // Tạo category mới (admin)
  createCategory: async (categoryData) => {
    try {
      const response = await categoryAPI.post('/admin', categoryData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tạo danh mục',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },

  // Cập nhật category (admin)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await categoryAPI.put(`/admin/${id}`, categoryData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi cập nhật danh mục',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },

  // Xóa category (admin)
  deleteCategory: async (id) => {
    try {
      const response = await categoryAPI.delete(`/admin/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi xóa danh mục',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },

  // Sắp xếp lại thứ tự categories (admin)
  reorderCategories: async (categoryOrders) => {
    try {
      const response = await categoryAPI.put('/admin/reorder', {
        categoryOrders
      });
      return {
        success: true,
        data: response.data,
        message: 'Sắp xếp thứ tự danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi sắp xếp thứ tự danh mục',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },

  // Toggle trạng thái active/inactive (admin)
  toggleCategoryStatus: async (id) => {
    try {
      const response = await categoryAPI.patch(`/admin/${id}/toggle-status`);
      return {
        success: true,
        data: response.data,
        message: 'Thay đổi trạng thái danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi thay đổi trạng thái danh mục',
        status: error.response?.status,
        details: error.response?.data
      };
    }
  },

  // Lấy thống kê categories (admin)
  getCategoryStats: async () => {
    try {
      const response = await categoryAPI.get('/admin/stats');
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê danh mục thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi lấy thống kê danh mục',
        status: error.response?.status
      };
    }
  },

  // ========================
  // UTILITY FUNCTIONS
  // ========================

  // Tạo slug từ tên
  generateSlug: (name) => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/[đ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  },

  // Validate dữ liệu category
  validateCategoryData: (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Tên danh mục không được để trống';
    } else if (data.name.length > 100) {
      errors.name = 'Tên danh mục không được vượt quá 100 ký tự';
    }

    if (data.slug && data.slug.length > 100) {
      errors.slug = 'Slug không được vượt quá 100 ký tự';
    }

    if (data.displayOrder && (data.displayOrder < 0 || !Number.isInteger(Number(data.displayOrder)))) {
      errors.displayOrder = 'Thứ tự hiển thị phải là số nguyên dương';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default categoryService;
