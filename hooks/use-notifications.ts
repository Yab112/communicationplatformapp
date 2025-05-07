"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/components/providers/socket-provider"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notifications"
import { useToast } from "@/hooks/use-toast"

type Notification = {
  id: string
  type: string
  content: string
  isRead: boolean
  createdAt: string
  userId: string
  relatedId?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const result = await getNotifications()

        if ("error" in result) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setNotifications(result as Notification[])
          setUnreadCount(result.filter((n: Notification) => !n.isRead).length)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  // Listen for new notifications
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show toast for new notification
        toast({
          title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
          description: notification.content,
        })
      }

      socket.on("notification", handleNewNotification)

      return () => {
        socket.off("notification", handleNewNotification)
      }
    }
  }, [socket, isConnected, toast])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId)

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}
