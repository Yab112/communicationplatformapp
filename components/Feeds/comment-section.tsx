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

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

type CommentFormValues = z.infer<typeof commentSchema>

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentReactions, setCommentReactions] = useState<Record<string, string[]>>({})

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = (values: CommentFormValues) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content: values.content,
      author: {
        id: "current-user",
        name: "Current User",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "Student",
      },
      createdAt: new Date().toISOString(),
    }

    setComments([...comments, newComment])
    form.reset()
  }

  const toggleReaction = (commentId: string, emoji: string) => {
    setCommentReactions((prev) => {
      const currentReactions = prev[commentId] || []
      const userIndex = currentReactions.indexOf(emoji)

      if (userIndex >= 0) {
        // Remove reaction if already exists
        const newReactions = [...currentReactions]
        newReactions.splice(userIndex, 1)
        return { ...prev, [commentId]: newReactions }
      } else {
        // Add reaction
        return { ...prev, [commentId]: [...currentReactions, emoji] }
      }
    })
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
                  {reactionEmojis.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      className={`text-sm px-1.5 py-0.5 rounded-full ${
                        commentReactions[comment.id]?.includes(emoji)
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "text-[var(--color-muted-fg)] hover:bg-[var(--color-muted)]/10"
                      }`}
                      onClick={() => toggleReaction(comment.id, emoji)}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
                {commentReactions[comment.id]?.length > 0 && (
                  <span className="text-xs text-[var(--color-muted-fg)]">{commentReactions[comment.id].length}</span>
                )}
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
