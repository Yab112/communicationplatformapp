import type { ChatRoom } from "@/types/chat"

export const mockChatRooms: ChatRoom[] = [
  {
    id: "room-1",
    name: "CS101 Section Group",
    isGroup: true,
    lastMessage: {
      content: "Don't forget to submit your assignments by Friday!",
      senderName: "Dr. Alan Turing",
      timestamp: "2023-04-22T15:30:00Z",
    },
    unreadCount: 3,
    participants: ["user-1", "user-2", "user-3", "user-4", "user-5"],
  },
  {
    id: "room-2",
    name: "Dr. Alan Turing",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    lastMessage: {
      content: "Let me know if you have any questions about the project.",
      senderName: "Dr. Alan Turing",
      timestamp: "2023-04-21T10:15:00Z",
    },
    unreadCount: 0,
  },
  {
    id: "room-3",
    name: "Engineering Study Group",
    isGroup: true,
    lastMessage: {
      content: "I've shared some notes on the thermodynamics chapter.",
      senderName: "Emily Chen",
      timestamp: "2023-04-20T14:45:00Z",
    },
    unreadCount: 5,
    participants: ["user-2", "user-5", "user-10", "user-11"],
  },
  {
    id: "room-4",
    name: "Prof. Marie Curie",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    lastMessage: {
      content: "Your research proposal looks promising. Let's discuss it tomorrow.",
      senderName: "Prof. Marie Curie",
      timestamp: "2023-04-19T16:20:00Z",
    },
    unreadCount: 1,
  },
  {
    id: "room-5",
    name: "Computer Science Club",
    isGroup: true,
    lastMessage: {
      content: "The hackathon is scheduled for next month. Start forming your teams!",
      senderName: "Robert Johnson",
      timestamp: "2023-04-18T09:30:00Z",
    },
    unreadCount: 0,
    participants: ["user-1", "user-3", "user-4", "user-11", "user-14"],
  },
]
