import apiClient from '../api';

export interface NotificationRequest {
  userId?: number;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
}

export interface NotificationResponse {
  id: number;
  userId?: number;
  userName?: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
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

const notificationAdminService = {
  getAll: async (page = 0, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<NotificationResponse>>(
      `/admin/notifications?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<NotificationResponse>(`/admin/notifications/${id}`);
    return response.data.data;
  },

  create: async (data: NotificationRequest) => {
    const response = await apiClient.post<string>('/admin/notifications', data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/notifications/${id}`);
    return response.data;
  },

  getCount: async () => {
    const response = await apiClient.get<number>('/admin/notifications/count');
    return response.data.data;
  },
};

export default notificationAdminService;

