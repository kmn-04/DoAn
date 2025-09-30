import { apiClient } from './api';

// Common types
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Category types
export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;  // NEW: Icon emoji for category
  parentId?: number;  // NEW: For hierarchical categories
  displayOrder?: number;  // NEW: Sort order
  isFeatured?: boolean;  // NEW: Featured categories
  status: 'ACTIVE' | 'INACTIVE' | 'Active' | 'Inactive';  // Support both formats
  totalTours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface CategoryWithTourCount {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  tourCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

const categoryService = {
  // Get all categories
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>('/categories');
    return response.data.data!;
  },

  // Get active categories
  getActiveCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>('/categories/active');
    return response.data.data!;
  },

  // Get categories with tour count
  getCategoriesWithTourCount: async (): Promise<CategoryWithTourCount[]> => {
    const response = await apiClient.get<CategoryWithTourCount[]>('/categories/with-tour-count');
    return response.data.data!;
  },

  // Search categories
  searchCategories: async (keyword: string, params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<CategoryResponse>> => {
    const response = await apiClient.get<PageResponse<CategoryResponse>>('/categories/search', {
      params: { keyword, ...params }
    });
    return response.data.data!;
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return response.data.data!;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/slug/${slug}`);
    return response.data.data!;
  },

  // Check if slug exists
  checkSlugExists: async (slug: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/categories/check-slug/${slug}`);
    return response.data.data!;
  },

  // Create category (admin only)
  createCategory: async (categoryData: CategoryCreateRequest): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>('/categories', categoryData);
    return response.data.data!;
  },

  // Update category (admin only)
  updateCategory: async (id: number, categoryData: Partial<CategoryCreateRequest>): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, categoryData);
    return response.data.data!;
  },

  // Change category status (admin only)
  changeCategoryStatus: async (id: number, status: CategoryStatus): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}/status`, null, {
      params: { status }
    });
    return response.data.data!;
  },

  // Delete category (admin only)
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
