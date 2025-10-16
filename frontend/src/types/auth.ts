// Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}
