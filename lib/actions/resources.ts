"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-session";
import { Prisma } from "@prisma/client";
import { getSocketServer } from "../socket-server";

// Get all folders for the current user
export async function getResourceFolders() {
  const user = await getCurrentUser();
  if (!user) return { folders: [], error: "Unauthorized" };

  try {
    const folders = await db.resourceFolder.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        resourceCount: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { folders, error: null };
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    return { folders: [], error: "Failed to fetch folders" };
  }
}

// Create a new folder for the current user
export async function createResourceFolder(name: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) return { folder: null, error: "Unauthorized" };

  try {
    if (!name || name.trim().length === 0) {
      return { folder: null, error: "Folder name is required" };
    }

    const folder = await db.resourceFolder.create({
      data: {
        name,
        description,
        authorId: user.id,
        resourceCount: 0,
      },
    });

    return { folder, error: null };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { folder: null, error: "Failed to create folder" };
  }
}

// Delete a folder (and remove associated ResourceFolderResource entries)
export async function deleteResourceFolder(folderId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await db.$transaction([
      // Remove all resource-folder relations
      db.resourceFolderResource.deleteMany({
        where: { folderId },
      }),
      // Delete the folder
      db.resourceFolder.delete({
        where: { id: folderId, authorId: user.id },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return { error: "Failed to delete folder" };
  }
}

// Add a resource to a folder
export async function addResourceToFolder(resourceId: string, folderId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Validate resource existence
    const resource = await db.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource) {
      return { error: "Resource not found" };
    }

    // Validate folder existence and ownership
    const folder = await db.resourceFolder.findUnique({
      where: { id: folderId, authorId: user.id },
    });
    if (!folder) {
      return { error: "Folder not found or not authorized" };
    }

    // Check for duplicate relation
    const existingRelation = await db.resourceFolderResource.findUnique({
      where: { resourceId_folderId: { resourceId, folderId } },
    });
    if (existingRelation) {
      return { error: "Resource is already in this folder" };
    }

    // Create relation and update folder in a transaction
    await db.$transaction([
      db.resourceFolderResource.create({
        data: { resourceId, folderId },
      }),
      db.resourceFolder.update({
        where: { id: folderId },
        data: {
          updatedAt: new Date(),
          resourceCount: { increment: 1 },
        },
      }),
    ]);

    // Emit Socket.IO notification
    const io = getSocketServer();
    io.to(`user:${user.id}`).emit("notification", {
      id: `folder-${folderId}`,
      type: "folder",
      content: `Resource "${resource.title}" added to folder ${folder.name}`,
      relatedId: folderId,
      createdAt: new Date().toISOString(),
      isRead: false,
      userId: user.id,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to add resource to folder:", error);
    return { error: "Failed to add resource to folder" };
  }
}

// Remove a resource from a folder
export async function removeResourceFromFolder(resourceId: string, folderId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Validate resource existence and ownership
    const resource = await db.resource.findUnique({
      where: { id: resourceId, authorId: user.id },
    });
    if (!resource) {
      return { error: "Resource not found or not authorized" };
    }

    // Validate folder existence and ownership
    const folder = await db.resourceFolder.findUnique({
      where: { id: folderId, authorId: user.id },
    });
    if (!folder) {
      return { error: "Folder not found or not authorized" };
    }

    // Remove relation and update folder in a transaction
    await db.$transaction([
      db.resourceFolderResource.delete({
        where: { resourceId_folderId: { resourceId, folderId } },
      }),
      db.resourceFolder.update({
        where: { id: folderId },
        data: {
          updatedAt: new Date(),
          resourceCount: { decrement: 1 },
        },
      }),
    ]);

    // Emit Socket.IO notification
    const io = getSocketServer();
    io.to(`user:${user.id}`).emit("notification", {
      id: `folder-${folderId}`,
      type: "folder",
      content: `Resource removed from folder ${folder.name}`,
      relatedId: folderId,
      createdAt: new Date().toISOString(),
      isRead: false,
      userId: user.id,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove resource from folder:", error);
    return { error: "Failed to remove resource from folder" };
  }
}

// Get resources with filters
export async function getResources(filters?: {
  teacherName?: string;
  department?: string;
  courseId?: string;
  fileType?: string;
  search?: string;
  folderId?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { resources: [], error: "Unauthorized" };

    const whereClause: Prisma.ResourceWhereInput = {
      ...(filters?.teacherName && {
        author: {
          name: { contains: filters.teacherName, mode: "insensitive" },
        },
      }),
      ...(filters?.department && { department: filters.department }),
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.fileType && { fileType: filters.fileType }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
      ...(filters?.folderId && {
        folders: { some: { folderId: filters.folderId } },
      }),
    };

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
        subject: true,
        uploadDate: true,
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        folders: {
          select: { folderId: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const transformedResources = resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url || "",
      fileSize: resource.fileSize?.toString() || "",
      department: resource.department || "",
      courseId: resource.courseId || "",
      fileType: resource.fileType || "",
      uploadDate: resource.uploadDate?.toISOString() || resource.createdAt.toISOString(),
      tags: resource.tags || [],
      subject: resource.subject || "",
      uploadedBy: {
        id: resource.author.id,
        name: resource.author.name,
        avatar: resource.author.image || "",
      },
      dueDate: null,
      folderIds: resource.folders.map((f) => f.folderId),
    }));

    return { resources: transformedResources, error: null };
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return { resources: [], error: "Failed to fetch resources" };
  }
}

// Get all courses
export async function getCourses() {
  try {
    const courses = await db.course.findMany({
      orderBy: { name: "asc" },
    });
    return { courses, error: null };
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return { courses: [], error: "Failed to fetch courses" };
  }
}

// Create a new resource
export async function createResource(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error("No authenticated user found");
      return { resource: null, error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const department = formData.get("department") as string;
    const fileType = formData.get("fileType") as string;
    const courseName = formData.get("courseId") as string;
    const tags = JSON.parse(formData.get("tags") as string) as string[];
    const url = formData.get("url") as string;
    const fileSize = parseInt(formData.get("fileSize") as string, 10);

    if (!title || !description || !type || !department || !fileType || !url) {
      console.error("Missing required fields:", {
        title,
        description,
        type,
        department,
        fileType,
        url,
      });
      return { resource: null, error: "All required fields must be filled" };
    }

    let courseId = null;
    if (courseName) {
      const existingCourse = await db.course.findFirst({
        where: { name: courseName },
      });

      if (existingCourse) {
        courseId = existingCourse.id;
      } else {
        const newCourse = await db.course.create({
          data: {
            name: courseName,
            description: `${courseName} course in ${department} department`,
          },
        });
        courseId = newCourse.id;
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
          select: { id: true, name: true, image: true },
        },
      },
    });

    const usersToNotify = await db.user.findMany({
      where: {
        id: { not: user.id },
        notificationSettings: { resourceNotifications: true },
      },
      select: { id: true },
    });

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
      subject: resource.subject || "",
      uploadedBy: {
        id: resource.author.id,
        name: resource.author.name,
        avatar: resource.author.image || "",
      },
      dueDate: null,
      folderIds: [], // New resource starts with no folders
    };

    return { resource: transformedResource, error: null };
  } catch (error) {
    console.error("Error creating resource:", error);
    return { resource: null, error: "Failed to create resource" };
  }
}

// Delete a resource
export async function deleteResource(resourceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const resource = await db.resource.findUnique({
      where: { id: resourceId },
      select: { authorId: true },
    });

    if (!resource) {
      return { error: "Resource not found" };
    }

    if (resource.authorId !== user.id && user.role !== "ADMIN") {
      return { error: "Not authorized to delete this resource" };
    }

    // Delete resource and its folder relations in a transaction
    await db.$transaction([
      db.resourceFolderResource.deleteMany({
        where: { resourceId },
      }),
      db.resource.delete({
        where: { id: resourceId },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { error: "Failed to delete resource" };
  }
}