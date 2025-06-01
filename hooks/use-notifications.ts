"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notifications";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/providers/socket-provider";

type Notification = {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  relatedId?: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { socket } = useSocket();
  const isMounted = useRef(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    try {
      const result = await getNotifications();

      if (!isMounted.current) return;

      if ("error" in result) {
        setNotifications([]);
        setUnreadCount(0);
      } else if ("notifications" in result && Array.isArray(result.notifications)) {
        const parsed = result.notifications.map((n) => ({
          ...n,
          createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
          relatedId: n.relatedId || undefined,
        }));
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.isRead).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch {
      if (isMounted.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Handle real-time socket notification
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      if (!isMounted.current) return;

      setNotifications((prev) => [notification, ...prev]);

      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      toast({
        title: "New Notification",
        description: notification.content,
      });
    },
    [toast]
  );

  // Setup effect
  useEffect(() => {
    isMounted.current = true;

    fetchNotifications();

    if (socket) {
      socket.on("notification", handleNewNotification);
    }

    return () => {
      isMounted.current = false;
      if (socket) {
        socket.off("notification", handleNewNotification);
      }
    };
  }, [fetchNotifications, socket, handleNewNotification]);

  // Mark individual notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if ("error" in result) throw new Error(result.error);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await markAllNotificationsAsRead();
      if ("error" in result) throw new Error(result.error);

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
