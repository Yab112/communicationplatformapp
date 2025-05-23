import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().min(1, "Please select a department"),
  year: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})


export const emailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })