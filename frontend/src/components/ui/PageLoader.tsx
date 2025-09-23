import React from 'react';
import { Loading } from './Loading';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Đang tải trang...' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

// Specialized loaders for different page types
export const TourPageLoader: React.FC = () => (
  <PageLoader message="Đang tải thông tin tour..." />
);

export const BookingPageLoader: React.FC = () => (
  <PageLoader message="Đang tải thông tin booking..." />
);

export const DashboardPageLoader: React.FC = () => (
  <PageLoader message="Đang tải dashboard..." />
);

export const AuthPageLoader: React.FC = () => (
  <PageLoader message="Đang tải..." />
);
