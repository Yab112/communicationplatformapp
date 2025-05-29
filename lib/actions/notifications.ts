"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"

export async function getNotifications() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to recent notifications
    })

    return { notifications }
  } catch {
    return { error: "Failed to fetch notifications" }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    })

    if (!notification) {
      return { error: "Notification not found" }
    }

    if (notification.userId !== user.id) {
      return { error: "Not authorized to update this notification" }
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    revalidatePath("/")
    return { success: true }
  } catch{
    return { error: "Failed to mark notification as read" }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    await db.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    revalidatePath("/")
    return { success: true }
  } catch  {
    return { error: "Failed to mark all notifications as read" }
  }
}

export async function createNotification({
  userId,
  type,
  message,
}: {
  userId: string
  type: string
  message: string
}) {
  try {
    await db.notification.create({
      data: {
        userId,
        type,
        content: message,
        isRead: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to create notification:", error)
    return { error: "Failed to create notification" }
  }
}
