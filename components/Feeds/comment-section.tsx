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
    // Create a temporary comment with a temporary ID
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content: values.content,
      author: {
        id: "default-author-id",
        name: "Default Author",
        avatar: "/default-avatar.svg",
        role: "Student",
      },
      reactions: [],
      createdAt: new Date().toISOString(),
    }

    // Optimistically add the comment to the UI
    setComments([...comments, tempComment])
    form.reset()

    try {
      const { success, error, comment } = await addComment(postId, values.content)

      if (error) {
        // Remove the temporary comment on error
        setComments(comments => comments.filter(c => c.id !== tempComment.id))
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (success && comment) {
        // Replace the temporary comment with the real one from the server
        setComments(comments => 
          comments.map(c => 
            c.id === tempComment.id 
              ? {
                  ...comment,
                  author: {
                    id: "default-author-id",
                    name: "Default Author",
                    avatar: "/default-avatar.svg",
                    role: "Student",
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
      }
    } catch (error) {
      // Remove the temporary comment on error
      setComments(comments => comments.filter(c => c.id !== tempComment.id))
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleReaction = async (commentId: string, type: string) => {
    // Optimistically update the UI first
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        const existingReactionIndex = comment.reactions.findIndex(
          (r) => r.type === type && r.author.id === "current-user"
        )

        if (existingReactionIndex >= 0) {
          // Optimistically remove the reaction
          return {
            ...comment,
            reactions: comment.reactions.filter((_, i) => i !== existingReactionIndex),
          }
        } else {
          // Optimistically add the reaction
          return {
            ...comment,
            reactions: [
              ...comment.reactions,
              {
                id: `temp-${Date.now()}`,
                type,
                author: {
                  id: "current-user",
                  name: "Current User",
                  avatar: "/placeholder.svg",
                  role: "Student" as const,
                },
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }
      }
      return comment
    })

    // Update the UI immediately
    setComments(updatedComments)

    try {
      const { success, error } = await addCommentReaction(commentId, type)

      if (error) {
        // Revert the optimistic update on error
        setComments((prevComments) => {
          return prevComments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                reactions: comments.find(c => c.id === commentId)?.reactions || comment.reactions
              }
            }
            return comment
          })
        })
        
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (!success) {
        // Revert the optimistic update if not successful
        setComments((prevComments) => {
          return prevComments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                reactions: comments.find(c => c.id === commentId)?.reactions || comment.reactions
              }
            }
            return comment
          })
        })
        
        toast({
          title: "Error",
          description: "Failed to update reaction",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Revert the optimistic update on error
      setComments((prevComments) => {
        return prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions: comments.find(c => c.id === commentId)?.reactions || comment.reactions
            }
          }
          return comment
        })
      })

      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      })
    }
  }

  const reactionEmojis = ["👍", "❤️", "😂"]

  return (
    <div className="border-t p-4  w-full">
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
                <p className="mt-1 text-sm break-words whitespace-pre-wrap max-w-[500px] ">{comment.content}</p>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex gap-1">
                  {reactionEmojis.map((emoji) => {
                    const hasReacted = comment.reactions.some(
                      (r) => r.type === emoji && r.author.id === "current-user"
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Current user" />
            <AvatarFallback>CU</AvatarFallback>
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
    </div>
  )
}
