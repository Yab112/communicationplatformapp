"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "@/types/chat"
import { getMessages, sendMessage } from "@/lib/actions/chat"
import { useSession } from "next-auth/react"
import { useSocket } from "@/providers/socket-provider"

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()
  const { data: session } = useSession()

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const result = await getMessages(roomId)

        if ("error" in result) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setMessages(result as Message[])
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId) {
      fetchMessages()
    }
  }, [roomId, toast])

  // Join room when socket connects or room changes
  useEffect(() => {
    if (socket && isConnected && roomId) {
      // Join the room
      socket.emit("join-room", roomId)

      // Notify that user is online
      if (session?.user?.id) {
        socket.emit("user-online", session.user.id)
      }

      // Cleanup: leave room when component unmounts or room changes
      return () => {
        socket.emit("leave-room", roomId)
      }
    }
  }, [socket, isConnected, roomId, session?.user?.id])

  // Listen for new messages
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewMessage = (message: Message) => {
        if (message.roomId === roomId) {
          setMessages((prev) => [...prev, message])
        }
      }

      socket.on("new-message", handleNewMessage)

      return () => {
        socket.off("new-message", handleNewMessage)
      }
    }
  }, [socket, isConnected, roomId])

  // Listen for typing indicators
  useEffect(() => {
    if (socket && isConnected) {
      const handleUserTyping = (user: string) => {
        setTypingUsers((prev) => {
          if (!prev.includes(user)) {
            return [...prev, user]
          }
          return prev
        })
      }

      const handleUserStopTyping = (user: string) => {
        setTypingUsers((prev) => prev.filter((u) => u !== user))
      }

      socket.on("user-typing", handleUserTyping)
      socket.on("user-stop-typing", handleUserStopTyping)

      return () => {
        socket.off("user-typing", handleUserTyping)
        socket.off("user-stop-typing", handleUserStopTyping)
      }
    }
  }, [socket, isConnected])

  // Send message function
  const sendMessageHandler = useCallback(
    async (content: string) => {
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        })
        return
      }

      try {
        // Create form data
        const formData = new FormData()
        formData.append("content", content)
        formData.append("roomId", roomId)

        // Send to server
        const result = await sendMessage(formData)

        if ("error" in result) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        // Add the message to the local state
        setMessages((prev) => [...prev, result])

        // Emit to socket for real-time updates
        if (socket && isConnected) {
          socket.emit("send-message", result)
        }

        return result
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    },
    [roomId, socket, isConnected, session?.user, toast],
  )

  // Typing indicator functions
  const startTyping = useCallback(() => {
    if (socket && isConnected && session?.user) {
      socket.emit("typing", { roomId, user: session.user.name })
    }
  }, [socket, isConnected, roomId, session?.user])

  const stopTyping = useCallback(() => {
    if (socket && isConnected && session?.user) {
      socket.emit("stop-typing", { roomId, user: session.user.name })
    }
  }, [socket, isConnected, roomId, session?.user])

  return {
    messages,
    isLoading,
    typingUsers,
    sendMessage: sendMessageHandler,
    startTyping,
    stopTyping,
  }
}
