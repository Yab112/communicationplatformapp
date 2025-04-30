"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"

interface MessageItemProps {
  message: Message
  onOpenProfile?: (userId: string) => void
}

export function MessageItem({ message, onOpenProfile }: MessageItemProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isCurrentUser = message.senderId === "current-user"

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleAvatarClick = () => {
    if (onOpenProfile && !isCurrentUser) {
      onOpenProfile(message.senderId)
    }
  }

  return (
    <motion.div className={cn("flex gap-3 mb-4", isCurrentUser && "flex-row-reverse")} variants={messageVariants}>
      <Avatar
        className={`h-8 w-8 flex-shrink-0 ${!isCurrentUser ? "cursor-pointer hover:opacity-80" : ""}`}
        onClick={handleAvatarClick}
      >
        <AvatarImage src={message.senderAvatar || "/placeholder.svg?height=32&width=32"} alt={message.senderName} />
        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className={cn("flex max-w-[80%] flex-col", isCurrentUser ? "items-end" : "items-start")}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-lg p-3",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border border-primary/10 text-foreground",
                )}
                onClick={() => setShowDetails(!showDetails)}
              >
                {!isCurrentUser && (
                  <p
                    className="mb-1 text-xs font-medium cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onOpenProfile) onOpenProfile(message.senderId)
                    }}
                  >
                    {message.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side={isCurrentUser ? "left" : "right"} align="center">
              {formattedTime}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showDetails && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </p>
        )}
      </div>
    </motion.div>
  )
}
