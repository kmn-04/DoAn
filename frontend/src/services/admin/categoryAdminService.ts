import apiClient from '../api';

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: number;
  displayOrder?: number;
  isFeatured?: boolean;
  status?: 'Active' | 'Inactive';
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: number;
  displayOrder?: number;
  isFeatured?: boolean;
  status: string;
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

const categoryAdminService = {
  // Get all categories with pagination
  getAllCategories: async (page = 0, size = 10, sortBy = 'displayOrder', direction = 'asc') => {
    const response = await apiClient.get<PaginatedResponse<CategoryResponse>>(
      `/admin/categories?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data.data;
  },

  // Alias for compatibility
  getAll: async (page = 0, size = 10, sortBy = 'displayOrder', direction = 'asc') => {
    const response = await apiClient.get<PaginatedResponse<CategoryResponse>>(
      `/admin/categories?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data.data;
  },

  // Get category by ID
  getCategoryById: async (id: number) => {
    const response = await apiClient.get<CategoryResponse>(`/admin/categories/${id}`);
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<CategoryResponse>(`/admin/categories/${id}`);
    return response.data.data;
  },

  // Create category
  createCategory: async (data: CategoryRequest) => {
    const response = await apiClient.post<CategoryResponse>('/admin/categories', data);
    return response.data.data;
  },

  create: async (data: CategoryRequest) => {
    const response = await apiClient.post<CategoryResponse>('/admin/categories', data);
    return response.data.data;
  },

  // Update category
  updateCategory: async (id: number, data: CategoryRequest) => {
    const response = await apiClient.put<CategoryResponse>(`/admin/categories/${id}`, data);
    return response.data.data;
  },

  update: async (id: number, data: CategoryRequest) => {
    const response = await apiClient.put<CategoryResponse>(`/admin/categories/${id}`, data);
    return response.data.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Change category status
  changeStatus: async (id: number, status: 'Active' | 'Inactive') => {
    const response = await apiClient.patch<CategoryResponse>(
      `/admin/categories/${id}/status?status=${status}`
    );
    return response.data.data;
  },

  // Get total count
  getCount: async () => {
    const response = await apiClient.get<number>('/admin/categories/count');
    return response.data.data;
  },
};

export default categoryAdminService;

