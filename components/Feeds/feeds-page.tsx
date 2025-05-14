"use client"

import { useEffect, useState, useMemo } from "react"
import { FeedList } from "@/components/Feeds/feed-list"
import { AdvertisementSidebar } from "@/components/Feeds/advertisement-sidebar"
import { CreatePostModal } from "@/components/Feeds/create-post-modal"
import { FeedFilters } from "@/components/Feeds/feed-filters"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Newspaper } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/types/post"
import { getPosts, createPost } from "@/lib/actions/feed"
import { useUser } from "@/context/user-context"
import { FeedSkeleton } from "@/components/skeletons/feed-skeleton"

export function FeedsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const { toast } = useToast()
  const { user } = useUser()

  const fetchPosts = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
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

      // Transform posts to match our Post type
      const transformedPosts = (fetchedPosts || []).map((post: any) => ({
        id: post.id,
        content: post.content,
        department: post.department || post.author.role || "General",
        author: {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.image || "",
          role: post.author.role || "Student",
        },
        createdAt: new Date(post.createdAt).toISOString(),
        image: post.image || null,
        likes: post.likes?.length || 0,
        comments: (post.comments || []).map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          author: {
            id: comment.author.id,
            name: comment.author.name,
            avatar: comment.author.image || "",
            role: comment.author.role || "Student",
          },
          createdAt: new Date(comment.createdAt).toISOString(),
          reactions: [],
        })),
      }))

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
  }

  // Fetch data only on component mount
  useEffect(() => {
    fetchPosts(true)
  }, [])

  // Filter posts by department and sort by date locally
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
      setPosts(currentPosts => [newPost, ...currentPosts])

      const { success, error } = await createPost({
        content: newPost.content,
        department: newPost.department,
        image: newPost.image || undefined,
      })

      if (error) {
        // Revert optimistic update on error
        setPosts(currentPosts => currentPosts.filter(post => post.id !== newPost.id))
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Don't fetch again after successful creation, we already have the post in state
      toast({
        title: "Success",
        description: "Your post has been published successfully.",
      })
    } catch (error) {
      // Revert optimistic update on error
      setPosts(currentPosts => currentPosts.filter(post => post.id !== newPost.id))
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

  if (isLoading) {
    return <FeedSkeleton />
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto feeds-scroll-hidden p-4 md:p-6">
          <div className="mx-auto content-max-width">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                    <Newspaper className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">News Feed</h1>
                    <p className="text-sm text-[var(--color-muted-fg)]">Stay updated with the latest posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-9 w-9"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Post
                    </Button>
                  )}
                </div>
              </div>
              <FeedFilters
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
              />
            </div>

            <FeedList posts={filteredPosts} />
          </div>
        </div>
        <AdvertisementSidebar />
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}
