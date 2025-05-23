"use client"

import { Message } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface MessageBubbleProps {
    message: Message
    onOpenProfile: (userId: string) => void
}

export function MessageBubble({ message, onOpenProfile }: MessageBubbleProps) {
    const isCurrentUser = message.senderId === "current-user" // Replace with actual current user ID

    return (
        <div
            className={cn(
                "flex items-start gap-2",
                isCurrentUser && "flex-row-reverse"
            )}
        >
            <Avatar
                className={cn(
                    "h-8 w-8 cursor-pointer hover:opacity-80",
                    isCurrentUser && "order-2"
                )}
                onClick={() => onOpenProfile(message.senderId)}
            >
                <AvatarImage
                    src={message.sender?.image || "/placeholder.svg?height=32&width=32"}
                    alt={message.sender?.name || "User"}
                />
                <AvatarFallback>
                    {(message.senderName || "U").charAt(0)}
                </AvatarFallback>
            </Avatar>

            <div
                className={cn(
                    "flex flex-col gap-1 max-w-[70%]",
                    isCurrentUser && "items-end"
                )}
            >
                <div
                    className={cn(
                        "rounded-lg px-4 py-2",
                        isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                    )}
                >
                    {message.content}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                        className={cn(
                            "cursor-pointer hover:underline",
                            isCurrentUser && "order-2"
                        )}
                        onClick={() => onOpenProfile(message.senderId)}
                    >
                        {message.senderId || "Unknown User"}
                    </span>
                    <span>{format(new Date(message.timestamp), "h:mm a")}</span>
                </div>
            </div>
        </div>
    )
} 