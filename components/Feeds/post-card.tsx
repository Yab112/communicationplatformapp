"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Share2, MoreHorizontal, ArrowBigUp, ArrowBigDown } from "lucide-react"
import { CommentSection } from "@/components/Feeds/comment-section"
import type { Post } from "@/types/post"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [timeAgo, setTimeAgo] = useState<string>('')

  // Character limit for the preview
  const CHAR_LIMIT = 280
  const isLongText = post.content.length > CHAR_LIMIT

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }))
    
    // Update time every minute
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }))
    }, 60000)

    return () => clearInterval(interval)
  }, [post.createdAt])

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1)
    } else {
      setLikesCount(prev => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <Card className="group relative overflow-hidden hover:border-[var(--color-border)] transition-all duration-200">
      <div className="flex">
        {/* Vote Buttons - Desktop */}
        <div className="hidden sm:flex flex-col items-center gap-1 bg-[var(--color-accent)] p-2 sm:p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={cn(
              "h-8 w-8 rounded-md hover:bg-[var(--color-muted)]/20",
              isLiked && "text-orange-500"
            )}
          >
            <ArrowBigUp className={cn("h-6 w-6", isLiked && "fill-current")} />
          </Button>
          <span className="text-sm font-medium">{likesCount}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className="h-8 w-8 rounded-md hover:bg-[var(--color-muted)]/20"
          >
            <ArrowBigDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="rounded-full">
                {post.department}
              </Badge>
              <span className="text-sm text-[var(--color-muted-fg)]">•</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hover:underline cursor-pointer">
                  Posted by {post.author.name}
                </span>
                {post.author.verified && (
                  <svg className="w-4 h-4 text-[var(--color-primary)]" viewBox="0 0 24 24" aria-label="Verified account">
                    <path
                      fill="currentColor"
                      d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"
                    />
                  </svg>
                )}
                <span className="text-sm text-[var(--color-muted-fg)]">•</span>
                <span className="text-sm text-[var(--color-muted-fg)]">{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="space-y-2">
              {isLongText && !showFullContent ? (
                <>
                  <p className="text-[15px] leading-relaxed">
                    {post.content.slice(0, CHAR_LIMIT)}...{" "}
                    <button
                      onClick={() => setShowFullContent(true)}
                      className="text-[var(--color-primary)] hover:underline font-medium"
                    >
                      See More
                    </button>
                  </p>
                </>
              ) : (
                <p className="text-[15px] leading-relaxed">{post.content}</p>
              )}
            </div>

            {/* Media */}
            {post.image && (
              <div className="relative aspect-[16/9] sm:aspect-video overflow-hidden rounded-lg border">
                <img src={post.image} alt="Post media" className="h-full w-full object-cover" />
              </div>
            )}
            {post.video && (
              <div className="relative aspect-[16/9] sm:aspect-video overflow-hidden rounded-lg border">
                <video
                  src={post.video}
                  controls
                  className="h-full w-full object-cover"
                  poster={post.videoPoster || undefined}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Vote Buttons - Mobile */}
              <div className="flex sm:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className={cn(
                    "h-8 w-8 rounded-full hover:bg-[var(--color-muted)]/20",
                    isLiked && "text-orange-500"
                  )}
                >
                  <ArrowBigUp className={cn("h-5 w-5", isLiked && "fill-current")} />
                </Button>
                <span className="text-sm font-medium min-w-[2ch] text-center">{likesCount}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className="h-8 w-8 rounded-full hover:bg-[var(--color-muted)]/20"
                >
                  <ArrowBigDown className="h-5 w-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleComments}
                className="gap-2 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-muted)]/10"
              >
                <MessageSquare className="h-4 w-4" />
                {post.comments.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-muted)]/10"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-muted)]/10"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t bg-[var(--color-accent)]/50">
          <CommentSection postId={post.id} comments={post.comments} />
        </div>
      )}
    </Card>
  )
}
