"use client"

import { Message } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface MessageBubbleProps {
    message: Message
    isOwnMessage?: boolean
}

export function MessageBubble({ message, isOwnMessage = false }: MessageBubbleProps) {
    return (
        <div className={cn(
            "flex items-start gap-2",
            isOwnMessage && "flex-row-reverse"
        )}>
            <Avatar className="h-8 w-8">
                <AvatarImage 
                    src={message.senderImage || "/placeholder.svg"} 
                    alt={message.senderName} 
                />
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
            </Avatar>
            <div className={cn(
                "flex flex-col gap-1",
                isOwnMessage && "items-end"
            )}>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{message.senderName}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                </div>
                <div className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%] break-words",
                    isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                    {message.content}
                    {message.attachments?.map((attachment, index) => (
                        <div key={index} className="mt-2">
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                            >
                                {attachment.name}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 