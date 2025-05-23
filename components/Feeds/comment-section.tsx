"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Comment } from "@/types/post"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { motion } from "framer-motion"
import { addComment, addCommentReaction } from "@/lib/actions/feed"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/user-context"
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

type CommentFormValues = z.infer<typeof commentSchema>

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentTimes, setCommentTimes] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {}
      comments.forEach(comment => {
        times[comment.id] = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
      })
      setCommentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 60000)

    return () => clearInterval(interval)
  }, [comments])

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (values: CommentFormValues) => {
    const tempId = `temp-${Date.now()}`
    const tempComment: Comment = {
      id: tempId,
      content: values.content,
      createdAt: new Date().toISOString(),
      author: {
        id: user?.id || 'current-user',
        name: user?.name || 'Anonymous',
        avatar: user?.image || "/placeholder.svg",
        role: user?.role || "Student",
      },
      reactions: [],
    }
  
    // 1. Optimistically add to UI immediately
    setComments((prev) => [...prev, tempComment])
    form.reset()
  
    try {
      // 2. Send request in background
      const { success, error, comment } = await addComment(postId, values.content)
  
      if (error || !success || !comment) {
        // 3a. Remove the temp comment if failed
        setComments((prev) => prev.filter((c) => c.id !== tempId))
        toast({
          title: "Error",
          description: error || "Failed to add comment",
          variant: "destructive",
        })
        return
      }
  
      // 3b. Replace the temp comment with the real one if success
      setComments((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                ...comment,
                author: {
                  id: user?.id || 'current-user',
                  name: user?.name || 'Anonymous',
                  avatar: user?.image || "/placeholder.svg",
                  role: user?.role || "Student",
                },
                reactions: [],
                createdAt: new Date(comment.createdAt).toISOString(),
              }
            : c
        )
      )
  
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      // 4. Remove if any unexpected failure
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }
  

  const handleReaction = async (commentId: string, type: string) => {
    // 1. First update the UI optimistically
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          const existingReactionIndex = comment.reactions.findIndex(
            (r) => r.type === type && r.author.id === (user?.id || 'current-user')
          )

          if (existingReactionIndex >= 0) {
            // Remove the reaction optimistically
            return {
              ...comment,
              reactions: comment.reactions.filter((_, i) => i !== existingReactionIndex),
            }
          } else {
            // Add the reaction optimistically
            return {
              ...comment,
              reactions: [
                ...comment.reactions,
                {
                  id: `temp-${Date.now()}`,
                  type,
                  author: {
                    id: user?.id || 'current-user',
                    name: user?.name || 'Anonymous',
                    avatar: user?.image || "/placeholder.svg",
                    role: user?.role || "Student",
                  },
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          }
        }
        return comment
      })
    )

    // 2. Then make the API call
    try {
      const { success, error } = await addCommentReaction(commentId, type)

      if (error || !success) {
        // 3. Revert changes if the API call fails
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const existingReactionIndex = comment.reactions.findIndex(
                (r) => r.type === type && r.author.id === (user?.id || 'current-user')
              )

              if (existingReactionIndex >= 0) {
                // Add back the reaction
                return {
                  ...comment,
                  reactions: comment.reactions.filter((_, i) => i !== existingReactionIndex),
                }
              } else {
                // Remove the temporary reaction
                return {
                  ...comment,
                  reactions: comment.reactions.filter(r => !r.id.startsWith('temp-')),
                }
              }
            }
            return comment
          })
        )

        toast({
          title: "Error",
          description: error || "Failed to update reaction",
          variant: "destructive",
        })
      }
    } catch (error) {
      // 4. Handle any unexpected errors
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      })
      
      // Revert the optimistic update
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions: comment.reactions.filter(r => !r.id.startsWith('temp-')),
            }
          }
          return comment
        })
      )
    }
  }

  const reactionEmojis = ["👍", "❤️", "😂"]

  return (
    <div className="border-t p-4 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || "/placeholder.svg?height=32&width=32"} alt={user?.name || "Current user"} />
            <AvatarFallback>{(user?.name || "CU").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Write a comment..." className="min-h-[80px] resize-none" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm">
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="rounded-lg bg-[var(--color-muted)]/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.author.name}</p>
                  <p className="text-xs text-[var(--color-muted-fg)]">
                    {commentTimes[comment.id] || ''}
                  </p>
                </div>
                <p className="mt-1 text-sm break-words whitespace-pre-wrap max-w-[500px]">{comment.content}</p>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex gap-1">
                  {reactionEmojis.map((emoji) => {
                    const hasReacted = comment.reactions.some(
                      (r) => r.type === emoji && r.author.id === (user?.id || 'current-user')
                    )
                    const reactionCount = comment.reactions.filter((r) => r.type === emoji).length

                    return (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        className={`text-sm px-1.5 py-0.5 rounded-full ${
                          hasReacted
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "text-[var(--color-muted-fg)] hover:bg-[var(--color-muted)]/10"
                        }`}
                        onClick={() => handleReaction(comment.id, emoji)}
                      >
                        <span>{emoji}</span>
                        {reactionCount > 0 && (
                          <span className="ml-1 text-xs font-medium">{reactionCount}</span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
