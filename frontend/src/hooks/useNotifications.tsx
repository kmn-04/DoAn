import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import notificationService from '../services/notificationService';
import type { Notification, NotificationStats } from '../services/notificationService';

interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  isLoading: boolean;
  isConnected: boolean;
  unreadCount: number;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Real-time
  connect: () => void;
  disconnect: () => void;
  
  // Pagination
  hasMore: boolean;
  isLoadingMore: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const pageSize = 20;

  // Load notifications
  const loadNotifications = useCallback(async (page: number = 0, append: boolean = false) => {
    if (!user?.id) return;

    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const result = await notificationService.getNotifications(user.id, page, pageSize);
      
      // Safe check for result and notifications array
      const notifications = result?.notifications || [];
      const total = result?.total || 0;
      const unread = result?.unread || 0;
      
      if (append) {
        setNotifications(prev => [...prev, ...notifications]);
      } else {
        setNotifications(notifications);
      }
      
      setStats({
        total,
        unread,
        byType: {},
        byPriority: {}
      });

      // Update hasMore based on loaded count
      setHasMore(notifications.length === pageSize);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      
      // Set empty state on error
      if (!append) {
        setNotifications([]);
        setStats({
          total: 0,
          unread: 0,
          byType: {},
          byPriority: {}
        });
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user?.id, pageSize]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const statsData = await notificationService.getNotificationStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  }, [user?.id]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      // Update stats
      setStats(prev => ({ ...prev, unread: 0 }));
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: deletedNotification && !deletedNotification.isRead 
          ? Math.max(0, prev.unread - 1) 
          : prev.unread
      }));
      
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    setCurrentPage(0);
    await Promise.all([
      loadNotifications(0, false),
      loadStats()
    ]);
  }, [loadNotifications, loadStats]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadNotifications(nextPage, true);
  }, [currentPage, hasMore, isLoadingMore, loadNotifications]);

  // Connect to real-time
  const connect = useCallback(() => {
    if (!user?.id) return;

    notificationService.connectRealtime(user.id);
    
    // Listen for connection status
    const unsubscribeConnection = notificationService.addConnectionListener(setIsConnected);
    
    // Listen for new notifications
    const unsubscribeNotifications = notificationService.addListener((notification) => {
      // Add new notification to the beginning
      setNotifications(prev => [notification, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1
      }));
    });

    return () => {
      unsubscribeConnection();
      unsubscribeNotifications();
    };
  }, [user?.id]);

  // Disconnect from real-time
  const disconnect = useCallback(() => {
    notificationService.disconnect();
    setIsConnected(false);
  }, []);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refresh();
    }
  }, [user?.id, refresh]);

  // Auto-connect to real-time on mount
  useEffect(() => {
    if (user?.id) {
      const cleanup = connect();
      return cleanup;
    }
  }, [user?.id, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    notifications,
    stats,
    isLoading,
    isConnected,
    unreadCount: stats.unread,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadMore,
    
    // Real-time
    connect,
    disconnect,
    
    // Pagination
    hasMore,
    isLoadingMore
  };
};
