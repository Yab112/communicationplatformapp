"use server"

import { z } from "zod"
import prisma from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"

// Validation schemas
const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(1000, "Post content is too long"),
  department: z.string().min(1, "Department is required"),
  image: z.string().optional().nullable(),
})

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
  postId: z.string().min(1, "Post ID is required"),
})

// Get all posts with filtering and sorting
export async function getPosts(options?: {
  department?: string
  sortOrder?: "newest" | "oldest"
}) {
  try {
    const { department, sortOrder = "newest" } = options || {}

    const where = department ? { department } : {}

    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdAt: sortOrder === "newest" ? "desc" : "asc",
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
        comments: {
          include: {
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
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    // Transform the data to match the frontend structure
    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      department: post.department || "",
      author: {
        id: post.author.id,
        name: post.author.name,
        avatar: post.author.image || "/placeholder.svg?height=40&width=40",
        role: post.author.role,
      },
      createdAt: post.createdAt.toISOString(),
      image: post.image,
      likes: post._count.likes,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          avatar: comment.author.image || "/placeholder.svg?height=32&width=32",
          role: comment.author.role,
        },
        createdAt: comment.createdAt.toISOString(),
      })),
    }))
  } catch (error) {
    console.error("Error fetching posts:", error)
    throw new Error("Failed to fetch posts")
  }
}

// Create a new post
export async function createPost(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to create a post" }
    }

    const parsed = postSchema.parse({
      content: formData.get("content"),
      department: formData.get("department"),
      image: formData.get("image"),
    })

    const post = await prisma.post.create({
      data: {
        content: parsed.content,
        department: parsed.department,
        image: parsed.image || null,
        author: {
          connect: { id: currentUser.id },
        },
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
      },
    })

    revalidatePath("/feeds")

    return {
      success: true,
      post: {
        id: post.id,
        content: post.content,
        department: post.department || "",
        author: {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.image || "/placeholder.svg?height=40&width=40",
          role: post.author.role,
        },
        createdAt: post.createdAt.toISOString(),
        image: post.image,
        likes: 0,
        comments: [],
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Add a comment to a post
export async function addComment(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to comment" }
    }

    const parsed = commentSchema.parse({
      content: formData.get("content"),
      postId: formData.get("postId"),
    })

    const comment = await prisma.comment.create({
      data: {
        content: parsed.content,
        author: {
          connect: { id: currentUser.id },
        },
        post: {
          connect: { id: parsed.postId },
        },
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
      },
    })

    // Create notification for post author
    const post = await prisma.post.findUnique({
      where: { id: parsed.postId },
      select: { authorId: true },
    })

    if (post && post.authorId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          title: "New comment",
          message: `${currentUser.name} commented on your post`,
          user: {
            connect: { id: post.authorId },
          },
        },
      })
    }

    revalidatePath("/feeds")

    return {
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          avatar: comment.author.image || "/placeholder.svg?height=32&width=32",
          role: comment.author.role,
        },
        createdAt: comment.createdAt.toISOString(),
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Like or unlike a post
export async function toggleLike(postId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to like a post" }
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId,
        },
      },
    })

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId,
          },
        },
      })
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          user: {
            connect: { id: currentUser.id },
          },
          post: {
            connect: { id: postId },
          },
        },
      })

      // Create notification for post author
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      })

      if (post && post.authorId !== currentUser.id) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            title: "New like",
            message: `${currentUser.name} liked your post`,
            user: {
              connect: { id: post.authorId },
            },
          },
        })
      }
    }

    revalidatePath("/feeds")

    return {
      success: true,
      liked: !existingLike,
    }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

// Delete a post
export async function deletePost(postId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to delete a post" }
    }

    // Check if the user is the author of the post or an admin
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return { error: "Post not found" }
    }

    if (post.authorId !== currentUser.id && currentUser.role !== "ADMIN") {
      return { error: "You do not have permission to delete this post" }
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    revalidatePath("/feeds")

    return { success: true }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}
