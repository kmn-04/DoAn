import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import authService from '../../services/authService';

const GoogleOAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  useEffect(() => {
    // Get token from URL query parameter
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token) {
      // Save token to localStorage first (needed for API calls)
      localStorage.setItem('token', token);
      
      // Fetch user info with token
      authService.getCurrentUser()
        .then((user) => {
          // Save token and user to auth store
          login(user, token);
          
          // Redirect based on user role
          const isAdmin = user.role?.name?.toUpperCase() === 'ADMIN';
          const redirectPath = isAdmin ? '/admin' : '/dashboard';
          navigate(redirectPath, { replace: true });
        })
        .catch((error) => {
          console.error('Failed to fetch user info:', error);
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        });
    } else {
      // No token - redirect back to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, login]);
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallbackPage;

