"use client"

import { useState, useEffect, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Share2, MoreHorizontal, ArrowBigUp, ArrowBigDown, Loader2 } from "lucide-react"
import { CommentSection } from "@/components/Feeds/comment-section"
import type { Post } from "@/types/post"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { likePost } from "@/lib/actions/feed"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [timeAgo, setTimeAgo] = useState<string>('')
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Character limit for the preview
  const CHAR_LIMIT = 280
  const isLongText = post.content.length > CHAR_LIMIT

  // Update local state when post prop changes
  useEffect(() => {
    setIsLiked(post.isLiked)
    setLikesCount(post.likes)
  }, [post.isLiked, post.likes])

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }))

    // Update time every minute
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }))
    }, 60000)

    return () => clearInterval(interval)
  }, [post.createdAt])

  useEffect(() => {
    if (!post.video || !videoRef.current || !videoContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in view, start loading
            videoRef.current?.load();
            // Play video without sound
            videoRef.current?.play().then(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
              }
            }).catch(() => {
              // Autoplay failed, user interaction required
              console.log('Autoplay failed');
            });
          } else {
            // Video is out of view, pause it
            videoRef.current?.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Video needs to be 50% visible
      }
    );

    observer.observe(videoContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [post.video]);

  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
  };

  const handleLike = async () => {
    try {
      // Immediately update UI
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      setLikesCount(newLikesCount);
      setIsLiked(!isLiked);

      // Make API call
      const { error } = await likePost(post.id);
      if (error) {
        throw new Error(error);
      }

      // Show success toast
      toast({
        title: isLiked ? "Post unliked" : "Post liked",
        description: isLiked ? "Your reaction has been removed" : "Your reaction has been added",
        variant: "default",
        duration: 1500,
      });
    } catch (error) {
      // Revert on error
      setLikesCount(likesCount);
      setIsLiked(isLiked);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <Card className="group relative overflow-hidden hover:border-[var(--color-border)] transition-all duration-200">
      <div className="flex">
        {/* Vote Buttons - Desktop */}
        <div className="hidden sm:flex flex-col items-center gap-1 bg-blue-950/50 p-2 sm:p-3 bottom-0">
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
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {post.author.role}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="text-sm">
              {isLongText && !showFullContent ? (
                <>
                  <p>{post.content.slice(0, CHAR_LIMIT)}...</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => setShowFullContent(true)}
                  >
                    Read more
                  </Button>
                </>
              ) : (
                <p>{post.content}</p>
              )}
            </div>

            {post.image && (
              <div className="relative aspect-[16/9] sm:aspect-video overflow-hidden rounded-lg">
                <img
                  src={post.image}
                  alt="Post image"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {post.video && (
              <div ref={videoContainerRef} className="relative aspect-[16/9] sm:aspect-video overflow-hidden rounded-lg">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  src={post.video}
                  controls
                  className="h-full w-full object-cover"
                  poster={post.videoPoster || undefined}
                  onLoadStart={handleVideoLoadStart}
                  onCanPlay={handleVideoCanPlay}
                  playsInline
                  muted
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
