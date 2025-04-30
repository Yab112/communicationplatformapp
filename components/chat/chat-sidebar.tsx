"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Plus, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { mockTeachers, mockStudents } from "@/data/mock/users"
import { ChatRoom } from "@/types/chat"
import useMobile from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  rooms: ChatRoom[]
  activeRoomId: string
  onRoomChange: (roomId: string) => void
  onClose?: () => void
}

export function ChatSidebar({ rooms, activeRoomId, onRoomChange, onClose }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRooms, setFilteredRooms] = useState(rooms)
  const [activeTab, setActiveTab] = useState("all")
  const isMobile = useMobile()

  // Group rooms by type
  const groupRooms = rooms.filter((room) => room.isGroup)
  const teacherDMs = rooms.filter((room) => !room.isGroup && mockTeachers.some((t) => t.name === room.name))
  const studentDMs = rooms.filter((room) => !room.isGroup && mockStudents.some((s) => s.name === room.name))

  // Calculate total unread counts for each tab
  const groupUnreadCount = groupRooms.reduce((total, room) => total + room.unreadCount, 0)
  const teacherUnreadCount = teacherDMs.reduce((total, room) => total + room.unreadCount, 0)
  const studentUnreadCount = studentDMs.reduce((total, room) => total + room.unreadCount, 0)
  const totalUnreadCount = groupUnreadCount + teacherUnreadCount + studentUnreadCount

  useEffect(() => {
    let filtered = []

    // Filter based on active tab
    switch (activeTab) {
      case "groups":
        filtered = groupRooms
        break
      case "teachers":
        filtered = teacherDMs
        break
      case "students":
        filtered = studentDMs
        break
      default:
        filtered = rooms
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Only update state if the filtered results have actually changed
    // This prevents unnecessary re-renders
    if (JSON.stringify(filtered) !== JSON.stringify(filteredRooms)) {
      setFilteredRooms(filtered)
    }
  }, [searchQuery, rooms, activeTab, groupRooms, teacherDMs, studentDMs])

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
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 px-4">
          <TabsTrigger value="all" className="relative">
            All
            {totalUnreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs bg-primary text-primary-foreground">
                {totalUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="groups" className="relative">
            Groups
            {groupUnreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs bg-primary text-primary-foreground">
                {groupUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="teachers" className="relative">
            Teachers
            {teacherUnreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs bg-primary text-primary-foreground">
                {teacherUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="students" className="relative">
            Students
            {studentUnreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs bg-primary text-primary-foreground">
                {studentUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 border-0 p-0">
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {filteredRooms.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No chats found</div>
              ) : (
                filteredRooms.map((room) => (
                  <ChatRoomItem
                    key={room.id}
                    room={room}
                    isActive={activeRoomId === room.id}
                    onClick={() => onRoomChange(room.id)}
                    type={
                      room.isGroup ? "group" : mockTeachers.some((t) => t.name === room.name) ? "teacher" : "student"
                    }
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups" className="mt-0 border-0 p-0">
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {groupRooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No group chats found</div>
              ) : (
                groupRooms
                  .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((room) => (
                    <ChatRoomItem
                      key={room.id}
                      room={room}
                      isActive={activeRoomId === room.id}
                      onClick={() => onRoomChange(room.id)}
                      type="group"
                    />
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="teachers" className="mt-0 border-0 p-0">
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {teacherDMs.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No teacher chats found</div>
              ) : (
                teacherDMs
                  .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((room) => (
                    <ChatRoomItem
                      key={room.id}
                      room={room}
                      isActive={activeRoomId === room.id}
                      onClick={() => onRoomChange(room.id)}
                      type="teacher"
                    />
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="students" className="mt-0 border-0 p-0">
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {studentDMs.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No student chats found</div>
              ) : (
                studentDMs
                  .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((room) => (
                    <ChatRoomItem
                      key={room.id}
                      room={room}
                      isActive={activeRoomId === room.id}
                      onClick={() => onRoomChange(room.id)}
                      type="student"
                    />
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ChatRoomItemProps {
  room: ChatRoom
  isActive: boolean
  onClick: () => void
  type: "group" | "teacher" | "student"
}

function ChatRoomItem({ room, isActive, onClick, type }: ChatRoomItemProps) {
  // Different styling based on chat type
  const getBorderColor = () => {
    if (isActive) return "border-transparent"
    switch (type) {
      case "group":
        return "border-blue-200 dark:border-blue-800"
      case "teacher":
        return "border-purple-200 dark:border-purple-800"
      case "student":
        return "border-green-200 dark:border-green-800"
      default:
        return "border-transparent"
    }
  }

  const getAvatarStyle = () => {
    switch (type) {
      case "group":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      case "teacher":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
      case "student":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-primary/10"
    }
  }

  return (
    <motion.button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors border-l-4",
        getBorderColor(),
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
      )}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Avatar className="h-10 w-10 shrink-0">
        {room.isGroup ? (
          <div className={`flex h-full w-full items-center justify-center rounded-full ${getAvatarStyle()}`}>
            <span className="text-lg">{room.name.charAt(0)}</span>
          </div>
        ) : (
          <>
            <AvatarImage src={room.avatar || "/placeholder.svg?height=40&width=40"} alt={room.name} />
            <AvatarFallback className={getAvatarStyle()}>{room.name.charAt(0)}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{room.name}</p>
          {room.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(room.lastMessage.timestamp), { addSuffix: true })}
            </span>
          )}
        </div>
        {room.lastMessage && (
          <p className="text-xs text-muted-foreground truncate">
            {room.lastMessage.senderName}: {room.lastMessage.content}
          </p>
        )}
      </div>
      {room.unreadCount > 0 && (
        <Badge className="h-5 min-w-5 rounded-full px-1.5 py-0.5 text-xs bg-primary text-primary-foreground">
          {room.unreadCount}
        </Badge>
      )}
    </motion.button>
  )
}
