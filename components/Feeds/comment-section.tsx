"use client"

import { useState } from "react"
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
  const { toast } = useToast()

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (values: CommentFormValues) => {
    try {
      const { success, error, comment } = await addComment(postId, values.content)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (success && comment) {
        const completeComment: Comment = {
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
        setComments([...comments, completeComment])
        form.reset()
        toast({
          title: "Success",
          description: "Comment added successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleReaction = async (commentId: string, type: string) => {
    try {
      const { success, error } = await addCommentReaction(commentId, type)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (success) {
        // Update the local state to reflect the new reaction
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const existingReactionIndex = comment.reactions.findIndex(
                (r) => r.type === type && r.author.id === "current-user"
              )

              if (existingReactionIndex >= 0) {
                // Remove the reaction
                return {
                  ...comment,
                  reactions: comment.reactions.filter((_, i) => i !== existingReactionIndex),
                }
              } else {
                // Add the reaction
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
                        role: "Student",
                      },
                      createdAt: new Date(comment.createdAt).toISOString(),
                    },
                  ],
                }
              }
            }
            return comment
          })
        )
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      })
    }
  }

  const reactionEmojis = ["👍", "❤️", "😂"]

  return (
    <div className="border-t p-4">
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
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
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
