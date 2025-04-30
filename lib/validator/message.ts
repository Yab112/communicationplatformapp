import { z } from "zod"

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message is too long (maximum 1000 characters)"),
})

export type MessageFormValues = z.infer<typeof messageSchema>
