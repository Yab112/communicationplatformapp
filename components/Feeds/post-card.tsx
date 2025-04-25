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

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [reactions, setReactions] = useState({
    "👍": post.likes > 0 ? Math.floor(post.likes * 0.6) : 0,
    "❤️": post.likes > 0 ? Math.floor(post.likes * 0.3) : 0,
    "😂": post.likes > 0 ? Math.floor(post.likes * 0.1) : 0,
    "😮": 0,
    "😢": 0,
  })
  const [userReaction, setUserReaction] = useState<string | null>(null)

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)

  const handleReaction = (emoji: string) => {
    // If user already reacted with this emoji, remove it
    if (userReaction === emoji) {
      setReactions({
        ...reactions,
        [emoji]: Math.max(0, reactions[emoji as keyof typeof reactions] - 1),
      })
      setUserReaction(null)
    }
    // If user reacted with a different emoji, remove old one and add new one
    else if (userReaction) {
      setReactions({
        ...reactions,
        [userReaction]: Math.max(0, reactions[userReaction as keyof typeof reactions] - 1),
        [emoji]: reactions[emoji as keyof typeof reactions] + 1,
      })
      setUserReaction(emoji)
    }
    // If user hasn't reacted yet, add new reaction
    else {
      setReactions({
        ...reactions,
        [emoji]: reactions[emoji as keyof typeof reactions] + 1,
      })
      setUserReaction(emoji)
    }
  }

  const reactionEmojis = [
    { emoji: "👍", label: "Like" },
    { emoji: "❤️", label: "Love" },
    { emoji: "😂", label: "Haha" },
    { emoji: "😮", label: "Wow" },
    { emoji: "😢", label: "Sad" },
  ]

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
            <div className="flex -space-x-1">
              {Object.entries(reactions).map(
                ([emoji, count]) =>
                  count > 0 && (
                    <div
                      key={emoji}
                      className="flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-primary)]/10 text-xs"
                    >
                      {emoji}
                    </div>
                  ),
              )}
            </div>
            <span className="text-sm text-[var(--color-muted-fg)] ml-1">{totalReactions}</span>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-1 gap-2">
                <span>{userReaction || "👍"}</span>
                <span>React</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="flex gap-2 p-2">
                {reactionEmojis.map((reaction) => (
                  <div key={reaction.emoji} className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      className="text-2xl relative"
                      onClick={() => handleReaction(reaction.emoji)}
                    >
                      {reaction.emoji}
                      {reactions[reaction.emoji as keyof typeof reactions] > 0 && (
                        <span className="absolute -bottom-2 -right-1 text-xs font-medium bg-[var(--color-primary)] text-white rounded-full px-1 min-w-5 text-center">
                          {reactions[reaction.emoji as keyof typeof reactions]}
                        </span>
                      )}
                    </motion.button>
                    <div className="text-xs mt-1">{reaction.label}</div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
