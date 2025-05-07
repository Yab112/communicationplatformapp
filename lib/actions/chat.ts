"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { messageSchema, type MessageFormValues } from "@/lib/validator/message"

export async function getChatRooms() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const chatRooms = await db.chatRoom.findMany({
      include: {
        users: {
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
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
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
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Calculate unread messages for each room
    const roomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount = await db.message.count({
          where: {
            chatRoomId: room.id,
            senderId: { not: user.id },
            createdAt: {
              gt: room.users.find(u => u.userId === user.id)?.joinedAt || new Date(0)
            }
          },
        })

        return {
          ...room,
          unreadCount,
        }
      }),
    )

    return { chatRooms: roomsWithUnreadCount }
  } catch (error) {
    return { error: "Failed to fetch chat rooms" }
  }
}

export async function getChatRoomMessages(roomId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Check if user is a member of the room
    const isMember = await db.chatRoom.findFirst({
      where: {
        id: roomId,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!isMember) {
      return { error: "Not a member of this chat room" }
    }

    const messages = await db.message.findMany({
      where: {
        chatRoomId: roomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Update unread count
    await db.chatRoomUser.update({
      where: {
        userId_chatRoomId: {
          userId: user.id,
          chatRoomId: roomId,
        },
      },
      data: {
        unreadCount: 0,
      },
    })

    return { messages }
  } catch (error) {
    return { error: "Failed to fetch messages" }
  }
}

export async function sendMessage(data: MessageFormValues) {
  try {
    // Validate input
    const validatedData = messageSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Check if user is a member of the room
    const isMember = await db.chatRoom.findFirst({
      where: {
        id: validatedData.chatRoomId,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!isMember) {
      return { error: "Not a member of this chat room" }
    }

    // Create message
    const message = await db.message.create({
      data: {
        content: validatedData.content,
        senderId: user.id,
        chatRoomId: validatedData.chatRoomId,
        ...(validatedData.attachments?.[0] && {
          fileUrl: validatedData.attachments[0].url,
          fileName: validatedData.attachments[0].name,
          fileType: validatedData.attachments[0].type,
          fileSize: validatedData.attachments[0].size,
        }),
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

    // Update chat room's updatedAt
    await db.chatRoom.update({
      where: {
        id: validatedData.chatRoomId,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    revalidatePath(`/chat`)
    return { success: true, message }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to send message" }
  }
}

export async function createChatRoom(name: string, memberIds: string[]) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Ensure current user is included in members
    if (!memberIds.includes(user.id)) {
      memberIds.push(user.id)
    }

    const chatRoom = await db.chatRoom.create({
      data: {
        name,
        users: {
          create: memberIds.map((id) => ({
            userId: id,
            isAdmin: id === user.id,
          })),
        },
      },
    })

    revalidatePath("/chat")
    return { success: true, chatRoom }
  } catch (error) {
    return { error: "Failed to create chat room" }
  }
}
