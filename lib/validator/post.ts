import { z } from "zod"

export const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(1000, "Post content is too long"),
  department: z.string().min(1, "Department is required"),
  image: z.string().optional(),
})

export type PostFormValues = z.infer<typeof postSchema>

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

export type CommentFormValues = z.infer<typeof commentSchema>
