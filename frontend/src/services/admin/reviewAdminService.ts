import apiClient from '../api';

export interface ReviewResponse {
  id: number;
  userId: number;
  userName: string;
  tourId: number;
  tourName: string;
  rating: number;
  comment: string;
  status: string;
  helpfulCount: number;
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

const reviewAdminService = {
  getAll: async (page = 0, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<ReviewResponse>>(
      `/admin/reviews?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  getByStatus: async (status: string, page = 0, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<ReviewResponse>>(
      `/admin/reviews/status/${status}?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  approve: async (id: number) => {
    const response = await apiClient.patch<ReviewResponse>(`/admin/reviews/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: number, reason?: string) => {
    const response = await apiClient.patch<ReviewResponse>(
      `/admin/reviews/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
    );
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  getCount: async () => {
    const response = await apiClient.get<number>('/admin/reviews/count');
    return response.data.data;
  },

  getPendingCount: async () => {
    const response = await apiClient.get<number>('/admin/reviews/count/pending');
    return response.data.data;
  },
};

export default reviewAdminService;

