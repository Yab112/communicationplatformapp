"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Plus, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatRoom } from "@/types/chat"
import { UserStatus } from "@/types/user"
import useMobile from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getChatRooms } from "@/lib/actions/chat"
import { TeachersList } from "./teachers-list"
import { StudentsList } from "./students-list"

interface ChatSidebarProps {
  activeRoomId?: string
  onRoomChange: (room: ChatRoom) => void
  onClose?: () => void
}

type RoomFilter = "all" | "groups" | "students" | "teachers"

export function ChatSidebar({ activeRoomId, onRoomChange, onClose }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addDialogTab, setAddDialogTab] = useState<"teachers" | "students">("teachers")
  const isMobile = useMobile()
  const { toast } = useToast()
  const [activeFilter, setActiveFilter] = useState<RoomFilter>("all")
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchRooms = useCallback(async () => {
    if (!isMounted.current) return

    try {
      setIsLoading(true)
      const result = await getChatRooms()

      if (!isMounted.current) return

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      const fetchedRooms = result.chatRooms.map(room => ({
        ...room,
        avatar: room.avatar ?? undefined,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
        users: room.users?.map(user => ({
          ...user,
          joinedAt: user.joinedAt.toISOString(),
          user: {
            ...user.user,
            status: user.user.status as UserStatus,
            role: user.user.role as "teacher" | "student" | "admin"
          }
        })) || []
      }))
      
      if (isMounted.current) {
        setRooms(fetchedRooms)
      }
    } catch (error) {
      if (!isMounted.current) return
      toast({
        title: "Error",
        description: "Failed to fetch chat rooms",
        variant: "destructive",
      })
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [toast])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleRoomCreatedAndSelected = useCallback(async (roomId: string) => {
    try {
      setShowAddDialog(false)
      await fetchRooms()
      
      const newRoom = rooms.find(room => room.id === roomId)
      if (newRoom) {
        onRoomChange(newRoom)
      } else {
        toast({
          title: "Error",
          description: "Failed to find the created chat room",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select the new chat room",
        variant: "destructive",
      })
    }
  }, [rooms, onRoomChange, fetchRooms, toast])

  const getFilteredRooms = useCallback(() => {
    if (isLoading) return []
    
    let filtered = rooms

    // Apply filter based on the selected tab
    if (activeFilter === "groups") {
      filtered = filtered.filter(room => room.isGroup)
    } else if (activeFilter === "teachers") {
      filtered = filtered.filter(room => !room.isGroup && room.users.some(u => u.user.role === "teacher"))
    } else if (activeFilter === "students") {
      filtered = filtered.filter(room => !room.isGroup && room.users.some(u => u.user.role === "student"))
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [rooms, isLoading, activeFilter, searchQuery])

  const filteredRooms = getFilteredRooms()
  const emptyMessage = isLoading 
    ? "Loading chats..." 
    : activeFilter === "groups" 
      ? "No group chats found" 
      : activeFilter === "teachers" 
        ? "No teacher chats found" 
        : activeFilter === "students" 
          ? "No student chats found" 
          : "No chats found"

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="p-4 pb-2">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search chats..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4">
        <Button
          variant={activeFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveFilter("all")}
        >
          All
        </Button>
        <Button
          variant={activeFilter === "groups" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveFilter("groups")}
        >
          Groups
        </Button>
        <Button
          variant={activeFilter === "students" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveFilter("students")}
        >
          Students
        </Button>
        <Button
          variant={activeFilter === "teachers" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveFilter("teachers")}
        >
          Teachers
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 px-2 py-2">
          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            filteredRooms.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                isActive={activeRoomId === room.id}
                onClick={onRoomChange}
                type={room.isGroup ? "group" : room.users.some(u => u.user.role === "teacher") ? "teacher" : "student"}
              />
            ))
          )}
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={addDialogTab === "teachers" ? "default" : "outline"}
              onClick={() => setAddDialogTab("teachers")}
              className="flex-1"
            >
              Teachers
            </Button>
            <Button
              variant={addDialogTab === "students" ? "default" : "outline"}
              onClick={() => setAddDialogTab("students")}
              className="flex-1"
            >
              Students
            </Button>
          </div>
          <div className="mt-4">
            {addDialogTab === "teachers" ? (
              <TeachersList onSelect={handleRoomCreatedAndSelected} />
            ) : (
              <StudentsList onSelect={handleRoomCreatedAndSelected} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ChatRoomItemProps {
  room: ChatRoom
  isActive: boolean
  onClick: (room: ChatRoom) => void
  type: "group" | "teacher" | "student"
}

function ChatRoomItem({ room, isActive, onClick, type }: ChatRoomItemProps) {
  const otherUser = room.users.find((u) => u.user.role === (type === "teacher" ? "teacher" : "student"))
  const lastMessage = room.lastMessage
  const unreadCount = room.unreadCount

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(room)}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
        isActive ? "bg-primary/10" : "hover:bg-muted/50"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={room.avatar || otherUser?.user.image || undefined} alt={room.name} />
        <AvatarFallback>{room.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{room.name}</p>
          {lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage ? lastMessage.content : "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  )
}
