"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { FeedList } from "@/components/Feeds/feed-list"
import { AdvertisementSidebar } from "@/components/Feeds/advertisement-sidebar"
import { CreatePostModal } from "@/components/Feeds/create-post-modal"
import { FeedFilters } from "@/components/Feeds/feed-filters"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Newspaper, TrendingUp, Flame, Clock, Sparkles, ExternalLink, Calendar, Briefcase, Gift } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/types/post"
import { getPosts, createPost } from "@/lib/actions/feed"
import { useUser } from "@/context/user-context"
import { FeedSkeleton } from "@/components/skeletons/feed-skeleton"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockAdvertisements } from "@/data/mock/advertisements"
import type { Advertisement } from "@/types/advertisement"
import { motion } from "framer-motion"

type SortOrder = "newest" | "oldest" | "trending" | "hot"

// Helper function to get icon based on advertisement type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'event':
      return <Calendar className="h-4 w-4" />
    case 'opportunity':
      return <Briefcase className="h-4 w-4" />
    case 'promotion':
      return <Gift className="h-4 w-4" />
    default:
      return null
  }
}

export function FeedsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const { toast } = useToast()
  const { user } = useUser()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll advertisements
  useEffect(() => {
    const interval = setInterval(() => {
      if (mockAdvertisements.length <= 1) return

      setCurrentAdIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % mockAdvertisements.length
        const container = scrollContainerRef.current
        if (container) {
          const width = container.offsetWidth
          container.scrollTo({
            left: width * nextIndex,
            behavior: 'smooth'
          })
        }
        return nextIndex
      })
    }, 5000) // Change ad every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Handle manual scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollLeft = container.scrollLeft
      const width = container.offsetWidth
      const newIndex = Math.round(scrollLeft / width)
      setCurrentAdIndex(newIndex)
    }
  }

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
    const filtered = posts.filter((post) => !selectedDepartment || post.department === selectedDepartment)

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "trending":
          // Sort by likes count and recency
          const trendingScoreA = a.likes * (1 / Math.sqrt(Date.now() - new Date(a.createdAt).getTime()))
          const trendingScoreB = b.likes * (1 / Math.sqrt(Date.now() - new Date(b.createdAt).getTime()))
          return trendingScoreB - trendingScoreA
        case "hot":
          // Sort by likes and comments count
          const hotScoreA = (a.likes + a.comments.length * 2) / Math.pow((Date.now() - new Date(a.createdAt).getTime()) / 3600000 + 2, 1.8)
          const hotScoreB = (b.likes + b.comments.length * 2) / Math.pow((Date.now() - new Date(b.createdAt).getTime()) / 3600000 + 2, 1.8)
          return hotScoreB - hotScoreA
        default:
          return 0
      }
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
    <div className="flex min-h-screen bg-[var(--color-accent)] flex-col lg:flex-row">
      {/* Mobile Advertisement Scroll */}
      <div className="lg:hidden w-full overflow-hidden relative">
        <div className="relative">
          <div className="px-0">
            <ScrollArea className="w-full overflow-hidden">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex snap-x snap-mandatory touch-pan-x no-scrollbar"
              >
                {mockAdvertisements.map((ad: Advertisement, index: number) => (
                  <div 
                    key={ad.id} 
                    className="w-full flex-none snap-start"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="relative aspect-[2/1] w-full"
                    >
                      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                          {ad.priority === 'high' && (
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                                <Sparkles className="h-3 w-3 text-white" />
                                <span className="text-xs font-medium text-white">Featured</span>
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="mb-1">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                ad.type === 'event' ? 'bg-blue-500/20 text-blue-100' :
                                ad.type === 'opportunity' ? 'bg-emerald-500/20 text-emerald-100' :
                                'bg-purple-500/20 text-purple-100'
                              }`}>
                                {getTypeIcon(ad.type)}
                                {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm text-white line-clamp-2 mb-1">{ad.title}</h4>
                            <p className="text-xs text-white/80 line-clamp-2">{ad.description}</p>
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {mockAdvertisements.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentAdIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 py-3 md:px-6 md:py-4">
        <div className="mx-auto max-w-3xl">
          {/* Top Bar */}
          <div className="mb-3">
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                  <h1 className="text-lg font-bold">Academic Feed</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-8 w-8 rounded-full"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      size="sm"
                      className="gap-2 rounded-full hidden sm:inline-flex"
                    >
                      <Plus className="h-4 w-4" />
                      New Post
                    </Button>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto -mx-3 px-3">
                <Button
                  variant={sortOrder === "newest" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortOrder("newest")}
                  className="rounded-full shrink-0 h-7 text-xs px-2.5"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Button>
                <Button
                  variant={sortOrder === "trending" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortOrder("trending")}
                  className="rounded-full shrink-0 h-7 text-xs px-2.5"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Button>
                <Button
                  variant={sortOrder === "hot" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortOrder("hot")}
                  className="rounded-full shrink-0 h-7 text-xs px-2.5"
                >
                  <Flame className="h-3 w-3 mr-1" />
                  Hot
                </Button>
                <Button
                  variant={sortOrder === "oldest" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortOrder("oldest")}
                  className="rounded-full shrink-0 h-7 text-xs px-2.5"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Old
                </Button>
              </div>
            </Card>
          </div>

          {/* Department Filters */}
          <div className="mb-3">
            <FeedFilters
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>

          {/* Feed List */}
          <div className="w-full overflow-x-hidden">
            <FeedList posts={filteredPosts} />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Advertisements (Desktop Only) */}
      <div className="hidden lg:block w-80 xl:w-96 border-l border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 xl:p-6">
              <h3 className="text-lg font-semibold">Featured</h3>
              <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                {mockAdvertisements.length} Available
              </span>
            </div>
            <div className="flex-1 overflow-hidden px-4 xl:px-6">
              <ScrollArea className="h-full w-full overflow-hidden">
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex snap-y snap-mandatory flex-col gap-4 no-scrollbar"
                >
                  {mockAdvertisements.map((ad: Advertisement, index: number) => (
                    <div 
                      key={ad.id} 
                      className="w-full flex-none snap-start"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative aspect-[2/1] w-full"
                      >
                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full group">
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl">
                            {ad.priority === 'high' && (
                              <div className="absolute top-2 right-2">
                                <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                                  <Sparkles className="h-3 w-3 text-white" />
                                  <span className="text-xs font-medium text-white">Featured</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <div className="mb-1">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  ad.type === 'event' ? 'bg-blue-500/20 text-blue-100' :
                                  ad.type === 'opportunity' ? 'bg-emerald-500/20 text-emerald-100' :
                                  'bg-purple-500/20 text-purple-100'
                                }`}>
                                  {getTypeIcon(ad.type)}
                                  {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                                </span>
                              </div>
                              <h4 className="font-semibold text-sm text-white line-clamp-2 mb-1 group-hover:underline">{ad.title}</h4>
                              <p className="text-xs text-white/80 line-clamp-2">{ad.description}</p>
                            </div>
                          </div>
                        </a>
                      </motion.div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-1.5">
                  {mockAdvertisements.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentAdIndex ? 'w-4 bg-[var(--color-primary)]' : 'w-1 bg-[var(--color-muted)]/40'
                      }`}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Mobile Quick Actions */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 sm:hidden">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

