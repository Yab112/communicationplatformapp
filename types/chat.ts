import { UserStatus } from "@/types/user"

export interface Message {
    id: string
    roomId: string
    content: string
    senderId: string
    senderName: string
    senderImage?: string
    timestamp: string
    attachments?: {
      url: string
      name: string
      type: string
      size: number
    }[]
  }
  
  export interface ChatRoomUser {
    id: string
    userId: string
    chatRoomId: string
    isAdmin: boolean
    joinedAt: string
    unreadCount: number
    user: {
      id: string
      name: string
      image: string | null
      status: UserStatus
      role: "teacher" | "student" | "admin"
    }
  }
  
  export interface ChatRoom {
    id: string
    name: string
    avatar?: string
    isGroup: boolean
    lastMessage?: {
      content: string
      senderName: string
      timestamp: string
    }
    unreadCount: number
    users: ChatRoomUser[]
    createdAt: string
    updatedAt: string
  }
  
  export interface Resource {
    id: string
    title: string
    description: string
    fileType: string
    fileSize: string
    type: "assignment" | "quiz" | "material"
    dueDate?: string
  }
  
  export type Intent = {
    type: 'course_info' | 'schedule' | 'grades' | 'facilities' | 'events' | 'general' | 'unknown'
    confidence: number
    entities?: Record<string, string>
  }
  
  export type ChatRequest = {
    message: string
    context?: {
      userId?: string
      sessionId?: string
      previousMessages?: ChatMessage[]
    }
  }
  
  export type ChatResponse = {
    response: string
    intent: Intent
  }
  
  export type ChatMessage = {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }
  
  export type IntentHandler = {
    handle: (message: string, entities?: Record<string, string>) => Promise<string>
  }
  