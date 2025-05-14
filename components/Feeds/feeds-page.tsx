"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { FeedList } from "@/components/Feeds/feed-list"
import { UsersSidebar } from "@/components/Feeds/users-sidebar"
import { CreatePostModal } from "@/components/Feeds/create-post-modal"
import { FeedFilters } from "@/components/Feeds/feed-filters"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/types/post"
import { getPosts, createPost } from "@/lib/actions/feed"
import { useUser } from "@/context/user-context"
import { useSocket } from "@/hooks/use-socket"
import { usePostStore } from "@/store"

export function FeedsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const { toast } = useToast()
  const { user } = useUser()
  const socket = useSocket()

  // Use the post store
  const { posts, setPosts, addPost, updatePost, deletePost } = usePostStore()

  const fetchPosts = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const { posts: fetchedPosts, error } = await getPosts()
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Transform and set posts
      const transformedPosts = (fetchedPosts || []).map((post) => ({
        id: post.id,
        content: post.content,
        department: post.department || post.author.role,
        author: {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.image || "",
          role: post.author.role as "Student" | "Teacher" | "Admin",
        },
        createdAt: post.createdAt.toISOString(),
        image: post.image || null,
        likes: post.likes.length,
        comments: post.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          author: {
            id: comment.author.id,
            name: comment.author.name,
            avatar: comment.author.image || "",
            role: comment.author.role as "Student" | "Teacher" | "Admin",
          },
          createdAt: comment.createdAt.toISOString(),
          reactions: comment.CommentReaction?.map((reaction) => ({
            id: reaction.id,
            type: reaction.type,
            author: {
              id: reaction.user.id,
              name: reaction.user.name,
              avatar: reaction.user.image || "",
              role: "Student" as "Student" | "Teacher" | "Admin",
            },
            createdAt: reaction.createdAt.toISOString(),
          })) || [],
        })),
      })) as Post[]

      setPosts(transformedPosts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [setPosts, toast])

  // Initial fetch on mount
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts(true)
    }
  }, [fetchPosts, posts.length])

  // Socket connection for real-time updates
  useEffect(() => {
    if (!socket) return

    socket.on("new_post", (newPost: Post) => {
      addPost(newPost)
    })

    socket.on("post_updated", (updatedPost: Post) => {
      updatePost(updatedPost)
    })

    socket.on("post_deleted", (postId: string) => {
      deletePost(postId)
    })

    return () => {
      socket.off("new_post")
      socket.off("post_updated")
      socket.off("post_deleted")
    }
  }, [socket, addPost, updatePost, deletePost])

  // Filter posts by department and sort by date
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => !selectedDepartment || post.department === selectedDepartment)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB
      })
  }, [posts, selectedDepartment, sortOrder])

  const handleCreatePost = async (newPost: Post) => {
    try {
      setIsCreateModalOpen(false)
      // Optimistically add the new post
      addPost(newPost)

      const { success, error } = await createPost({
        content: newPost.content,
        department: newPost.department,
        image: newPost.image || undefined,
      })

      if (error) {
        // Revert optimistic update on error
        deletePost(newPost.id)
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Your post has been published successfully.",
      })
    } catch (error) {
      // Revert optimistic update on error
      deletePost(newPost.id)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    fetchPosts(false)
  }

  const isAdmin = user?.role?.toLowerCase() === "admin"

  return (
    <div className="flex h-full">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto content-max-width">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Feed</h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <FeedFilters
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <FeedList posts={filteredPosts} />
            )}
          </div>
        </div>
        <UsersSidebar />
      </div>

      {isAdmin && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}
