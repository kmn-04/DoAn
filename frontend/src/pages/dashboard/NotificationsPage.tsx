import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { 
  BellIcon,
  CheckIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  CalendarDaysIcon,
  TicketIcon,
  CheckCircleIcon,
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
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'tour_update' | 'promotion' | 'system' | 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await notificationService.getNotifications(user.id, 0, 50);
        
        const notificationList = response.notifications || [];
        
        // Map backend data to frontend format
        const mappedNotifications: Notification[] = notificationList.map(notif => ({
          id: String(notif.id),
          type: mapNotificationType(notif.type?.toLowerCase() || 'info'),
          title: notif.title || t('dashboard.notifications.title'),
          message: notif.message || '',
          date: notif.createdAt || new Date().toISOString(),
          isRead: notif.isRead || false,
          priority: mapPriority(notif.type?.toLowerCase()),
          actionUrl: notif.actionUrl || '',
          actionText: getActionText(notif.type?.toLowerCase())
        }));
        
        setNotifications(mappedNotifications);
        
        // Calculate stats
        const unreadCount = mappedNotifications.filter(n => !n.isRead).length;
        setStats({
          total: mappedNotifications.length,
          unread: unreadCount,
          read: mappedNotifications.length - unreadCount
        });
        
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error(t('dashboard.notifications.toast.loadError'));
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  useEffect(() => {
    let filtered = [...notifications];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(notif => notif.type === filters.type);
    }

    // Status filter
    if (filters.status === 'read') {
      filtered = filtered.filter(notif => notif.isRead);
    } else if (filters.status === 'unread') {
      filtered = filtered.filter(notif => !notif.isRead);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(notif => notif.priority === filters.priority);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredNotifications(filtered);
  }, [notifications, filters]);

  // Helper functions
  const mapNotificationType = (type: string): Notification['type'] => {
    const typeMap: Record<string, Notification['type']> = {
      'booking': 'booking',
      'payment': 'payment',
      'tour_update': 'tour_update',
      'promotion': 'promotion',
      'system': 'system',
      'info': 'info',
      'warning': 'warning',
      'error': 'error',
      'success': 'success'
    };
    return typeMap[type] || 'info';
  };

  const mapPriority = (type: string): 'low' | 'medium' | 'high' => {
    if (['error', 'payment'].includes(type)) return 'high';
    if (['warning', 'booking', 'success'].includes(type)) return 'medium';
    return 'low';
  };

  const getActionText = (type: string): string => {
    const actionMap: Record<string, string> = {
      'booking': t('dashboard.notifications.actions.viewDetails'),
      'success': t('dashboard.notifications.actions.viewDetails'),
      'payment': t('dashboard.notifications.actions.viewDetails'),
      'tour_update': t('dashboard.notifications.actions.viewDetails'),
      'promotion': t('dashboard.notifications.actions.viewDetails'),
      'system': t('dashboard.notifications.actions.viewDetails')
    };
    return actionMap[type] || t('dashboard.notifications.actions.viewDetails');
  };

  const getNavigationUrl = (notification: Notification): string => {
    // Always generate URL based on notification type, ignore actionUrl
    switch (notification.type) {
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

  const getNotificationIcon = (type: Notification['type'], isRead: boolean) => {
    const iconClass = `w-6 h-6 ${isRead ? 'text-gray-400' : 'text-current'}`;
    
    switch (type) {
      case 'booking':
        return <TicketIcon className={iconClass} />;
      case 'payment':
        return <CreditCardIcon className={iconClass} />;
      case 'tour_update':
        return <CalendarDaysIcon className={iconClass} />;
      case 'promotion':
        return <GiftIcon className={iconClass} />;
      case 'system':
        return <CogIcon className={iconClass} />;
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

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'booking':
        return 'border-l-blue-500 bg-blue-50';
      case 'payment':
        return 'border-l-purple-500 bg-purple-50';
      case 'promotion':
        return 'border-l-pink-500 bg-pink-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: prev.unread - 1,
        read: prev.read + 1
      }));
      
      toast.success(t('dashboard.notifications.toast.markReadSuccess'));
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error(t('dashboard.notifications.toast.markReadError'));
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
      
      toast.success(t('dashboard.notifications.toast.markAllReadSuccess'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(t('dashboard.notifications.toast.markAllReadError'));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success(t('dashboard.notifications.toast.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t('dashboard.notifications.toast.deleteError'));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to appropriate page
    const url = getNavigationUrl(notification);
    console.log('🔍 Notification click debug:', {
      notificationType: notification.type,
      originalActionUrl: notification.actionUrl,
      generatedUrl: url,
      notificationId: notification.id
    });
    navigate(url);
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const selectAllNotifications = () => {
    setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  const deleteSelectedNotifications = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map(id => 
          notificationService.deleteNotification(id)
        )
      );
      
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.has(notif.id))
      );
      
      setSelectedNotifications(new Set());
      toast.success(t('dashboard.notifications.toast.deleteSelectedSuccess', { count: selectedNotifications.size }));
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error(t('dashboard.notifications.toast.deleteError'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('dashboard.notifications.time.justNow');
    if (diffInMinutes < 60) return t('dashboard.notifications.time.minutesAgo', { count: diffInMinutes });
    if (diffInMinutes < 1440) return t('dashboard.notifications.time.hoursAgo', { count: Math.floor(diffInMinutes / 60) });
    if (diffInMinutes < 10080) return t('dashboard.notifications.time.daysAgo', { count: Math.floor(diffInMinutes / 1440) });
    
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BellSolidIcon className="w-6 h-6 mr-2 text-blue-600" />
                {t('dashboard.notifications.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.notifications.subtitle')}
              </p>
            </div>
            
            {stats.unread > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{t('dashboard.notifications.markAllRead')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{t('dashboard.notifications.filters.label')}</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('dashboard.notifications.filters.type.all')}</option>
                <option value="booking">{t('dashboard.notifications.filters.type.booking')}</option>
                <option value="payment">{t('dashboard.notifications.filters.type.payment')}</option>
                <option value="tour_update">{t('dashboard.notifications.filters.type.tour_update')}</option>
                <option value="promotion">{t('dashboard.notifications.filters.type.promotion')}</option>
                <option value="system">{t('dashboard.notifications.filters.type.system')}</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('dashboard.notifications.filters.status.all')}</option>
                <option value="unread">{t('dashboard.notifications.filters.status.unread')}</option>
                <option value="read">{t('dashboard.notifications.filters.status.read')}</option>
              </select>
              
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('dashboard.notifications.filters.priority.all')}</option>
                <option value="high">{t('dashboard.notifications.filters.priority.high')}</option>
                <option value="medium">{t('dashboard.notifications.filters.priority.medium')}</option>
                <option value="low">{t('dashboard.notifications.filters.priority.low')}</option>
              </select>
            </div>
            
            {selectedNotifications.size > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-auto">
                <span className="text-sm text-gray-600">
                  {t('dashboard.notifications.filters.selected', { count: selectedNotifications.size })}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={deleteSelectedNotifications}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">{t('dashboard.notifications.filters.delete')}</span>
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    size="sm"
                  >
                    <span className="hidden sm:inline">{t('dashboard.notifications.filters.cancel')}</span>
                    <span className="sm:hidden">{t('dashboard.notifications.filters.cancelShort')}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bulk Actions */}
        {filteredNotifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    selectAllNotifications();
                  } else {
                    clearSelection();
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {t('dashboard.notifications.bulkActions.selectAll', { count: filteredNotifications.length })}
              </span>
            </div>
            
            <p className="text-sm text-gray-500">
              {t('dashboard.notifications.bulkActions.showing', { display: filteredNotifications.length, total: notifications.length })}
            </p>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('dashboard.notifications.empty.title')}
              </h3>
              <p className="text-gray-500">
                {notifications.length === 0 
                  ? t('dashboard.notifications.empty.noNotifications')
                  : t('dashboard.notifications.empty.noResults')
                }
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 md:p-6 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  getNotificationColor(notification.type, notification.priority)
                } ${
                  notification.isRead ? 'opacity-75' : 'shadow-sm'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3 md:space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectNotification(notification.id);
                    }}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.isRead)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </h3>
                        <p className={`mt-1 text-sm ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDate(notification.date)}</span>
                          <span className="capitalize">
                            {t('dashboard.notifications.priority.label')} {notification.priority === 'high' ? t('dashboard.notifications.priority.high') : 
                                   notification.priority === 'medium' ? t('dashboard.notifications.priority.medium') : t('dashboard.notifications.priority.low')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row items-center space-x-2 md:flex-col md:items-end md:space-x-0 md:space-y-2">
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex-1 md:flex-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            <ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{notification.actionText}</span>
                            <span className="sm:hidden">{t('dashboard.notifications.actions.view')}</span>
                          </Button>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs"
                            >
                              <EyeIcon className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">{t('dashboard.notifications.actions.markRead')}</span>
                              <span className="sm:hidden">{t('dashboard.notifications.actions.markReadShort')}</span>
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && filteredNotifications.length < notifications.length && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement load more functionality
                toast(t('dashboard.notifications.loadMoreToast'));
              }}
            >
              {t('dashboard.notifications.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;