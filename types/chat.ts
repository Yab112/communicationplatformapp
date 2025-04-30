export interface Message {
    id: string
    roomId: string
    content: string
    senderId: string
    senderName: string
    senderAvatar?: string
    timestamp: string
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
  