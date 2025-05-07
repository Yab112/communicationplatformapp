import { z } from "zod"

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  image: z.string().optional(),
})

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export const UpdateNotificationsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  chatNotifications: z.boolean(),
  postNotifications: z.boolean(),
  resourceNotifications: z.boolean(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>
export type UpdateNotificationsInput = z.infer<typeof UpdateNotificationsSchema> 