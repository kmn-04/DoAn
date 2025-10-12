import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  CalendarDaysIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'tour_update' | 'promotion' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await notificationService.getNotifications(user.id, 0, 50);
        
        // Response structure: { notifications: [], total: number, unread: number }
        const notificationList = response.notifications || [];
        
        // Map backend data to frontend format
        const mappedNotifications: Notification[] = notificationList.map(notif => ({
          id: String(notif.id),
          type: (notif.type?.toLowerCase() || 'info') as 'booking' | 'payment' | 'tour_update' | 'promotion' | 'system',
          title: notif.title || 'Thông báo',
          message: notif.message || '',
          date: notif.createdAt || new Date().toISOString(),
          isRead: notif.isRead || false,
          priority: 'medium' as 'low' | 'medium' | 'high',
          actionUrl: notif.link || '',
          actionText: 'Xem chi tiết'
        }));
        
        setNotifications(mappedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Không thể tải thông báo. Vui lòng thử lại sau.');
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
  }, [filters, notifications]);

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
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(notif => !notif.isRead));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-6 w-6 ${
              priority === 'high' ? 'text-red-500' :
              priority === 'medium' ? '#D4AF37' : '#D4AF37'
    }`;

    switch (type) {
      case 'booking':
        return <TicketIcon className={iconClass} />;
      case 'payment':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'tour_update':
        return <InformationCircleIcon className={iconClass} />;
      case 'promotion':
        return <CheckCircleIcon className={iconClass} />;
      case 'system':
        return <BellIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      booking: 'Booking',
      payment: 'Thanh toán',
      tour_update: 'Cập nhật tour',
      promotion: 'Khuyến mãi',
      system: 'Hệ thống'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp'
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-10 bg-stone-200 rounded-none w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-stone-200 rounded-none"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <BellIcon className="h-8 w-8" style={{ color: '#D4AF37' }} />
              <h1 className="text-3xl font-normal text-slate-900 tracking-tight">Thông báo</h1>
              {unreadCount > 0 && (
                <span 
                  className="text-white text-xs font-bold px-3 py-1 rounded-none"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none font-medium tracking-wide"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllRead}
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-medium tracking-wide"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Xóa đã đọc
            </Button>
          </div>
          
          <p className="text-gray-600 mt-2 font-normal">
            Quản lý tất cả thông báo về booking, thanh toán và cập nhật tour
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-none p-6 mb-6 animate-fade-in-up opacity-0 delay-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium text-slate-900 flex items-center tracking-tight">
            <FunnelIcon className="h-5 w-5 mr-3" style={{ color: '#D4AF37' }} />
            Bộ lọc
          </h2>
          
          <div className="text-sm text-gray-600 font-normal">
            Hiển thị <span className="font-medium" style={{ color: '#D4AF37' }}>{filteredNotifications.length}</span> / {notifications.length} thông báo
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="border border-stone-300 rounded-none px-4 py-2 focus:ring-0 focus:border-slate-700 font-normal"
          >
            <option value="all">Tất cả loại</option>
            <option value="booking">Booking</option>
            <option value="payment">Thanh toán</option>
            <option value="tour_update">Cập nhật tour</option>
            <option value="promotion">Khuyến mãi</option>
            <option value="system">Hệ thống</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-stone-300 rounded-none px-4 py-2 focus:ring-0 focus:border-slate-700 font-normal"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="border border-stone-300 rounded-none px-4 py-2 focus:ring-0 focus:border-slate-700 font-normal"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification, index) => (
          <div 
            key={notification.id} 
            className={`bg-white border-2 rounded-none p-6 transition-all hover:shadow-lg animate-fade-in-up opacity-0 ${
              !notification.isRead ? 'border-amber-300 bg-amber-50' : 'border-stone-200 hover:border-slate-700'
            }`}
            style={{ animationDelay: `${(index + 2) * 100}ms` }}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className={`text-lg font-medium tracking-tight ${
                      !notification.isRead ? 'text-slate-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    
                    {!notification.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D4AF37' }}></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Only show priority badge for high/urgent notifications */}
                    {(notification.priority === 'high' || notification.priority === 'urgent') && (
                      <span className={`text-xs px-3 py-1 rounded-none font-medium border ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-orange-100 text-orange-800 border-orange-300'
                      }`}>
                        {getPriorityLabel(notification.priority)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed font-normal">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 font-normal">
                    <CalendarDaysIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                    <span>{formatDate(notification.date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: '#D4AF37' }}
                      >
                        {notification.actionText || 'Xem chi tiết'} →
                      </a>
                    )}

                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-slate-700 hover:text-slate-900 flex items-center space-x-1 font-medium"
                        title="Đánh dấu đã đọc"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Đã đọc</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                      title="Xóa thông báo"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="bg-white border border-stone-200 rounded-none p-16 text-center">
          <BellIcon className="mx-auto h-20 w-20 mb-6" style={{ color: '#D4AF37' }} />
          <h3 className="text-2xl font-normal text-slate-900 mb-3 tracking-tight">
            Không có thông báo nào
          </h3>
          <p className="text-gray-600 font-normal">
            {filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all'
              ? 'Thử thay đổi bộ lọc để xem thêm thông báo'
              : 'Bạn đã xem hết tất cả thông báo!'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
