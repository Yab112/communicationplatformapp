"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoomOptionsMenu } from "./room-options-menu"
import { ChatRoom } from "@/types/chat"

interface ChatRoomHeaderProps {
  room: ChatRoom
  onOpenProfile?: (userId: string) => void
}

export function ChatRoomHeader({ room, onOpenProfile }: ChatRoomHeaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleAvatarClick = () => {
    if (!room.isGroup && onOpenProfile) {
      // For DMs, we can extract the user ID from the room
      // In a real app, you would have the actual user ID stored in the room object
      // For now, we'll use a mock ID based on the room name
      const mockUserId = `user-${room.name.toLowerCase().replace(/\s+/g, "-")}`
      onOpenProfile(mockUserId)
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4 h-16">
      <div className="flex items-center gap-3">
        <Avatar
          className={`h-10 w-10 ${!room.isGroup ? "cursor-pointer hover:opacity-80" : ""}`}
          onClick={handleAvatarClick}
        >
          {room.isGroup ? (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
              <span className="text-lg">{room.name.charAt(0)}</span>
            </div>
          ) : (
            <>
              <AvatarImage src={room.avatar || "/placeholder.svg?height=40&width=40"} alt={room.name} />
              <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
            </>
          )}
        </Avatar>
        <div>
          <h2
            className={`font-medium ${!room.isGroup ? "cursor-pointer hover:underline" : ""}`}
            onClick={handleAvatarClick}
          >
            {room.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {room.isGroup ? `${room.participants?.length || 0} participants` : "Direct Message"}
          </p>
        </div>
      </div>

      <RoomOptionsMenu room={room} onOpenProfile={onOpenProfile} />
    </div>
  )
}
