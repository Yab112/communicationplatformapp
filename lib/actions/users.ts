"use server"

import prisma from "@/lib/db"
import { getCurrentUser } from "./auth"

// Get all teachers
export async function getTeachers() {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        image: true,
        department: true,
        status: true,
      },
    })

    // Transform the data to match the frontend structure
    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      avatar: teacher.image || "/placeholder.svg?height=32&width=32",
      role: "Teacher" as const,
      department: teacher.department || "",
      status: teacher.status.toLowerCase() as "online" | "offline",
    }))
  } catch (error) {
    console.error("Error fetching teachers:", error)
    throw new Error("Failed to fetch teachers")
  }
}

// Get all students
export async function getStudents() {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        image: true,
        department: true,
        status: true,
      },
    })

    // Transform the data to match the frontend structure
    return students.map((student) => ({
      id: student.id,
      name: student.name,
      avatar: student.image || "/placeholder.svg?height=32&width=32",
      role: "Student" as const,
      department: student.department || "",
      status: student.status.toLowerCase() as "online" | "offline",
    }))
  } catch (error) {
    console.error("Error fetching students:", error)
    throw new Error("Failed to fetch students")
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view profiles" }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        department: true,
        year: true,
        bio: true,
        status: true,
        settings: {
          select: {
            profileVisibility: true,
          },
        },
      },
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Check privacy settings
    if (user.id !== currentUser.id && user.settings?.profileVisibility === "PRIVATE") {
      return { error: "This profile is private" }
    }

    if (
      user.id !== currentUser.id &&
      user.settings?.profileVisibility === "CONNECTIONS_ONLY"
      // In a real app, you would check if the users are connected
    ) {
      return { error: "This profile is only visible to connections" }
    }

    return {
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        avatar: user.image || "/placeholder.svg?height=96&width=96",
        role: user.role,
        department: user.department,
        year: user.year,
        bio: user.bio,
        status: user.status.toLowerCase(),
        email: user.id === currentUser.id ? user.email : undefined,
      },
    }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Get notifications
export async function getNotifications() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view notifications" }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })

    return {
      success: true,
      notifications,
    }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to update notifications" }
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
      data: {
        isRead: true,
      },
    })

    return { success: true }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}
