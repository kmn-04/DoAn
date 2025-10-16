import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  WifiIcon,
  TicketIcon,
  CalendarDaysIcon,
  TrashIcon,
  EyeIcon,
  CreditCardIcon,
  GiftIcon,
  CogIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { 
  BellIcon as BellSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  InformationCircleIcon as InformationCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon
} from '@heroicons/react/24/solid';
import { useNotifications } from '../../hooks/useNotifications';
import { Card, Button } from '../ui';
import type { Notification } from '../../services/notificationService';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const {
    notifications,
    stats,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadMore,
    hasMore,
    isLoadingMore
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    
    switch (type?.toLowerCase()) {
      case 'booking':
        return <TicketIcon className={`${iconClass} text-blue-500`} />;
      case 'payment':
        return <CreditCardIcon className={`${iconClass} text-purple-500`} />;
      case 'tour_update':
        return <CalendarDaysIcon className={`${iconClass} text-green-500`} />;
      case 'promotion':
        return <GiftIcon className={`${iconClass} text-pink-500`} />;
      case 'system':
        return <CogIcon className={`${iconClass} text-gray-500`} />;
      case 'success':
        return <CheckCircleSolidIcon className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <ExclamationTriangleSolidIcon className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <XCircleSolidIcon className={`${iconClass} text-red-500`} />;
      case 'info':
      default:
        return <InformationCircleSolidIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes}p`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getNavigationUrl = (notification: Notification): string => {
    // Always generate URL based on notification type, ignore actionUrl
    switch (notification.type?.toLowerCase()) {
      case 'booking':
      case 'success': // Handle success notifications (usually booking success)
        return '/bookings';
      case 'payment':
        return '/bookings'; // Also go to bookings for payment notifications
      case 'tour_update':
        return '/tours';
      case 'promotion':
        return '/tours';
      case 'system':
        return '/notifications';
      default:
        return '/dashboard';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Navigate to appropriate page
    const url = getNavigationUrl(notification);
    console.log('🔍 NotificationCenter click debug:', {
      notificationType: notification.type,
      originalActionUrl: notification.actionUrl,
      generatedUrl: url,
      notificationId: notification.id
    });
    navigate(url);
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setActiveMenu(null);
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
    setActiveMenu(null);
  };

  const unreadCount = stats?.unread || 0;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-blue-600" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Connection Status */}
                <div className={`flex items-center space-x-1 text-xs ${
                  isConnected ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <WifiIcon className="w-3 h-3" />
                  <span>{isConnected ? 'Kết nối' : 'Mất kết nối'}</span>
                </div>
                
                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === 'main' ? null : 'main')}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                  
                  {activeMenu === 'main' && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Đánh dấu tất cả đã đọc
                          </button>
                        )}
                        <button
                          onClick={() => {
                            refresh();
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Làm mới
                        </button>
                        <Link
                          to="/notifications"
                          onClick={() => {
                            setIsOpen(false);
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                          Xem tất cả
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.isRead ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                              {!notification.isRead && (
                                <span className="ml-1 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </p>
                            <p className={`text-xs mt-1 line-clamp-2 ${
                              notification.isRead ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="Đánh dấu đã đọc"
                              >
                                <EyeIcon className="w-3 h-3" />
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Xóa thông báo"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {hasMore && (
                <button
                  onClick={() => loadMore()}
                  disabled={isLoadingMore}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
                </button>
              )}
              
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả thông báo
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;