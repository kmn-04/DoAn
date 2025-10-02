import apiClient from '../api';

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  tourInterest?: string;
  status: string;
  assignedToId?: number;
  assignedToName?: string;
  adminNote?: string;
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

const contactAdminService = {
  getAll: async (page = 0, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<ContactResponse>>(
      `/admin/contacts?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  getByStatus: async (status: string, page = 0, size = 10) => {
    const response = await apiClient.get<PaginatedResponse<ContactResponse>>(
      `/admin/contacts/status/${status}?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<ContactResponse>(`/admin/contacts/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await apiClient.patch<ContactResponse>(
      `/admin/contacts/${id}/status?status=${status}`
    );
    return response.data.data;
  },

  assignToStaff: async (id: number, staffId: number) => {
    const response = await apiClient.patch<ContactResponse>(
      `/admin/contacts/${id}/assign?staffId=${staffId}`
    );
    return response.data.data;
  },

  addNote: async (id: number, note: string) => {
    const response = await apiClient.patch<ContactResponse>(
      `/admin/contacts/${id}/note?note=${encodeURIComponent(note)}`
    );
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/contacts/${id}`);
    return response.data;
  },

  getCount: async () => {
    const response = await apiClient.get<number>('/admin/contacts/count');
    return response.data.data;
  },

  getNewCount: async () => {
    const response = await apiClient.get<number>('/admin/contacts/count/new');
    return response.data.data;
  },
};

export default contactAdminService;

