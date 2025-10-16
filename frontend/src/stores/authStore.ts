import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define User interface directly to avoid import issues
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  role: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        
        // Set token to localStorage for API calls
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Remove token from localStorage
        localStorage.removeItem('token');
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updatedUser },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        set({ isInitialized: true });
      },

      checkAuthStatus: async () => {
        const { token, user } = get();
        
        // If no token, just initialize
        if (!token) {
          set({ isInitialized: true, isAuthenticated: false, user: null });
          return;
        }

        // If we have token and user, validate they're still valid
        if (token && user) {
          set({ 
            isAuthenticated: true, 
            isInitialized: true,
            user,
            token 
          });
          return;
        }

        set({ isLoading: true });
        try {
          // Try to get user info from backend using stored token
          const response = await fetch('http://localhost:8080/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            // Backend returns: { success: true, message: "...", data: {...} }
            const user = userData.data || userData;
            set({ 
              user: user, 
              isAuthenticated: true,
              token,
              isInitialized: true 
            });
          } else {
            // Token invalid, clear auth state
            get().logout();
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token invalid or network error, clear auth state
          get().logout();
          set({ isInitialized: true });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
