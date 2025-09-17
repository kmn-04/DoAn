import axiosInstance from './axiosConfig';

const API_URL = '/api/partners';

const partnerService = {
  getAllPartners: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await axiosInstance.get(`${API_URL}?${queryParams}`);
    return response.data;
  },

  getAllPartnersForAdmin: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await axiosInstance.get(`${API_URL}/admin?${queryParams}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting partners for admin:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tải danh sách đối tác'
      };
    }
  },

  getPartnerById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  getActivePartners: async () => {
    const response = await axiosInstance.get(`${API_URL}/active`);
    return { content: response.data }; // Wrap in content để compatible với existing code
  },

  createPartner: async (partnerData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/admin`, partnerData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating partner:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tạo đối tác'
      };
    }
  },

  updatePartner: async (id, partnerData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/admin/${id}`, partnerData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating partner:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi cập nhật đối tác'
      };
    }
  },

  deletePartner: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/admin/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting partner:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi xóa đối tác'
      };
    }
  },

  searchPartners: async (keyword, filters = {}) => {
    const params = {
      keyword,
      ...filters
    };
    return await partnerService.getAllPartnersForAdmin(params);
  },

  getPartnerStats: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/stats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting partner stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi tải thống kê đối tác'
      };
    }
  },

  togglePartnerStatus: async (id) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/admin/${id}/toggle-status`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error toggling partner status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi khi thay đổi trạng thái đối tác'
      };
    }
  }
};

export default partnerService;