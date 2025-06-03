"use client"

import { useState, useCallback, useMemo } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import useMobile from "@/hooks/use-mobile"
import { ChatRoom } from "@/types/chat"
import { ChatRoomHeader } from "./chat-room-header"
import { ChatMessages } from "./chat-messages"
import { MessageInput } from "./message-input"
import { ChatSidebar } from "./chat-sidebar"
import { useChat } from "@/hooks/use-chat"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function ChatPage() {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()
  const router = useRouter()

  // Use the useChat hook when a room is selected
  const {
    messages,
    isLoading,
    sendMessage
  } = useChat(activeRoom?.id || "")

  const handleRoomChange = useCallback((room: ChatRoom) => {
    setActiveRoom(room)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeRoom?.id) return

    try {
      await sendMessage(content)
    } catch {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }, [activeRoom?.id, sendMessage, toast])

  const handleOpenProfile = useCallback((userId: string) => {
    router.push(`/profile/${userId}`)
  }, [router])

  const handleDeleteRoom = useCallback(async () => {
    if (!activeRoom?.id) return

    try {
      // TODO: Implement room deletion
      toast({
        title: "Success",
        description: "Room deleted successfully",
      })
      setActiveRoom(null)
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      })
    }
  }, [activeRoom?.id, toast])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const sidebarClasses = useMemo(() => cn(
    "fixed inset-y-0 left-0 z-10 h-full w-80 flex-shrink-0 overflow-hidden border-r bg-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
    isMobile && !sidebarOpen && "-translate-x-full"
  ), [isMobile, sidebarOpen])

  return (
    <div className="flex h-[calc(100vh-var(--spacing-header))] bg-background">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-20 z-20 md:hidden"
          onClick={toggleSidebar}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="sr-only">Toggle chat sidebar</span>
        </Button>
      )}

      <div className={sidebarClasses}>
        <ChatSidebar
          activeRoomId={activeRoom?.id}
          onRoomChange={handleRoomChange}
          onClose={closeSidebar}
        />
      </div>

      <div className="flex flex-1 flex-col">
        {activeRoom ? (
          <>
            <ChatRoomHeader 
              room={activeRoom} 
              onOpenProfile={handleOpenProfile}
              onDelete={handleDeleteRoom}
            />
            <div className="relative flex-1 overflow-hidden">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading}
              />
              <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No chat selected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
