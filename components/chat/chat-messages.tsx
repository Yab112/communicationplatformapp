"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { MessageItem } from "./message-item"
import { Message } from "@/types/chat"

interface ChatMessagesProps {
  messages: Message[]
  onOpenProfile?: (userId: string) => void
}

export function ChatMessages({ messages, onOpenProfile }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {}
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString()
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  const hasMessages = Object.keys(groupedMessages).length > 0

  return (
    <div className="flex-1 overflow-hidden pt-2" ref={scrollAreaRef}>
      <ScrollArea className="h-[calc(100vh-192px)]">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              >
                <span className="text-4xl">💬</span>
              </motion.div>
            </div>
            <h3 className="text-xl font-medium mb-1">Start a conversation</h3>
            <p className="text-muted-foreground">Send a message to begin chatting</p>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="mx-4 flex-shrink-0 text-xs text-muted-foreground">{date}</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {dateMessages.map((message) => (
                    <MessageItem key={message.id} message={message} onOpenProfile={onOpenProfile} />
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
