import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { showToast } from '../components/ui/Toast';
import authService from '../services/authService';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, setLoading, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Login function
  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
      showToast.success('Đăng nhập thành công!', `Chào mừng ${response.user.name}`);
      return { success: true, user: response.user };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      showToast.error('Đăng nhập thất bại', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [login, setLoading]);

  // Register function
  const handleRegister = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      login(response.user, response.token);
      showToast.success('Đăng ký thành công!', `Chào mừng ${response.user.name}`);
      return { success: true, user: response.user };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      showToast.error('Đăng ký thất bại', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [login, setLoading]);

  // Logout function
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout API errors, still logout locally
      console.warn('Logout API failed, but continuing with local logout');
    } finally {
      logout();
      showToast.success('Đã đăng xuất', 'Hẹn gặp lại bạn!');
      navigate('/dashboard');
    }
  }, [logout, navigate]);

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return user?.role?.name?.toLowerCase() === role.toLowerCase();
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    
    // Utilities
    hasRole,
    isAdmin,
    getUserInitials,
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  return {
    isAuthenticated,
    user,
    isLoading,
    isGuest: !isAuthenticated,
  };
};

// Hook for protected actions (requires auth)
export const useProtectedAction = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const executeIfAuthenticated = useCallback((action: () => void, redirectPath = '/login') => {
    if (isAuthenticated) {
      action();
    } else {
      showToast.warning('Cần đăng nhập', 'Vui lòng đăng nhập để tiếp tục');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  return { executeIfAuthenticated };
};
