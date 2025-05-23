"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import useMobile from "@/hooks/use-mobile"
import { ChatRoom } from "@/types/chat"
import { useChat } from "@/hooks/use-chat"
import { ProfileModal, ProfileType } from "../profile/profile-modal"
import { ChatRoomHeader } from "./chat-room-header"
import { ChatMessages } from "./chat-messages"
import { MessageInput } from "./message-input"
import { ChatSidebar } from "./chat-sidebar"
import { useToast } from "@/hooks/use-toast"
import { createOrGetDMRoom } from "@/lib/actions/chat"
import { useSession } from "next-auth/react"
import { TeachersList } from "./teachers-list"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function ChatPage() {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTeachersList, setShowTeachersList] = useState(false)
  const { messages, sendMessage } = useChat(activeRoom?.id || "")
  const isMobile = useMobile()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { data: session } = useSession()

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)

  const handleRoomChange = (room: ChatRoom) => {
    setActiveRoom(room)
    if (isMobile) setSidebarOpen(false)
  }

  const handleOpenProfile = (userId: string) => {
    // In a real app, you would fetch the user's profile from the API
    // For now, we'll just set a basic profile
    const profile: ProfileType = {
      id: userId,
      name: "User", // This should be fetched from the API
      image: "",
      role: "user",
      department: "",
      status: "offline",
      email: "",
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSelectedProfile(profile)
    setIsProfileModalOpen(true)
  }

  const handleStartDM = async (profileId: string) => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to start a conversation",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createOrGetDMRoom(profileId)

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      handleRoomChange(result.room)
      setIsProfileModalOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Scroll to bottom on new messages or room change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, activeRoom?.id])

  return (
    <div className="flex h-[calc(100vh-var(--spacing-header))]">
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
            <div className="flex flex-col h-full">
              <ChatSidebar
                activeRoomId={activeRoom?.id}
                onRoomChange={handleRoomChange}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Main chat area with message bubbles */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeRoom ? (
            <>
              <ChatRoomHeader room={activeRoom} onOpenProfile={handleOpenProfile} />
              <div className="relative flex-1 overflow-hidden">
                <ChatMessages messages={messages} onOpenProfile={handleOpenProfile} messagesEndRef={messagesEndRef} />
                <div ref={messagesEndRef} />
                <MessageInput roomId={activeRoom.id} onSendMessage={sendMessage} />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium">No chat selected</h3>
                <p className="text-sm text-muted-foreground">Select a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        onStartDM={handleStartDM}
      />

      {/* Teachers List Dialog */}
      <Dialog open={showTeachersList} onOpenChange={setShowTeachersList}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <TeachersList roomId={activeRoom?.id || ""} onOpenProfile={handleOpenProfile} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
