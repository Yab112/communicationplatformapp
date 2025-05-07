"use client"

import { useEffect, useState } from "react"
import { FeedList } from "@/components/Feeds/feed-list"
import { UsersSidebar } from "@/components/Feeds/users-sidebar"
import { CreatePostModal } from "@/components/Feeds/create-post-modal"
import { FeedFilters } from "@/components/Feeds/feed-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/types/post"
import { getPosts, createPost } from "@/lib/actions/feed"

export function FeedsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { posts: fetchedPosts, error } = await getPosts()
        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return
        }
        if (fetchedPosts) {
          // Transform the server data to match our Post type
          const transformedPosts: Post[] = fetchedPosts.map((post) => ({
            id: post.id,
            content: post.content,
            department: post.department || post.author.role, // Use department if available, fallback to role
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
                  role: "Student",
                },
                createdAt: reaction.createdAt.toISOString(),
              })) || [],
            })),
          }))
          setPosts(transformedPosts)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [toast])

  // Filter posts by department and sort by date
  const filteredPosts = posts
    .filter((post) => !selectedDepartment || post.department === selectedDepartment)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  const handleCreatePost = async (newPost: Post) => {
    try {
      const { success, error } = await createPost({
        content: newPost.content,
        department: newPost.department,
        imageUrl: newPost.image || undefined,
      })

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Refresh posts after creating a new one
      const { posts: updatedPosts } = await getPosts()
      if (updatedPosts) {
        // Transform the server data to match our Post type
        const transformedPosts: Post[] = updatedPosts.map((post) => ({
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
                role: "Student",
              },
              createdAt: reaction.createdAt.toISOString(),
            })) || [],
          })),
        }))
        setPosts(transformedPosts)
      }
      setIsCreateModalOpen(false)
      toast({
        title: "Success",
        description: "Your post has been published successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    }
  }

  // Mock user role - in a real app, this would come from auth
  const isAdmin = true

  return (
    <div className="flex h-full">
      {/* Main content area with proper spacing */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center feed section */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto content-max-width">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Feed</h1>

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

        {/* Right sidebar */}
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
