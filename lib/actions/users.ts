"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"

export async function getUsers() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { users }
  } catch (error) {
    return { error: "Failed to fetch users" }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { error: "User not found" }
    }

    return { user }
  } catch (error) {
    return { error: "Failed to fetch user profile" }
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized" }
    }

    // Validate role
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      return { error: "Invalid role" }
    }

    await db.user.update({
      where: { id: userId },
      data: { role: role as "STUDENT" | "TEACHER" | "ADMIN" },
    })

    return { success: true }
  } catch (error) {
    return { error: "Failed to update user role" }
  }
}
