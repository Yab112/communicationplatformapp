import type { Message } from "@/types/chat"

export const mockMessages: Message[] = [
  // CS101 Section Group
  {
    id: "msg-1",
    roomId: "room-1",
    content: "Welcome to the CS101 Section Group! This is where we'll discuss course materials and assignments.",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-20T09:00:00Z",
  },
  {
    id: "msg-2",
    roomId: "room-1",
    content: "Hello everyone! Looking forward to learning with you all this semester.",
    senderId: "user-3",
    senderName: "Jane Smith",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-20T09:05:00Z",
  },
  {
    id: "msg-3",
    roomId: "room-1",
    content:
      "Quick reminder: The first assignment is due next Monday. Make sure to review the lecture notes before starting.",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-20T10:15:00Z",
  },
  {
    id: "msg-4",
    roomId: "room-1",
    content: "Dr. Turing, will we need to implement all the algorithms discussed in class for the assignment?",
    senderId: "user-4",
    senderName: "Robert Johnson",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-20T10:20:00Z",
  },
  {
    id: "msg-5",
    roomId: "room-1",
    content:
      "Good question, Robert. You'll need to implement the sorting algorithms we covered, but not the graph algorithms. Those will be part of the next assignment.",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-20T10:25:00Z",
  },
  {
    id: "msg-6",
    roomId: "room-1",
    content: "Thanks for the clarification!",
    senderId: "user-4",
    senderName: "Robert Johnson",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-20T10:27:00Z",
  },
  {
    id: "msg-7",
    roomId: "room-1",
    content:
      "I've uploaded some additional resources on sorting algorithms to the course portal. You might find them helpful for the assignment.",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T14:00:00Z",
  },
  {
    id: "msg-8",
    roomId: "room-1",
    content: "Don't forget to submit your assignments by Friday!",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-22T15:30:00Z",
  },

  // Direct message with Dr. Alan Turing
  {
    id: "msg-9",
    roomId: "room-2",
    content: "Hello Dr. Turing, I wanted to discuss my project idea with you.",
    senderId: "current-user",
    senderName: "Current User",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T09:45:00Z",
  },
  {
    id: "msg-10",
    roomId: "room-2",
    content: "Of course! What are you thinking of working on?",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T09:50:00Z",
  },
  {
    id: "msg-11",
    roomId: "room-2",
    content:
      "I'm interested in developing a machine learning algorithm for predicting student performance based on their engagement patterns.",
    senderId: "current-user",
    senderName: "Current User",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T09:55:00Z",
  },
  {
    id: "msg-12",
    roomId: "room-2",
    content: "That sounds like an interesting project! Have you considered what features you'll use for your model?",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T10:00:00Z",
  },
  {
    id: "msg-13",
    roomId: "room-2",
    content:
      "I'm thinking of using attendance, assignment completion rates, quiz scores, and forum participation as initial features.",
    senderId: "current-user",
    senderName: "Current User",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T10:05:00Z",
  },
  {
    id: "msg-14",
    roomId: "room-2",
    content:
      "Those are good starting points. You might also want to consider time spent on the learning management system and patterns of activity throughout the semester.",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T10:10:00Z",
  },
  {
    id: "msg-15",
    roomId: "room-2",
    content: "Let me know if you have any questions about the project.",
    senderId: "user-1",
    senderName: "Dr. Alan Turing",
    senderAvatar: "/placeholder.svg?height=40&width=40",
    timestamp: "2023-04-21T10:15:00Z",
  },
]
