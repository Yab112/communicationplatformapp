// in @/lib/validator/resource.ts

import { z } from "zod";

// This is your current, full schema. Leave it as is for the server.
export const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  type: z.string().nonempty("Please select a resource type."),
  department: z.string().nonempty("Please select a department."),
  fileType: z.string().nonempty("File type is required."),
  courseId: z.string().optional(),
  
  // Server-only fields
  url: z.string().url("A valid URL for the file is required."),
  fileSize: z.number().positive("File size must be a positive number."),
  tags: z.array(z.string()).min(1, "At least one tag is required."),
});
// ✅ SOLUTION: Create a new schema just for the form fields using .pick()
export const resourceFormSchema = resourceSchema.pick({
  title: true,
  description: true,
  type: true,
  department: true,
  courseId: true,
  fileType: true,
});

// We also need to infer the form values type from our new schema
export type ResourceFormValues = z.infer<typeof resourceFormSchema>;