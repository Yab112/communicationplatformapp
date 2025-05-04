"use server"

import { z } from "zod"
import prisma from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"

// Validation schemas
const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  subject: z.string().min(1, "Subject is required"),
  fileType: z.string().min(1, "File type is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  fileSize: z.string(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["ASSIGNMENT", "QUIZ", "MATERIAL"]).default("MATERIAL"),
  dueDate: z.string().optional().nullable(),
})

// Get all resources with filtering
export async function getResources(options?: {
  subject?: string
  year?: string
  fileType?: string
  type?: "ASSIGNMENT" | "QUIZ" | "MATERIAL"
  dateRange?: {
    from?: Date
    to?: Date
  }
  search?: string
  sortBy?: "newest" | "oldest" | "a-z"
}) {
  try {
    const { subject, year, fileType, type, dateRange, search, sortBy = "newest" } = options || {}

    // Build the where clause
    const where: any = {}

    if (subject) {
      where.subject = subject
    }

    if (fileType) {
      where.fileType = fileType
    }

    if (type) {
      where.type = type
    }

    if (dateRange) {
      where.uploadDate = {}
      if (dateRange.from) {
        where.uploadDate.gte = dateRange.from
      }
      if (dateRange.to) {
        where.uploadDate.lte = dateRange.to
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (year) {
      where.tags = {
        has: year,
      }
    }

    // Determine the order by clause
    let orderBy: any = {}
    if (sortBy === "newest") {
      orderBy = { uploadDate: "desc" }
    } else if (sortBy === "oldest") {
      orderBy = { uploadDate: "asc" }
    } else if (sortBy === "a-z") {
      orderBy = { title: "asc" }
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Transform the data to match the frontend structure
    return resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      subject: resource.subject,
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      uploadDate: resource.uploadDate.toISOString(),
      tags: resource.tags,
      type: resource.type,
      dueDate: resource.dueDate?.toISOString(),
      uploadedBy: {
        id: resource.uploader.id,
        name: resource.uploader.name,
        avatar: resource.uploader.image || "/placeholder.svg?height=40&width=40",
      },
    }))
  } catch (error) {
    console.error("Error fetching resources:", error)
    throw new Error("Failed to fetch resources")
  }
}

// Create a new resource
export async function createResource(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to upload a resource" }
    }

    // Check if user is a teacher or admin
    if (currentUser.role !== "TEACHER" && currentUser.role !== "ADMIN") {
      return { error: "Only teachers and administrators can upload resources" }
    }

    const tagsString = formData.get("tags") as string
    const tags = tagsString ? JSON.parse(tagsString) : []

    const parsed = resourceSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      subject: formData.get("subject"),
      fileType: formData.get("fileType"),
      fileUrl: formData.get("fileUrl"),
      fileSize: formData.get("fileSize") || "0 KB",
      tags,
      type: formData.get("type") || "MATERIAL",
      dueDate: formData.get("dueDate"),
    })

    const resource = await prisma.resource.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        subject: parsed.subject,
        fileType: parsed.fileType,
        fileUrl: parsed.fileUrl,
        fileSize: parsed.fileSize,
        tags: parsed.tags || [],
        type: parsed.type,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        uploader: {
          connect: { id: currentUser.id },
        },
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notifications for students in the subject
    if (parsed.type === "ASSIGNMENT" || parsed.type === "QUIZ") {
      const students = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          department: parsed.subject,
        },
        select: { id: true },
      })

      // Batch create notifications
      await prisma.notification.createMany({
        data: students.map((student) => ({
          type: parsed.type === "ASSIGNMENT" ? "ASSIGNMENT" : "QUIZ",
          title: `New ${parsed.type.toLowerCase()}`,
          message: `A new ${parsed.type.toLowerCase()} "${parsed.title}" has been posted`,
          userId: student.id,
        })),
      })
    }

    revalidatePath("/resources")

    return {
      success: true,
      resource: {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        subject: resource.subject,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        uploadDate: resource.uploadDate.toISOString(),
        tags: resource.tags,
        type: resource.type,
        dueDate: resource.dueDate?.toISOString(),
        uploadedBy: {
          id: resource.uploader.id,
          name: resource.uploader.name,
          avatar: resource.uploader.image || "/placeholder.svg?height=40&width=40",
        },
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Delete a resource
export async function deleteResource(resourceId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to delete a resource" }
    }

    // Check if the user is the uploader of the resource or an admin
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { uploaderId: true },
    })

    if (!resource) {
      return { error: "Resource not found" }
    }

    if (resource.uploaderId !== currentUser.id && currentUser.role !== "ADMIN") {
      return { error: "You do not have permission to delete this resource" }
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    })

    revalidatePath("/resources")

    return { success: true }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}
