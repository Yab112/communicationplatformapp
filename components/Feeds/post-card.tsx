"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, MoreHorizontal } from "lucide-react"
import type { Post } from "@/types/post"
import { motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CommentSection } from "@/components/Feeds/comment-section"
import { likePost } from "@/lib/actions/feed"
import { useToast } from "@/hooks/use-toast"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const { toast } = useToast()

  const handleLike = async () => {
    try {
      const { success, error } = await likePost(post.id)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (success) {
        setIsLiked(!isLiked)
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="overflow-hidden bg-[var(--color-card)] shadow-sm border border-[var(--color-border)]">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.avatar || "/placeholder.svg?height=40&width=40"} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium leading-none">{post.author.name}</p>
              <p className="text-sm text-[var(--color-muted-fg)]">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Save post</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                {post.author.id === "current-user" && <DropdownMenuItem>Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {post.department && (
            <Badge variant="outline" className="text-xs">
              {post.department}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="relative">
          <p className={`${showFullContent ? "" : "line-clamp-2"} mb-4`}>{post.content}</p>
          {!showFullContent && post.content.length > 120 && (
            <div
              className="absolute inset-0 flex items-end cursor-pointer group"
              onClick={() => setShowFullContent(true)}
            >
              <div className="w-full h-8 bg-gradient-to-t from-[var(--color-card)] to-transparent"></div>
              <span className="absolute bottom-0 right-0 text-sm font-medium text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                Read more
              </span>
            </div>
          )}
        </div>
        {post.image && (
          <div className="overflow-hidden rounded-md">
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post attachment"
              className="aspect-video w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1">
            {likesCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-primary)]/10 text-xs">
                  👍
                </div>
                <span className="text-sm text-[var(--color-muted-fg)]">{likesCount}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-[var(--color-muted-fg)]"
            onClick={() => setShowComments(!showComments)}
          >
            {post.comments.length} comments
          </Button>
        </div>
        <Separator />
        <div className="flex p-1">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 gap-2 ${isLiked ? "text-[var(--color-primary)]" : ""}`}
            onClick={handleLike}
          >
            <span>👍</span>
            <span>{isLiked ? "Liked" : "Like"}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setShowComments(!showComments)}>
            <MessageSquare className="h-4 w-4" />
            <span>Comment</span>
          </Button>
        </div>

        {showComments && <CommentSection postId={post.id} comments={post.comments} />}
      </CardFooter>
    </Card>
  )
}
