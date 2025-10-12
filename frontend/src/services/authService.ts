import { apiClient } from './api';

// Define auth types directly to avoid import issues
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  role: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const authService = {
  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data.data!;
  },

  // Register user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data.data!;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data.data!;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (token) {
      await apiClient.post('/auth/logout');
    }
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`/auth/refresh?refreshToken=${refreshToken}`);
    return response.data.data!;
  },

  // Check if email exists
  checkEmailExists: async (email: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/auth/check-email?email=${email}`);
    return response.data.data!;
  },

  // Validate token
  validateToken: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/validate-token');
    return response.data.data!;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },
};

export default authService;
