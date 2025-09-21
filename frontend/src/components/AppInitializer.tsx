import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Loading } from './ui';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isInitialized, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Initialize auth status on app start
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Đang khởi tạo ứng dụng..." size="lg" center />
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
