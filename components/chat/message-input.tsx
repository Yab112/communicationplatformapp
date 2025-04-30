"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { motion, AnimatePresence } from "framer-motion"
import type { z } from "zod"
import { messageSchema } from "@/lib/validator/message"

type MessageFormValues = z.infer<typeof messageSchema>

interface MessageInputProps {
  onSendMessage: (content: string) => void
}

const emojis = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🥸",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "👍",
  "👎",
]

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  })

  const { isSubmitting } = form.formState

  const handleSubmit = (values: MessageFormValues) => {
    if (values.content.trim()) {
      onSendMessage(values.content)
      form.reset()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      form.handleSubmit(handleSubmit)()
    }
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentContent = form.getValues("content")
      const newContent = currentContent.substring(0, start) + emoji + currentContent.substring(end)
      form.setValue("content", newContent, { shouldValidate: true })

      // Focus back on textarea and set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 10)
    }
    setIsEmojiPickerOpen(false)
  }

  // Auto-focus the textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className="border-t border-border bg-card p-4 sticky bottom-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-2">
          <div className="relative flex-1">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-[60px] max-h-[150px] resize-none pr-10 shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                      onKeyDown={handleKeyDown}
                      {...field}
                      ref={(e) => {
                        field.ref(e)
                        textareaRef.current = e as HTMLTextAreaElement
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 text-muted-foreground hover:text-primary"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-lg hover:bg-primary/10"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={form.watch("content") ? "active" : "inactive"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting || !form.watch("content")}
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  )
}
