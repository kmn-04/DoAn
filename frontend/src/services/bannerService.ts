import apiClient from './api';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const bannerService = {
  // Public API - Get active banners
  getActiveBanners: async (): Promise<Banner[]> => {
    try {
      const response = await apiClient.get('/banners/active');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching active banners:', error);
      return [];
    }
  },

  // Admin APIs
  getAllBanners: async (): Promise<Banner[]> => {
    try {
      const response = await apiClient.get('/admin/banners');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  getBannerById: async (id: number): Promise<Banner> => {
    try {
      const response = await apiClient.get(`/admin/banners/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  },

  createBanner: async (data: BannerFormData): Promise<Banner> => {
    try {
      const response = await apiClient.post('/admin/banners', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  updateBanner: async (id: number, data: BannerFormData): Promise<Banner> => {
    try {
      const response = await apiClient.put(`/admin/banners/${id}`, data);
      return response.data.data!;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  deleteBanner: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/banners/${id}`);
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }
};

export default bannerService;

