"use client"

import { useEffect, useRef } from "react"
import { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === session?.user?.id

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2",
                isOwnMessage && "flex-row-reverse"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.senderImage} alt={message.senderName} />
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  isOwnMessage
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="mt-1 text-xs opacity-70">
                  {format(new Date(message.timestamp), "h:mm a")}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
