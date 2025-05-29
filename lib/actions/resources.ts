"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { Prisma } from "@prisma/client"
import { getSocketServer } from "../socket-server";

export async function getResources(filters?: {
  teacherName?: string;
  department?: string;
  courseId?: string;
  fileType?: string;
  search?: string;
}) {
  try {
    // Only include filters that have values
    const whereClause: Prisma.ResourceWhereInput = {
      ...(filters?.teacherName && {
        author: {
          name: {
            contains: filters.teacherName,
            mode: 'insensitive' as Prisma.QueryMode,
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
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            description: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      }),
    };

    // Optimize query by only including necessary fields
    const resources = await db.resource.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        url: true,
        fileSize: true,
        department: true,
        courseId: true,
        fileType: true,
        createdAt: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results to prevent large payloads
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
  } catch {
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

    
    // Fetch all users to notify (excluding the creator)
    const usersToNotify = await db.user.findMany({
      where: {
        id: { not: user.id },
        notificationSettings: { resourceNotifications: true },
      },
      select: { id: true },
    });

    // Create notifications in a transaction
    const notificationData = usersToNotify.map((u) => ({
      userId: u.id,
      type: "resource",
      content: `${user.name} (${user.role}) uploaded a new resource: ${title}`,
      relatedId: resource.id,
      isRead: false,
    }));

    await db.$transaction(
      notificationData.map((data) => db.notification.create({ data }))
    );

    // Emit Socket.IO events
    const io = getSocketServer();
    usersToNotify.forEach((u) => {
      io.to(`user:${u.id}`).emit("notification", {
        id: resource.id,
        type: "resource",
        content: `${user.name} (${user.role}) uploaded a new resource: ${title}`,
        relatedId: resource.id,
        createdAt: new Date().toISOString(),
        isRead: false,
        userId: u.id,
      });
    });

    const transformedResource = {
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

    // No need to revalidate since we're using client-side state management
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

    // No need to revalidate since we're using client-side state management
    return { success: true }
  } catch {
    return { error: "Failed to delete resource" }
  }
}
