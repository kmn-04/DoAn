import { apiClient } from './api';

// Types
export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'tour_update' | 'promotion' | 'system' | 'wishlist';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  userId: number;
}

export interface NotificationPreferences {
  email: {
    bookingConfirmation: boolean;
    paymentReminder: boolean;
    tourUpdates: boolean;
    promotions: boolean;
    systemNotifications: boolean;
  };
  push: {
    bookingUpdates: boolean;
    paymentReminder: boolean;
    tourReminder: boolean;
    promotions: boolean;
  };
  sms: {
    bookingConfirmation: boolean;
    paymentReminder: boolean;
    emergencyUpdates: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private listeners: Set<(notification: Notification) => void> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private isConnected = false;

  // Get user notifications with pagination
  async getNotifications(
    userId: number,
    page: number = 0,
    size: number = 20,
    unreadOnly: boolean = false
  ): Promise<{
    notifications: Notification[];
    total: number;
    unread: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        unreadOnly: unreadOnly.toString()
      });

      const response = await apiClient.get<any>(`/notifications/user/${userId}?${params}`);

      // Safe access to response data
      const data = response.data?.data || response.data;
      const backendNotifications = data?.notifications || data?.content || [];
      
      // Map backend data to frontend Notification type
      const mappedNotifications: Notification[] = backendNotifications.map((notif: any) => ({
        id: String(notif.id),
        type: (notif.type?.toLowerCase() || 'system') as any,
        title: notif.title || '',
        message: notif.message || '',
        isRead: notif.isRead || false,
        priority: 'medium' as any,
        createdAt: notif.createdAt || new Date().toISOString(),
        actionUrl: notif.link || '', // Map 'link' từ backend sang 'actionUrl'
        actionText: 'Xem chi tiết',
        userId: userId
      }));
      
      return {
        notifications: mappedNotifications,
        total: data?.total || data?.totalElements || 0,
        unread: data?.unread || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Return mock notifications on error
      return {
        notifications: this.getMockNotifications(userId),
        total: 5,
        unread: 2
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      console.log('✅ Marked notification as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', notificationId, error);
      throw error; // Re-throw to show error in UI
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await apiClient.put(`/notifications/user/${userId}/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      console.log('✅ Deleted notification:', notificationId);
    } catch (error) {
      console.error('❌ Error deleting notification:', notificationId, error);
      throw error; // Re-throw to show error in UI
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: number): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<NotificationStats>(`/notifications/user/${userId}/stats`);
      return response.data.data!;
    } catch (error) {
      return {
        total: 5,
        unread: 2,
        byType: { booking: 2, promotion: 2, system: 1 },
        byPriority: { high: 2, medium: 2, low: 1 }
      };
    }
  }

  // Real-time connection management
  connectRealtime(userId: number): void {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      // Use Server-Sent Events for real-time notifications
      this.eventSource = new EventSource(`http://localhost:8080/api/notifications/stream/${userId}`);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.notifyConnectionListeners(true);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          // Show browser notification
          this.showBrowserNotification(notification);
          
          // Show toast notification
          this.showToastNotification(notification);
          
          // Notify listeners
          this.listeners.forEach(listener => listener(notification));
          
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Real-time notifications error:', error);
        this.isConnected = false;
        this.notifyConnectionListeners(false);
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectRealtime(userId);
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
    }
  }

  // Disconnect real-time
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    }
  }

  // Add notification listener
  addListener(listener: (notification: Notification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Add connection status listener
  addConnectionListener(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  // Get connection status
  isConnectedToRealtime(): boolean {
    return this.isConnected;
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto close after 5 seconds (except urgent)
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }

  // Show toast notification
  private showToastNotification(notification: Notification): void {
    const toastType = this.getToastType(notification.type, notification.priority);
    
    const event = new CustomEvent('show-toast', {
      detail: {
        type: toastType,
        title: notification.title,
        message: notification.message,
        duration: notification.priority === 'urgent' ? 0 : undefined, // Don't auto-hide urgent
        action: notification.actionUrl ? {
          text: notification.actionText || 'Xem chi tiết',
          url: notification.actionUrl
        } : undefined
      }
    });
    
    window.dispatchEvent(event);
  }

  // Get toast type based on notification
  private getToastType(type: string, priority: string): 'success' | 'error' | 'warning' | 'info' {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    if (type === 'booking' || type === 'payment') return 'success';
    return 'info';
  }

  // Notify connection listeners
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  // Mock notifications for fallback
  private getMockNotifications(userId: number): Notification[] {
    return [
      {
        id: 'notif_001',
        type: 'booking',
        title: 'Xác nhận đặt tour thành công',
        message: 'Tour "Hạ Long Bay - Kỳ Quan Thế Giới" đã được xác nhận. Mã booking: BK1234567',
        isRead: false,
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        actionUrl: '/bookings/BK1234567',
        actionText: 'Xem chi tiết',
        userId
      },
      {
        id: 'notif_002',
        type: 'payment',
        title: 'Nhắc nhở thanh toán',
        message: 'Bạn có 1 booking chưa thanh toán. Vui lòng hoàn tất trong 24h.',
        isRead: false,
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionUrl: '/bookings?status=pending',
        actionText: 'Thanh toán ngay',
        userId
      },
      {
        id: 'notif_003',
        type: 'promotion',
        title: 'Ưu đãi đặc biệt cho bạn!',
        message: 'Giảm giá 20% cho tất cả tour Sapa trong tháng này. Chỉ còn 3 ngày!',
        isRead: true,
        priority: 'medium',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actionUrl: '/tours?category=mountain&promotion=sapa20',
        actionText: 'Xem tours',
        userId
      }
    ];
  }

  // Create test notification (for development)
  async createTestNotification(userId: number, type: string = 'system'): Promise<void> {
    try {
      await apiClient.post(`/notifications/test`, {
        userId,
        type,
        title: 'Test Notification',
        message: 'This is a test notification from the system.',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  }
}

export default new NotificationService();
