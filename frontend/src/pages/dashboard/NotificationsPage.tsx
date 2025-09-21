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

const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'booking',
    title: 'Xác nhận đặt tour thành công',
    message: 'Tour "Hạ Long Bay - Kỳ Quan Thế Giới" đã được xác nhận. Mã booking: BK1234567',
    date: '2024-01-25T10:30:00Z',
    isRead: false,
    priority: 'high',
    actionUrl: '/booking/confirmation/BK1234567',
    actionText: 'Xem chi tiết'
  },
  {
    id: 'notif_002',
    type: 'payment',
    title: 'Nhắc nhở thanh toán',
    message: 'Bạn có 1 booking chưa thanh toán. Vui lòng hoàn tất trong 24h để đảm bảo chỗ.',
    date: '2024-01-24T14:15:00Z',
    isRead: false,
    priority: 'high',
    actionUrl: '/dashboard/bookings?status=pending',
    actionText: 'Thanh toán ngay'
  },
  {
    id: 'notif_003',
    type: 'tour_update',
    title: 'Cập nhật lịch trình tour',
    message: 'Tour "Sapa - Thiên Đường Mây Trắng" có thay đổi nhỏ về giờ khởi hành. Vui lòng kiểm tra.',
    date: '2024-01-23T09:20:00Z',
    isRead: true,
    priority: 'medium',
    actionUrl: '/tours/sapa-thien-duong-may-trang',
    actionText: 'Xem thay đổi'
  },
  {
    id: 'notif_004',
    type: 'promotion',
    title: 'Ưu đãi đặc biệt cho bạn!',
    message: 'Giảm 20% cho tất cả tour biển trong tháng 2. Áp dụng mã: BEACH20',
    date: '2024-01-22T16:45:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/tours?category=beach',
    actionText: 'Xem tours'
  },
  {
    id: 'notif_005',
    type: 'booking',
    title: 'Tour sắp khởi hành',
    message: 'Tour "Phú Quốc - Đảo Ngọc Xanh" của bạn sẽ khởi hành trong 3 ngày. Hãy chuẩn bị hành lý!',
    date: '2024-01-21T08:00:00Z',
    isRead: true,
    priority: 'medium',
    actionUrl: '/dashboard/bookings',
    actionText: 'Xem booking'
  },
  {
    id: 'notif_006',
    type: 'system',
    title: 'Cập nhật điều khoản sử dụng',
    message: 'Chúng tôi đã cập nhật điều khoản sử dụng. Vui lòng xem lại để biết thêm chi tiết.',
    date: '2024-01-20T12:30:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/terms',
    actionText: 'Xem điều khoản'
  }
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    // Simulate API call
    const fetchNotifications = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setNotifications(mockNotifications);
        setIsLoading(false);
      }, 1000);
    };

    fetchNotifications();
  }, []);

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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(notif => !notif.isRead));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-6 w-6 ${
      priority === 'high' ? 'text-red-500' :
      priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllRead}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Xóa đã đọc
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Quản lý tất cả thông báo về booking, thanh toán và cập nhật tour
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bộ lọc
          </h2>
          
          <div className="text-sm text-gray-600">
            Hiển thị {filteredNotifications.length} / {notifications.length} thông báo
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`p-6 transition-all hover:shadow-md ${
              !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className={`text-lg font-semibold ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getPriorityLabel(notification.priority)}
                    </span>
                    
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3 leading-relaxed">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>{formatDate(notification.date)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {notification.actionText || 'Xem chi tiết'}
                      </a>
                    )}

                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-gray-600 hover:text-blue-600 flex items-center space-x-1"
                        title="Đánh dấu đã đọc"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Đánh dấu đã đọc</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-sm text-gray-600 hover:text-red-600 flex items-center space-x-1"
                      title="Xóa thông báo"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <Card className="p-12 text-center">
          <BellIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không có thông báo nào
          </h3>
          <p className="text-gray-600">
            {filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all'
              ? 'Thử thay đổi bộ lọc để xem thêm thông báo'
              : 'Bạn đã xem hết tất cả thông báo!'
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
