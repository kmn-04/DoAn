import React from 'react';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation();

  const getDefaultContent = () => {
    switch (type) {
      case 'wishlist':
        return {
          title: t('dashboard.emptyState.wishlist.title'),
          description: t('dashboard.emptyState.wishlist.description'),
          actionText: t('dashboard.emptyState.wishlist.action'),
          actionUrl: '/tours'
        };
      case 'bookings':
        return {
          title: t('dashboard.emptyState.bookings.title'),
          description: t('dashboard.emptyState.bookings.description'),
          actionText: t('dashboard.emptyState.bookings.action'),
          actionUrl: '/tours'
        };
      case 'notifications':
        return {
          title: t('dashboard.emptyState.notifications.title'),
          description: t('dashboard.emptyState.notifications.description'),
          actionText: t('dashboard.emptyState.notifications.action'),
          actionUrl: '/notifications'
        };
      case 'search':
        return {
          title: t('dashboard.emptyState.search.title'),
          description: t('dashboard.emptyState.search.description'),
          actionText: t('dashboard.emptyState.search.action'),
          actionUrl: ''
        };
      default:
        return {
          title: t('dashboard.emptyState.general.title'),
          description: t('dashboard.emptyState.general.description'),
          actionText: t('dashboard.emptyState.general.action'),
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
            <p className="text-sm text-gray-500 mb-2">{t('dashboard.emptyState.search.suggestions')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                t('dashboard.emptyState.search.destinations.halong'),
                t('dashboard.emptyState.search.destinations.sapa'),
                t('dashboard.emptyState.search.destinations.phuQuoc'),
                t('dashboard.emptyState.search.destinations.daNang'),
                t('dashboard.emptyState.search.destinations.hoiAn')
              ].map((keyword) => (
                <Link
                  key={keyword}
                  to={`/tours?search=${encodeURIComponent(keyword)}`}
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
