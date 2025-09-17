import axiosInstance from './axiosConfig';

const API_BASE_URL = '/api/tours';

export const tourService = {
    getAllTours: async (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                searchParams.append(key, params[key]);
            }
        });
        
        const response = await axiosInstance.get(`${API_BASE_URL}?${searchParams}`);
        return response.data;
    },

    getTourById: async (id) => {
        const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
        return response.data;
    },

    createTour: async (tourData) => {
        const response = await axiosInstance.post(API_BASE_URL, tourData);
        return response.data;
    },

    updateTour: async (id, tourData) => {
        const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, tourData);
        return response.data;
    },

    deleteTour: async (id) => {
        await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    },

    searchTours: async (keyword, filters = {}) => {
        const params = {
            keyword,
            ...filters
        };
        return await tourService.getAllTours(params);
    },

    getTourStats: async () => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/admin/stats`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error getting tour stats:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Lỗi khi tải thống kê tour'
            };
        }
    },

    updateTourStatus: async (id, status) => {
        try {
            const response = await axiosInstance.patch(`${API_BASE_URL}/${id}/status`, { status });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error updating tour status:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Lỗi khi cập nhật trạng thái tour'
            };
        }
    }
};

export default tourService;
