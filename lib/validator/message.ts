import { z } from "zod"

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message is too long (maximum 1000 characters)"),
  chatRoomId: z.string(),
  attachments: z.array(z.object({
    url: z.string(),
    type: z.string(),
    name: z.string(),
    size: z.number()
  })).optional()
})

export type MessageFormValues = z.infer<typeof messageSchema>
