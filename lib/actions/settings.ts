"use server"

import { z } from "zod"
import prisma from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"
import { hash, compare } from "bcrypt"

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
  year: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newsletter: z.boolean(),
  securityAlerts: z.boolean(),
})

const privacySchema = z.object({
  profileVisibility: z.enum(["PUBLIC", "PRIVATE", "CONNECTIONS_ONLY"]),
  dataCollection: z.boolean(),
  personalizedAds: z.boolean(),
  searchVisibility: z.boolean(),
})

// Get user settings
export async function getUserSettings() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view settings" }
    }

    const settings = await prisma.userSettings.findUnique({
      where: {
        userId: currentUser.id,
      },
    })

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.userSettings.create({
        data: {
          user: {
            connect: { id: currentUser.id },
          },
        },
      })

      return {
        success: true,
        settings: defaultSettings,
      }
    }

    return {
      success: true,
      settings,
    }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Update profile
export async function updateProfile(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to update your profile" }
    }

    const parsed = profileSchema.parse({
      name: formData.get("name"),
      department: formData.get("department"),
      year: formData.get("year"),
      bio: formData.get("bio"),
    })

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: parsed.name,
        department: parsed.department,
        year: parsed.year,
        bio: parsed.bio,
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        department: updatedUser.department,
        year: updatedUser.year,
        bio: updatedUser.bio,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Update email
export async function updateEmail(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to update your email" }
    }

    const parsed = emailSchema.parse({
      email: formData.get("email"),
    })

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsed.email,
      },
    })

    if (existingUser && existingUser.id !== currentUser.id) {
      return { error: "Email is already in use" }
    }

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        email: parsed.email,
        emailVerified: null, // Reset email verification
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "Email updated. Verification required.",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Update password
export async function updatePassword(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to update your password" }
    }

    const parsed = passwordSchema.parse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    })

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user || !user.password) {
      return { error: "User not found" }
    }

    // Verify current password
    const passwordMatch = await compare(parsed.currentPassword, user.password)

    if (!passwordMatch) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await hash(parsed.newPassword, 10)

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Update notification settings
export async function updateNotificationSettings(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to update notification settings" }
    }

    const parsed = notificationSchema.parse({
      emailNotifications: formData.get("emailNotifications") === "true",
      pushNotifications: formData.get("pushNotifications") === "true",
      newsletter: formData.get("newsletter") === "true",
      securityAlerts: formData.get("securityAlerts") === "true",
    })

    await prisma.userSettings.upsert({
      where: {
        userId: currentUser.id,
      },
      update: {
        emailNotifications: parsed.emailNotifications,
        pushNotifications: parsed.pushNotifications,
        newsletter: parsed.newsletter,
        securityAlerts: parsed.securityAlerts,
      },
      create: {
        emailNotifications: parsed.emailNotifications,
        pushNotifications: parsed.pushNotifications,
        newsletter: parsed.newsletter,
        securityAlerts: parsed.securityAlerts,
        user: {
          connect: { id: currentUser.id },
        },
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "Notification settings updated",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Update privacy settings
export async function updatePrivacySettings(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to update privacy settings" }
    }

    const parsed = privacySchema.parse({
      profileVisibility: formData.get("profileVisibility") as "PUBLIC" | "PRIVATE" | "CONNECTIONS_ONLY",
      dataCollection: formData.get("dataCollection") === "true",
      personalizedAds: formData.get("personalizedAds") === "true",
      searchVisibility: formData.get("searchVisibility") === "true",
    })

    await prisma.userSettings.upsert({
      where: {
        userId: currentUser.id,
      },
      update: {
        profileVisibility: parsed.profileVisibility,
        dataCollection: parsed.dataCollection,
        personalizedAds: parsed.personalizedAds,
        searchVisibility: parsed.searchVisibility,
      },
      create: {
        profileVisibility: parsed.profileVisibility,
        dataCollection: parsed.dataCollection,
        personalizedAds: parsed.personalizedAds,
        searchVisibility: parsed.searchVisibility,
        user: {
          connect: { id: currentUser.id },
        },
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "Privacy settings updated",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}
