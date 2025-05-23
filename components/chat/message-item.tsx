import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileAttachment } from "@/components/chat/file-attachment"
import type { Message } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"

interface MessageItemProps {
  message: Message
  onOpenProfile?: (userId: string) => void
}

export function MessageItem({ message, onOpenProfile }: MessageItemProps) {
  const isCurrentUser = message.senderId === "current-user" // Replace with actual user ID check

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4",
        isCurrentUser && "flex-row-reverse"
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8 cursor-pointer",
          !isCurrentUser && "hover:opacity-80"
        )}
        onClick={() => !isCurrentUser && onOpenProfile?.(message.senderId)}
      >
        <AvatarImage src={message.senderImage} alt={message.senderName} />
        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-1",
          isCurrentUser && "items-end"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              !isCurrentUser && "cursor-pointer hover:underline"
            )}
            onClick={() => !isCurrentUser && onOpenProfile?.(message.senderId)}
          >
            {message.senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>

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

        {message.attachments?.map((attachment, index) => (
          <FileAttachment
            key={index}
            url={attachment.url}
            name={attachment.name}
            type={attachment.type}
            size={attachment.size}
          />
        ))}
      </div>
    </div>
  )
}
