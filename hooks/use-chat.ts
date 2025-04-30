"use client"

import { useState, useEffect } from "react"
import { mockMessages } from "@/data/mock/messages"
import type { Message } from "@/types/chat"

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([])

  // Load initial messages for the room
  useEffect(() => {
    const roomMessages = mockMessages.filter((message) => message.roomId === roomId)
    setMessages(roomMessages)
  }, [roomId])

  // Send a new message
  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      roomId,
      content,
      senderId: "current-user",
      senderName: "Current User",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])
  }

  return {
    messages,
    sendMessage,
  }
}
