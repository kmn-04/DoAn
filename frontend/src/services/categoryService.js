import axiosInstance from './axiosConfig';

const API_URL = '/api/categories';

const categoryService = {
  getAllCategories: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await axiosInstance.get(`${API_URL}?${queryParams}`);
    return response.data;
  },

  getAllCategoriesForAdmin: async () => {
    const response = await axiosInstance.get(`${API_URL}/admin/all`);
    return response.data;
  },

  getAllCategoriesOrderByDisplay: async () => {
    const response = await axiosInstance.get(`${API_URL}/admin/all`);
    return {
      success: true,
      data: response.data
    };
  },

  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await axiosInstance.post(`${API_URL}/admin`, categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await axiosInstance.put(`${API_URL}/admin/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/admin/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi xóa danh mục'
      };
    }
  },


  getCategoryStats: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/stats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tải thống kê danh mục'
      };
    }
  },

  toggleCategoryStatus: async (id) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/admin/${id}/toggle-status`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error toggling category status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi thay đổi trạng thái danh mục'
      };
    }
  },

  searchCategories: async (name) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/search?name=${encodeURIComponent(name)}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error searching categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tìm kiếm danh mục'
      };
    }
  },

  validateCategoryData: (formData) => {
    const errors = {};
    let isValid = true;

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Tên danh mục không được để trống';
      isValid = false;
    } else if (formData.name.length > 100) {
      errors.name = 'Tên danh mục không được vượt quá 100 ký tự';
      isValid = false;
    }

    return { isValid, errors };
  }
};

export default categoryService;