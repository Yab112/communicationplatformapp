"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { resourceSchema, type ResourceFormValues } from "@/lib/validator/resource"

import type { Resource } from "@/types/resource"
import { prisma } from "../prisma"

export async function getResources(filters?: {
  teacherName?: string;
  department?: string;
  courseId?: string;
  fileType?: string;
  search?: string;
}) {
  try {
    console.log("Fetching resources with filters:", filters);
    
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

    console.log(`Found ${resources.length} resources`);
    
    if (resources.length === 0) {
      console.log("No resources found in database");
    } else {
      console.log("First resource:", resources[0]);
    }

    return { resources, error: null };
  } catch (error) {
    console.error("Error fetching resources:", error);
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
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided")
      return { resource: null, error: "File is required" }
    }

    // Validate required fields
    if (!title || !description || !type || !department || !fileType) {
      console.error("Missing required fields:", { title, description, type, department, fileType })
      return { resource: null, error: "All required fields must be filled" }
    }

    // Create a unique filename using a stable format
    const filename = `${user.id}-${file.name}`
    const fileUrl = `/uploads/${filename}`

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
      fileSize: file.size,
      authorId: user.id
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
        url: fileUrl,
        fileSize: file.size,
        authorId: user.id,
        uploadDate: new Date(),
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
