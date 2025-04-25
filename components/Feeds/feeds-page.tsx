"use client"

import { useState } from "react"
import { FeedList } from "@/components/Feeds/feed-list"
import { UsersSidebar } from "@/components/Feeds/users-sidebar"
import { CreatePostModal } from "@/components/Feeds/create-post-modal"
import { FeedFilters } from "@/components/Feeds/feed-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mockPosts } from "@/data/mock/posts"
import type { Post } from "@/types/post"

export function FeedsPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const { toast } = useToast()

  // Filter posts by department and sort by date
  const filteredPosts = posts
    .filter((post) => !selectedDepartment || post.department === selectedDepartment)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts])
    setIsCreateModalOpen(false)
    toast({
      title: "Post created",
      description: "Your post has been published successfully.",
    })
  }

  // Mock user role - in a real app, this would come from auth
  const isAdmin = true

  return (
    <div className="flex h-full">
      {/* Main content area with proper spacing */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left spacer for balance on larger screens */}
        <div className="hidden lg:block w-0 xl:w-24 2xl:w-48" />

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

            <FeedList posts={filteredPosts} />
          </div>
        </div>

        {/* Right sidebar - NO LEFT MARGIN */}
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
