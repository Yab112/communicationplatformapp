"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import  useMobile  from "@/hooks/use-mobile"
import { ChatRoom } from "@/types/chat"
import { useChat } from "@/hooks/use-chat"
import { mockChatRooms } from "@/data/mock/chat-rooms"
import { ProfileModal, ProfileType } from "../profile/profile-modal"
import { mockStudents, mockTeachers } from "@/data/mock/users"
import { ChatRoomHeader } from "./chat-room-header"
import { ChatMessages } from "./chat-messages"
import { MessageInput } from "./message-input"
import { ChatSidebar } from "./chat-sidebar"

export function ChatPage() {
  const [activeRoom, setActiveRoom] = useState<ChatRoom>(mockChatRooms[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { messages, sendMessage } = useChat(activeRoom.id)
  const isMobile = useMobile()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)

  const handleRoomChange = (roomId: string) => {
    const room = mockChatRooms.find((r) => r.id === roomId)
    if (room) {
      setActiveRoom(room)
      if (isMobile) setSidebarOpen(false)
    }
  }

  const handleOpenProfile = (userId: string) => {
    // Find the user from either teachers or students list
    const teacher = mockTeachers.find((t) => t.id === userId)
    const student = mockStudents.find((s) => s.id === userId)

    const user = teacher || student

    if (user) {
      const profile: ProfileType = {
        id: user.id,
        name: user.name,
        image: user.image || "",
        role: user.role,
        department: user.department,
        status: user.status,
        email: user.email,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setSelectedProfile(profile)
      setIsProfileModalOpen(true)
    }
  }

  const handleStartDM = (profileId: string) => {
    // Find the user
    const teacher = mockTeachers.find((t) => t.id === profileId)
    const student = mockStudents.find((s) => s.id === profileId)

    const user = teacher || student

    if (user) {
      // In a real app, you would create a new DM room or navigate to an existing one
      // For now, we'll just simulate finding or creating a room
      const existingRoom = mockChatRooms.find((room) => !room.isGroup && room.name === user.name)

      if (existingRoom) {
        handleRoomChange(existingRoom.id)
      } else {
        // In a real app, you would create a new room here
        console.log(`Starting new DM with ${user.name}`)
      }

      setIsProfileModalOpen(false)
    }
  }

  useEffect(() => {
    // Scroll to bottom on new messages or room change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, activeRoom.id]) // Only depend on messages.length, not the entire messages array

  return (
    <div className="flex h-[calc(100vh-var(--spacing-header))] ">
      {/* Main content area with proper spacing */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile toggle button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-20 z-20 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Toggle chat sidebar</span>
          </Button>
        )}

        {/* Left sidebar with chat rooms */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={isMobile ? { x: "-100%" } : false}
            animate={isMobile ? { x: sidebarOpen ? 0 : "-100%" } : {}}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute inset-y-0 left-0 z-10 h-full w-80 flex-shrink-0 overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-card)] md:relative md:block",
              isMobile && !sidebarOpen && "hidden",
            )}
          >
            <ChatSidebar
              rooms={mockChatRooms}
              activeRoomId={activeRoom.id}
              onRoomChange={handleRoomChange}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Main chat area with message bubbles */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatRoomHeader room={activeRoom} onOpenProfile={handleOpenProfile} />

          <div className="relative flex-1 overflow-hidden" ref={messagesEndRef}>
            <ChatMessages messages={messages} onOpenProfile={handleOpenProfile} />
            <MessageInput onSendMessage={sendMessage} />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        onStartDM={handleStartDM}
      />
    </div>
  )
}
