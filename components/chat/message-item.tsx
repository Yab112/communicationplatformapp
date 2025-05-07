import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileAttachment } from "@/components/chat/file-attachment"
import type { Message } from "@/types/chat"

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const hasFile = Boolean(message.fileUrl && message.fileName && message.fileType)

  return (
    <div className={cn("flex w-full gap-2 mb-4", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex max-w-[75%] flex-col", isCurrentUser && "items-end")}>
        {!isCurrentUser && <span className="text-xs text-muted-foreground mb-1">{message.senderName}</span>}
        <div
          className={cn(
            "rounded-lg px-3 py-2",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {message.content}
          {hasFile && message.fileUrl && message.fileName && message.fileType && (
            <FileAttachment
              fileUrl={message.fileUrl}
              fileName={message.fileName}
              fileType={message.fileType}
              fileSize={message.fileSize || 0}
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1">{formattedTime}</span>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
