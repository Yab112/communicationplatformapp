import { z } from "zod";

export const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  chatMessages: z.boolean(),
  resourceUpdates: z.boolean(),
  announcements: z.boolean(),
  groupMentions: z.boolean(),
  directMessages: z.boolean(),
})