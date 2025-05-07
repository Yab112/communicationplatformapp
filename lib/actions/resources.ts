"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { resourceSchema, type ResourceFormValues } from "@/lib/validator/resource"

export async function getResources() {
  try {
    const resources = await db.resource.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { resources }
  } catch (error) {
    return { error: "Failed to fetch resources" }
  }
}

export async function getCourses() {
  try {
    const courses = await db.course.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return { courses }
  } catch (error) {
    return { error: "Failed to fetch courses" }
  }
}

export async function createResource(data: ResourceFormValues) {
  try {
    // Validate input
    const validatedData = resourceSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Create resource
    const resource = await db.resource.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        url: validatedData.url,
        fileSize: validatedData.fileSize,
        authorId: user.id,
        courseId: validatedData.courseId,
      },
    })

    // Revalidate resources page
    revalidatePath("/resources")

    return { success: true, resource }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create resource" }
  }
}

export async function deleteResource(resourceId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const resource = await db.resource.findUnique({
      where: { id: resourceId },
      select: { authorId: true },
    })

    if (!resource) {
      return { error: "Resource not found" }
    }

    if (resource.authorId !== user.id && user.role !== "ADMIN") {
      return { error: "Not authorized to delete this resource" }
    }

    // Delete the resource
    await db.resource.delete({ where: { id: resourceId } })

    revalidatePath("/resources")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete resource" }
  }
}
