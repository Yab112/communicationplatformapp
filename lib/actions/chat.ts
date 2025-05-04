"use server"

import { z } from "zod"
import prisma from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"

// Validation schemas
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message is too long"),
  chatRoomId: z.string().min(1, "Chat room ID is required"),
})

const chatRoomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isGroup: z.boolean().default(false),
  avatar: z.string().optional(),
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
})

// Get all chat rooms for the current user
export async function getChatRooms() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view chat rooms" }
    }

    const chatRoomUsers = await prisma.chatRoomUser.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        chatRoom: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    status: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                timestamp: "desc",
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Transform the data to match the frontend structure
    return chatRoomUsers.map((chatRoomUser) => {
      const chatRoom = chatRoomUser.chatRoom
      const lastMessage = chatRoom.messages[0]

      // For direct messages, set the name to the other participant's name
      let name = chatRoom.name
      let avatar = chatRoom.avatar

      if (!chatRoom.isGroup && chatRoom.participants.length === 2) {
        const otherParticipant = chatRoom.participants.find((p) => p.user.id !== currentUser.id)

        if (otherParticipant) {
          name = otherParticipant.user.name
          avatar = otherParticipant.user.image
        }
      }

      return {
        id: chatRoom.id,
        name,
        avatar: avatar || undefined,
        isGroup: chatRoom.isGroup,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderName: lastMessage.sender.name,
              timestamp: lastMessage.timestamp.toISOString(),
            }
          : undefined,
        unreadCount: chatRoomUser.unreadCount,
        participants: chatRoom.participants.map((p) => p.user.id),
      }
    })
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    throw new Error("Failed to fetch chat rooms")
  }
}

// Get messages for a specific chat room
export async function getMessages(chatRoomId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view messages" }
    }

    // Check if the user is a participant in the chat room
    const chatRoomUser = await prisma.chatRoomUser.findUnique({
      where: {
        userId_chatRoomId: {
          userId: currentUser.id,
          chatRoomId,
        },
      },
    })

    if (!chatRoomUser) {
      return { error: "You are not a participant in this chat room" }
    }

    // Reset unread count
    await prisma.chatRoomUser.update({
      where: {
        userId_chatRoomId: {
          userId: currentUser.id,
          chatRoomId,
        },
      },
      data: {
        unreadCount: 0,
      },
    })

    const messages = await prisma.message.findMany({
      where: {
        chatRoomId,
      },
      orderBy: {
        timestamp: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Transform the data to match the frontend structure
    return messages.map((message) => ({
      id: message.id,
      roomId: message.chatRoomId,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.image || "/placeholder.svg?height=40&width=40",
      timestamp: message.timestamp.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw new Error("Failed to fetch messages")
  }
}

// Send a message
export async function sendMessage(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to send a message" }
    }

    const parsed = messageSchema.parse({
      content: formData.get("content"),
      chatRoomId: formData.get("chatRoomId"),
    })

    // Check if the user is a participant in the chat room
    const chatRoomUser = await prisma.chatRoomUser.findUnique({
      where: {
        userId_chatRoomId: {
          userId: currentUser.id,
          chatRoomId: parsed.chatRoomId,
        },
      },
    })

    if (!chatRoomUser) {
      return { error: "You are not a participant in this chat room" }
    }

    const message = await prisma.message.create({
      data: {
        content: parsed.content,
        sender: {
          connect: { id: currentUser.id },
        },
        chatRoom: {
          connect: { id: parsed.chatRoomId },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update unread count for all participants except the sender
    await prisma.chatRoomUser.updateMany({
      where: {
        chatRoomId: parsed.chatRoomId,
        userId: {
          not: currentUser.id,
        },
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    })

    // Create notifications for all participants except the sender
    const participants = await prisma.chatRoomUser.findMany({
      where: {
        chatRoomId: parsed.chatRoomId,
        userId: {
          not: currentUser.id,
        },
      },
      select: {
        userId: true,
      },
    })

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: parsed.chatRoomId },
      select: { name: true, isGroup: true },
    })

    if (chatRoom) {
      // Batch create notifications
      await prisma.notification.createMany({
        data: participants.map((participant) => ({
          type: "MESSAGE",
          title: chatRoom.isGroup ? `New message in ${chatRoom.name}` : `New message from ${currentUser.name}`,
          message: parsed.content.length > 50 ? `${parsed.content.substring(0, 50)}...` : parsed.content,
          userId: participant.userId,
        })),
      })
    }

    revalidatePath("/chat")

    return {
      success: true,
      message: {
        id: message.id,
        roomId: message.chatRoomId,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderAvatar: message.sender.image || "/placeholder.svg?height=40&width=40",
        timestamp: message.timestamp.toISOString(),
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

// Create a new chat room
export async function createChatRoom(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to create a chat room" }
    }

    const participantIdsString = formData.get("participantIds") as string
    const participantIds = JSON.parse(participantIdsString)

    const parsed = chatRoomSchema.parse({
      name: formData.get("name"),
      isGroup: formData.get("isGroup") === "true",
      avatar: formData.get("avatar"),
      participantIds,
    })

    // Make sure the current user is included in the participants
    if (!parsed.participantIds.includes(currentUser.id)) {
      parsed.participantIds.push(currentUser.id)
    }

    // For direct messages, check if a chat room already exists
    if (!parsed.isGroup && parsed.participantIds.length === 2) {
      const existingChatRoom = await prisma.chatRoom.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: parsed.participantIds,
              },
            },
          },
          AND: [
            {
              participants: {
                some: {
                  userId: parsed.participantIds[0],
                },
              },
            },
            {
              participants: {
                some: {
                  userId: parsed.participantIds[1],
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      if (existingChatRoom) {
        return {
          success: true,
          chatRoom: {
            id: existingChatRoom.id,
            name: existingChatRoom.name,
            avatar: existingChatRoom.avatar || undefined,
            isGroup: existingChatRoom.isGroup,
            participants: existingChatRoom.participants.map((p) => p.userId),
          },
        }
      }
    }

    // Create the chat room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: parsed.name,
        isGroup: parsed.isGroup,
        avatar: parsed.avatar,
        participants: {
          create: parsed.participantIds.map((userId) => ({
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
    })

    revalidatePath("/chat")

    return {
      success: true,
      chatRoom: {
        id: chatRoom.id,
        name: chatRoom.name,
        avatar: chatRoom.avatar || undefined,
        isGroup: chatRoom.isGroup,
        participants: parsed.participantIds,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}
