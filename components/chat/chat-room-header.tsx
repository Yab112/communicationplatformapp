"use client"

import { useMemo } from "react"
import { ChatRoom } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video } from "lucide-react"
import { RoomOptionsMenu } from "./room-options-menu"

interface ChatRoomHeaderProps {
  room: ChatRoom
  onOpenProfile?: (userId: string) => void
  onDelete?: () => Promise<void>
  onSelect?: (room: ChatRoom) => void
}

export function ChatRoomHeader({ room, onOpenProfile, onDelete, onSelect }: ChatRoomHeaderProps) {
  const isOnline = useMemo(() => {
    return room.users.some(u => u.user.status === "online")
  }, [room.users])

  const participantCount = useMemo(() => {
    return room.users.length
  }, [room.users])

  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={room.avatar || "/placeholder.svg"} 
            alt={room.name} 
          />
          <AvatarFallback>{room.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{room.name}</h2>
          <p className="text-sm text-muted-foreground">
            {room.isGroup 
              ? `${participantCount} participants`
              : isOnline ? "Online" : "Offline"
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <RoomOptionsMenu 
          room={room}
          onOpenProfile={onOpenProfile}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}
