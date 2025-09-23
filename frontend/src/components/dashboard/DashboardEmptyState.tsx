import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  DocumentTextIcon,
  BellIcon,
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface DashboardEmptyStateProps {
  type: 'wishlist' | 'bookings' | 'notifications' | 'search' | 'general';
  title?: string;
  description?: string;
  actionText?: string;
  actionUrl?: string;
  onAction?: () => void;
  showSearchSuggestion?: boolean;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  actionUrl,
  onAction,
  showSearchSuggestion = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'wishlist':
        return <HeartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />;
      case 'bookings':
        return <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />;
      case 'notifications':
        return <BellIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />;
      case 'search':
        return <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />;
      default:
        return <CalendarDaysIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'wishlist':
        return {
          title: 'Chưa có tour yêu thích',
          description: 'Hãy khám phá và lưu những tour du lịch yêu thích của bạn!',
          actionText: 'Khám phá tours',
          actionUrl: '/tours'
        };
      case 'bookings':
        return {
          title: 'Chưa có booking nào',
          description: 'Bạn chưa đặt tour nào. Hãy bắt đầu cuộc hành trình của bạn!',
          actionText: 'Đặt tour ngay',
          actionUrl: '/tours'
        };
      case 'notifications':
        return {
          title: 'Không có thông báo mới',
          description: 'Tất cả thông báo đã được xem. Chúng tôi sẽ thông báo khi có cập nhật mới.',
          actionText: 'Xem tất cả',
          actionUrl: '/notifications'
        };
      case 'search':
        return {
          title: 'Không tìm thấy kết quả',
          description: 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy những gì bạn cần.',
          actionText: 'Xóa bộ lọc',
          actionUrl: ''
        };
      default:
        return {
          title: 'Không có dữ liệu',
          description: 'Hiện tại không có thông tin để hiển thị.',
          actionText: 'Làm mới',
          actionUrl: ''
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalActionText = actionText || defaultContent.actionText;
  const finalActionUrl = actionUrl || defaultContent.actionUrl;

  return (
    <div className="text-center py-12">
      {getIcon()}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {finalTitle}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {finalDescription}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {finalActionUrl && (
          <Link to={finalActionUrl}>
            <Button className="w-full sm:w-auto">
              <PlusIcon className="h-4 w-4 mr-2" />
              {finalActionText}
            </Button>
          </Link>
        )}
        
        {onAction && (
          <Button 
            variant="outline" 
            onClick={onAction}
            className="w-full sm:w-auto"
          >
            {finalActionText}
          </Button>
        )}

        {showSearchSuggestion && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Gợi ý tìm kiếm:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Hạ Long', 'Sapa', 'Phú Quốc', 'Đà Nẵng', 'Hội An'].map((keyword) => (
                <Link
                  key={keyword}
                  to={`/tours?search=${keyword}`}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardEmptyState;
