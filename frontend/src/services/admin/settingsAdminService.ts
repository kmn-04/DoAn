import apiClient from '../api';

export interface SystemSettingRequest {
  key: string;
  value: string;
  description?: string;
  category: string;
  valueType?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  isPublic?: boolean;
}

export interface SystemSettingResponse {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  valueType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const settingsAdminService = {
  getAll: async () => {
    const response = await apiClient.get<SystemSettingResponse[]>('/admin/settings');
    return response.data.data;
  },

  getByCategory: async (category: string) => {
    const response = await apiClient.get<SystemSettingResponse[]>(
      `/admin/settings/category/${category}`
    );
    return response.data.data;
  },

  getByKey: async (key: string) => {
    const response = await apiClient.get<SystemSettingResponse>(`/admin/settings/key/${key}`);
    return response.data.data;
  },

  createOrUpdate: async (data: SystemSettingRequest) => {
    const response = await apiClient.post<SystemSettingResponse>('/admin/settings', data);
    return response.data.data;
  },

  update: async (id: number, data: SystemSettingRequest) => {
    const response = await apiClient.put<SystemSettingResponse>(`/admin/settings/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/settings/${id}`);
    return response.data;
  },
};

export default settingsAdminService;

