"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Post } from "@/types/post"
import { CreatePostModal } from "./create-post-modal"
import { UsersSidebar } from "./users-sidebar"
import { FeedList } from "./feed-list"
import { useState } from "react"
import { mockPosts } from "@/data/mock/posts"

export function FeedsPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const { toast } = useToast()
  const isMobile = useIsMobile()    

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
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Feed</h1>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={selectedDepartment || ""}
                  onChange={(e) => setSelectedDepartment(e.target.value || null)}
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                </select>
                <select
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <FeedList posts={filteredPosts} />
          </div>
        </div>

        {!isMobile && <UsersSidebar />}
      </div>

      {isAdmin && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
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
function useToast(): { toast: (options: { title: string; description: string }) => void } {
    return {
        toast: ({ title, description }) => {
            console.log(`Toast: ${title} - ${description}`);
        },
    };
}

