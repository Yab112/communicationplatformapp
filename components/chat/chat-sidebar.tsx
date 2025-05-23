"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Plus, X, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatRoom } from "@/types/chat"
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

export function ChatSidebar({ activeRoomId, onRoomChange, onClose }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addDialogTab, setAddDialogTab] = useState("teachers")
  const isMobile = useMobile()
  const { toast } = useToast()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      const result = await getChatRooms()

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setRooms(result.chatRooms.map(room => ({
        ...room,
        avatar: room.avatar ?? undefined,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
        users: room.users?.map(user => ({
          ...user,
          joinedAt: user.joinedAt.toISOString()
        }))
      })))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch chat rooms",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Group rooms by type
  const groupRooms = rooms.filter((room) => room.isGroup)
  const teacherDMs = rooms.filter((room) => !room.isGroup && room.users?.some(u => u.user.role === "teacher"))
  const studentDMs = rooms.filter((room) => !room.isGroup && room.users?.some(u => u.user.role === "student"))

  // Calculate total unread counts for each tab
  const groupUnreadCount = groupRooms.reduce((total, room) => total + room.unreadCount, 0)
  const teacherUnreadCount = teacherDMs.reduce((total, room) => total + room.unreadCount, 0)
  const studentUnreadCount = studentDMs.reduce((total, room) => total + room.unreadCount, 0)
  const totalUnreadCount = groupUnreadCount + teacherUnreadCount + studentUnreadCount

  // Filter rooms based on search query
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 bg-transparent">
        <div className="px-4">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger value="all" className="flex-1">
              All
              {totalUnreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {totalUnreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">
              Groups
              {groupUnreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {groupUnreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex-1">
              Teachers
              {teacherUnreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {teacherUnreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="students" className="flex-1">
              Students
              {studentUnreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {studentUnreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0 border-0 p-0">
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No chats found</div>
              ) : (
                filteredRooms.map((room) => (
                  <ChatRoomItem
                    key={room.id}
                    room={room}
                    isActive={activeRoomId === room.id}
                    onClick={() => onRoomChange(room)}
                    type={room.isGroup ? "group" : room.users?.some(u => u.user.role === "teacher") ? "teacher" : "student"}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups" className="mt-0 border-0 p-0">
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading groups...</div>
              ) : groupRooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No group chats found</div>
              ) : (
                groupRooms
                  .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((room) => (
                    <ChatRoomItem
                      key={room.id}
                      room={room}
                      isActive={activeRoomId === room.id}
                      onClick={() => onRoomChange(room)}
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
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading teacher chats...</div>
              ) : teacherDMs.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No teacher chats found</div>
              ) : (
                teacherDMs
                  .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((room) => (
                    <ChatRoomItem
                      key={room.id}
                      room={room}
                      isActive={activeRoomId === room.id}
                      onClick={() => onRoomChange(room)}
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
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading student chats...</div>
              ) : studentDMs.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No student chats found</div>
              ) : (
                studentDMs
                  .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((room) => (
                    <ChatRoomItem
                      key={room.id}
                      room={room}
                      isActive={activeRoomId === room.id}
                      onClick={() => onRoomChange(room)}
                      type="student"
                    />
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Add New Chat Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Chat</DialogTitle>
          </DialogHeader>
          <Tabs value={addDialogTab} onValueChange={setAddDialogTab} className="w-full bg-transparent">
            <TabsList className="grid w-full grid-cols-2 bg-transparent" >
              <TabsTrigger value="teachers">
                <Users className="h-4 w-4 mr-2" />
                Teachers
              </TabsTrigger>
              <TabsTrigger value="students">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
            </TabsList>
            <TabsContent value="teachers" className="mt-0 border-0 p-0">
              <TeachersList roomId={activeRoomId || ""} onOpenProfile={() => { }} />
            </TabsContent>
            <TabsContent value="students" className="mt-0 border-0 p-0">
              <StudentsList roomId={activeRoomId || ""} onOpenProfile={() => { }} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
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
  const otherUser = room.users?.find(u => u.user.role === type)
  const status = otherUser?.user.status || "offline"

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg">{room.name.charAt(0)}</span>
        </div>
        {!room.isGroup && (
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
              status === "online" ? "bg-green-500" : "bg-gray-400"
            )}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium">{room.name}</p>
          {room.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {new Date(room.lastMessage.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        {room.lastMessage && (
          <p className="truncate text-sm text-muted-foreground">
            {room.lastMessage.senderName}: {room.lastMessage.content}
          </p>
        )}
      </div>
      {room.unreadCount > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {room.unreadCount}
        </div>
      )}
    </motion.button>
  )
}
