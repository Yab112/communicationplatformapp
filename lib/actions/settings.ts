"use server"

import { revalidatePath } from "next/cache"
import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import {
  UpdateProfileSchema,
  type UpdateProfileInput,
  UpdatePasswordSchema,
  type UpdatePasswordInput,
  UpdateNotificationsSchema,
  type UpdateNotificationsInput,
} from "@/lib/validator/settings"

export async function updateProfile(data: UpdateProfileInput) {
  try {
    // Validate input
    const validatedData = UpdateProfileSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Update profile
    await db.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        ...(validatedData.image && { image: validatedData.image }),
      },
    })

    // Revalidate settings page
    revalidatePath("/settings")

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to update profile" }
  }
}

export async function updatePassword(data: UpdatePasswordInput) {
  try {
    // Validate input
    const validatedData = UpdatePasswordSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Hash new password
    const hashedPassword = await hash(validatedData.newPassword, 10)

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to update password" }
  }
}

export async function updateNotificationSettings(data: UpdateNotificationsInput) {
  try {
    // Validate input
    const validatedData = UpdateNotificationsSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get or create notification settings
    const existingSettings = await db.notificationSettings.findUnique({
      where: { userId: user.id },
    })

    if (existingSettings) {
      // Update existing settings
      await db.notificationSettings.update({
        where: { userId: user.id },
        data: {
          emailNotifications: validatedData.emailNotifications,
          pushNotifications: validatedData.pushNotifications,
          chatNotifications: validatedData.chatNotifications,
          postNotifications: validatedData.postNotifications,
          resourceNotifications: validatedData.resourceNotifications,
        },
      })
    } else {
      // Create new settings
      await db.notificationSettings.create({
        data: {
          userId: user.id,
          emailNotifications: validatedData.emailNotifications,
          pushNotifications: validatedData.pushNotifications,
          chatNotifications: validatedData.chatNotifications,
          postNotifications: validatedData.postNotifications,
          resourceNotifications: validatedData.resourceNotifications,
        },
      })
    }

    // Revalidate settings page
    revalidatePath("/settings")

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to update notification settings" }
  }
}

export async function getNotificationSettings() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const settings = await db.notificationSettings.findUnique({
      where: { userId: user.id },
    })

    // Return default settings if none exist
    if (!settings) {
      return {
        settings: {
          emailNotifications: true,
          pushNotifications: true,
          chatNotifications: true,
          postNotifications: true,
          resourceNotifications: true,
        },
      }
    }

    return { settings }
  } catch  {
    return { error: "Failed to fetch notification settings" }
  }
}
