"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { postSchema, type PostFormValues } from "@/lib/validator/post"

export async function getPosts() {
  try {
    const posts = await db.post.findMany({
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
            CommentReaction: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to match the expected format
    const transformedPosts = posts.map(post => ({
      ...post,
      comments: post.comments.map(comment => ({
        ...comment,
        reactions: comment.CommentReaction.map(reaction => ({
          id: reaction.id,
          type: reaction.type,
          author: {
            id: reaction.user.id,
            name: reaction.user.name,
            avatar: reaction.user.image || "",
            role: "Student",
          },
          createdAt: reaction.createdAt.toISOString(),
        })),
      })),
    }))

    return { posts: transformedPosts }
  } catch (error) {
    return { error: "Failed to fetch posts" }
  }
}

export async function createPost(data: PostFormValues) {
  try {
    // Validate input
    const validatedData = postSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Create post with department as a tag
    const post = await db.post.create({
      data: {
        content: validatedData.content,
        authorId: user.id,
        department: user.department,
        ...(validatedData.image && { image: validatedData.image }),
      },
    })

    // Revalidate feeds page
    revalidatePath("/feeds")

    return { success: true, post }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create post" }
  }
}

export async function likePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Check if user already liked the post
    const existingLike = await db.like.findUnique({
      where: {
        postId_userId: {
          userId: user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      // Unlike the post
      await db.like.delete({
        where: {
          postId_userId: {
            userId: user.id,
            postId,
          },
        },
      })
    } else {
      // Like the post
      await db.like.create({
        data: {
          userId: user.id,
          postId,
        },
      })
    }

    revalidatePath("/feeds")
    return { success: true }
  } catch (error) {
    return { error: "Failed to like post" }
  }
}

export async function addComment(postId: string, content: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    if (!content.trim()) {
      return { error: "Comment cannot be empty" }
    }

    const comment = await db.comment.create({
      data: {
        content,
        authorId: user.id,
        postId,
      },
    })

    revalidatePath("/feeds")
    return { success: true, comment }
  } catch (error) {
    return { error: "Failed to add comment" }
  }
}

export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return { error: "Post not found" }
    }

    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return { error: "Not authorized to delete this post" }
    }

    // Delete associated likes and comments first
    await db.like.deleteMany({ where: { postId } })
    await db.comment.deleteMany({ where: { postId } })

    // Delete the post
    await db.post.delete({ where: { id: postId } })

    revalidatePath("/feeds")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete post" }
  }
}

export async function addCommentReaction(commentId: string, type: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Check if user already reacted to the comment with this type
    const existingReaction = await db.commentReaction.findUnique({
      where: {
        commentId_userId_type: {
          userId: user.id,
          commentId,
          type,
        },
      },
    })

    if (existingReaction) {
      // Remove the reaction
      await db.commentReaction.delete({
        where: {
          commentId_userId_type: {
            userId: user.id,
            commentId,
            type,
          },
        },
      })
    } else {
      // Add the reaction
      await db.commentReaction.create({
        data: {
          type,
          userId: user.id,
          commentId,
        },
      })
    }

    revalidatePath("/feeds")
    return { success: true }
  } catch (error) {
    return { error: "Failed to react to comment" }
  }
}

export async function getCommentReactions(commentId: string) {
  try {
    const reactions = await db.commentReaction.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return { reactions }
  } catch (error) {
    return { error: "Failed to fetch comment reactions" }
  }
}
