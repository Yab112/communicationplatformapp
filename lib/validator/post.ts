import { z } from "zod"

const postMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string(),
  poster: z.string().nullable().optional(),
  order: z.number(),
})

export const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(10000, "Post content is too long"),
  department: z.string().min(1, "Department is required"),
  media: z.array(postMediaSchema).optional(),
})

export type PostFormValues = z.infer<typeof postSchema>
export type PostMediaFormValues = z.infer<typeof postMediaSchema>

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

export type CommentFormValues = z.infer<typeof commentSchema>
