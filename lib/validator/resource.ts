import { z } from "zod"

export const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  type: z.string().min(1, "Type is required"),
  url: z.string().optional(),
  fileSize: z.number().optional(),
  courseId: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  fileType: z.string().min(1, "File type is required"),
  fileUpload: z.any().optional(),
  uploadDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
})

export type ResourceFormValues = z.infer<typeof resourceSchema>
