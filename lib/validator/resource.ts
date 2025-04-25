import { z } from "zod"

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  fileType: z.string().min(1, "File type is required"),
  fileUpload: z.any().optional(),
})

export type ResourceFormValues = z.infer<typeof resourceSchema>
