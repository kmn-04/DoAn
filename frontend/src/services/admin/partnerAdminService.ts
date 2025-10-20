import apiClient from '../api';

export interface PartnerRequest {
  name: string;
  slug?: string;
  description?: string;
  type: 'Hotel' | 'Restaurant' | 'Transport' | 'TourOperator' | 'Insurance' | 'Other';
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  establishedYear?: number;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  specialties?: string;
}

export interface PartnerResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  establishedYear?: number;
  avatarUrl?: string;
  rating?: number;
  status: string;
  specialties?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const partnerAdminService = {
  // Get all partners with pagination
  getAllPartners: async (page = 0, size = 10, sortBy = 'name', direction = 'asc') => {
    const response = await apiClient.get<PaginatedResponse<PartnerResponse>>(
      `/admin/partners?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data.data;
  },

  getAll: async (page = 0, size = 10, sortBy = 'name', direction = 'asc') => {
    const response = await apiClient.get<PaginatedResponse<PartnerResponse>>(
      `/admin/partners?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data.data;
  },

  // Get partner by ID
  getPartnerById: async (id: number) => {
    const response = await apiClient.get<PartnerResponse>(`/admin/partners/${id}`);
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<PartnerResponse>(`/admin/partners/${id}`);
    return response.data.data;
  },

  // Create partner
  createPartner: async (data: PartnerRequest) => {
    const response = await apiClient.post<PartnerResponse>('/admin/partners', data);
    return response.data.data;
  },

  create: async (data: PartnerRequest) => {
    const response = await apiClient.post<PartnerResponse>('/admin/partners', data);
    return response.data.data;
  },

  // Update partner
  updatePartner: async (id: number, data: PartnerRequest) => {
    const response = await apiClient.put<PartnerResponse>(`/admin/partners/${id}`, data);
    return response.data.data;
  },

  update: async (id: number, data: PartnerRequest) => {
    const response = await apiClient.put<PartnerResponse>(`/admin/partners/${id}`, data);
    return response.data.data;
  },

  // Delete partner
  deletePartner: async (id: number) => {
    const response = await apiClient.delete(`/admin/partners/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/partners/${id}`);
    return response.data;
  },

  // Change partner status
  changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    const response = await apiClient.patch<PartnerResponse>(
      `/admin/partners/${id}/status?status=${status}`
    );
    return response.data.data;
  },

  // Get total count
  getCount: async () => {
    const response = await apiClient.get<number>('/admin/partners/count');
    return response.data.data;
  },

  // Partner images
  listImages: async (partnerId: number) => {
    const res = await apiClient.get(`/admin/partners/${partnerId}/images`);
    return res.data.data as Array<{id:number,imageUrl:string,imageType:string,displayOrder:number,altText?:string}>;
  },
  addImage: async (partnerId: number, payload: { imageUrl: string; imageType: 'cover' | 'logo' | 'gallery'; displayOrder?: number; altText?: string; }) => {
    const res = await apiClient.post(`/admin/partners/${partnerId}/images`, payload);
    return res.data.data;
  },
  updateImage: async (imageId: number, payload: { imageType?: 'cover' | 'logo' | 'gallery'; displayOrder?: number; altText?: string; }) => {
    const res = await apiClient.patch(`/admin/partners/images/${imageId}`, payload);
    return res.data.data;
  },
  deleteImage: async (imageId: number) => {
    const res = await apiClient.delete(`/admin/partners/images/${imageId}`);
    return res.data;
  }
};

export default partnerAdminService;

