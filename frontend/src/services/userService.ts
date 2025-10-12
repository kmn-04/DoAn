import { apiClient } from './api';

// Types
export interface UserUpdateRequest {
  name: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  status: string;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalBookings: number;
}

const userService = {
  // Get current user profile
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data.data!;
  },

  // Update user profile
  updateProfile: async (data: UserUpdateRequest): Promise<UserResponse> => {
    // Get current user ID from auth store or token
    const currentUserResponse = await apiClient.get<UserResponse>('/auth/me');
    const userId = currentUserResponse.data.data!.id;
    
    const response = await apiClient.put<UserResponse>(`/users/${userId}`, data);
    return response.data.data!;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    // Get current user ID
    const currentUserResponse = await apiClient.get<UserResponse>('/auth/me');
    const userId = currentUserResponse.data.data!.id;
    
    await apiClient.put(`/users/${userId}/change-password`, data);
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // For now, simulate upload and return a mock URL
    // In real implementation, this would upload to cloud storage
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a more unique URL with random seed
        const randomSeed = Math.random().toString(36).substring(7);
        const mockUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${randomSeed}&backgroundColor=random`;
        resolve(mockUrl);
      }, 1000); // Reduced timeout for better UX
    });
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return response.data.data!;
  },

  // Get user by email
  getUserByEmail: async (email: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/email/${email}`);
    return response.data.data!;
  },

  // Verify email
  verifyEmail: async (): Promise<UserResponse> => {
    // Get current user ID
    const currentUserResponse = await apiClient.get<UserResponse>('/auth/me');
    const userId = currentUserResponse.data.data!.id;
    
    const response = await apiClient.put<UserResponse>(`/users/${userId}/verify-email`);
    return response.data.data!;
  },

  // Get user statistics (for dashboard)
  getStatistics: async (): Promise<UserStatistics> => {
    const response = await apiClient.get<UserStatistics>('/users/statistics');
    return response.data.data!;
  },

  // Delete account (soft delete)
  deleteAccount: async (): Promise<void> => {
    // Get current user ID
    const currentUserResponse = await apiClient.get<UserResponse>('/auth/me');
    const userId = currentUserResponse.data.data!.id;
    
    await apiClient.delete(`/users/${userId}`);
  },

  // Get user's bookings
  getUserBookings: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/bookings/user/${userId}`);
    return response.data.data!;
  }
};

export default userService;
