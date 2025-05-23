"use client"

import { useState, useEffect } from "react"
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
  const { toast } = useToast()

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
        setNotifications([])
        setUnreadCount(0)
      } else if ("notifications" in result && Array.isArray(result.notifications)) {
        setNotifications(result.notifications)
        setUnreadCount(result.notifications.filter((n: Notification) => !n.isRead).length)
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch initial notifications and poll every 30 seconds
  useEffect(() => {
    fetchNotifications()
    
    // Set up polling interval
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId)
      if ("error" in result) {
        throw new Error(result.error)
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()
      if ("error" in result) {
        throw new Error(result.error)
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
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
