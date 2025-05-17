export interface Message {
    id: string
    roomId: string
    content: string
    senderId: string
    senderName: string
    senderAvatar?: string
    timestamp: string
    fileUrl?: string
    fileName?: string
    fileType?: string
    fileSize?: number
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
    participants?: string[]
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
  