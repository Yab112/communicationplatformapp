"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { resourceSchema, type ResourceFormValues } from "@/lib/validator/resource"

import type { Resource } from "@/types/resource"
import { prisma } from "../prisma"
import path from "path"
import fs from "fs"

export async function getResources(filters?: {
  teacherName?: string;
  department?: string;
  courseId?: string;
  fileType?: string;
  search?: string;
}) {
  try {
    const resources = await db.resource.findMany({
      where: {
        ...(filters?.teacherName && {
          author: {
            name: {
              contains: filters.teacherName,
              mode: 'insensitive',
            },
          },
        }),
        ...(filters?.department && {
          department: filters.department,
        }),
        ...(filters?.courseId && {
          courseId: filters.courseId,
        }),
        ...(filters?.fileType && {
          fileType: filters.fileType,
        }),
        ...(filters?.search && {
          OR: [
            {
              title: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
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
    });

    return { resources, error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { resources: [], error: `Failed to fetch resources: ${error.message}` };
    }
    return { resources: [], error: "Failed to fetch resources" };
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

export async function createResource(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.error("No authenticated user found")
      return { resource: null, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const department = formData.get("department") as string
    const fileType = formData.get("fileType") as string
    const courseName = formData.get("courseId") as string
    const tags = JSON.parse(formData.get("tags") as string) as string[]
    const url = formData.get("url") as string
    const fileSize = parseInt(formData.get("fileSize") as string, 10)

    // Validate required fields
    if (!title || !description || !type || !department || !fileType || !url) {
      console.error("Missing required fields:", { title, description, type, department, fileType, url })
      return { resource: null, error: "All required fields must be filled" }
    }

    let courseId = null
    if (courseName) {
      // Find or create the course
      const existingCourse = await db.course.findFirst({
        where: { name: courseName }
      })

      if (existingCourse) {
        courseId = existingCourse.id
      } else {
        const newCourse = await db.course.create({
          data: {
            name: courseName,
            description: `${courseName} course in ${department} department`
          }
        })
        courseId = newCourse.id
      }
    }

    console.log("Creating resource with data:", {
      title,
      type,
      department,
      fileType,
      courseId,
      fileSize,
      authorId: user.id,
      url
    })

    const resource = await db.resource.create({
      data: {
        title,
        description,
        type,
        department,
        fileType,
        courseId,
        tags,
        url,
        fileSize,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    console.log("Resource created successfully:", resource)

    const transformedResource: Resource = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url || "",
      fileSize: resource.fileSize?.toString() || "",
      department: resource.department || "",
      courseId: resource.courseId || "",
      fileType: resource.fileType || "",
      uploadDate: resource.createdAt.toISOString(),
      tags: resource.tags || [],
      uploadedBy: {
        id: resource.author.id,
        name: resource.author.name,
        avatar: resource.author.image || "",
      },
      dueDate: null,
    }

    revalidatePath("/resources")
    return { resource: transformedResource, error: null }
  } catch (error) {
    console.error("Error creating resource:", error)
    if (error instanceof Error) {
      return { resource: null, error: error.message }
    }
    return { resource: null, error: "Failed to create resource" }
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
