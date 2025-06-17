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
                role: true,
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
  } catch  {
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
  } catch  {
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
    console.log("Creating chat room with members--------------------------HH--------------------:", memberIds)
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
  } catch(error)  {
    console.error("Error creating chat room:", error)
    return { error: "Failed to create chat room" }
  }
}

export async function createOrGetDMRoom(otherUserId: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    // Check if a DM room already exists between these users
    const existingRoom = await db.chatRoom.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            userId: {
              in: [currentUser.id, otherUserId]
            }
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                status: true,
                role: true,
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc"
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })

    if (existingRoom) {
      // Calculate unread count for the current user
      const unreadCount = await db.message.count({
        where: {
          chatRoomId: existingRoom.id,
          senderId: { not: currentUser.id },
          createdAt: {
            gt: existingRoom.users.find(u => u.userId === currentUser.id)?.joinedAt || new Date(0)
          }
        },
      })

      return { 
        room: {
          ...existingRoom,
          avatar: existingRoom.avatar || undefined,
          users: existingRoom.users.map(user => ({
            ...user,
            joinedAt: user.joinedAt.toISOString()
          })),
          createdAt: existingRoom.createdAt.toISOString(),
          updatedAt: existingRoom.updatedAt.toISOString(),
          unreadCount,
          lastMessage: existingRoom.messages[0] ? {
            content: existingRoom.messages[0].content,
            senderName: existingRoom.messages[0].sender.name,
            timestamp: existingRoom.messages[0].createdAt.toISOString(),
          } : undefined,
        }
      }
    }

    // Create a new DM room
    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: { name: true }
    })

    if (!otherUser) {
      return { error: "User not found" }
    }

    const newRoom = await db.chatRoom.create({
      data: {
        name: otherUser.name,
        isGroup: false,
        users: {
          create: [
            { userId: currentUser.id },
            { userId: otherUserId }
          ]
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                status: true,
                role: true,
              }
            }
          }
        }
      }
    })

    return { 
      room: {
        ...newRoom,
        avatar: newRoom.avatar || undefined,
        users: newRoom.users.map(user => ({
          ...user,
          joinedAt: user.joinedAt.toISOString()
        })),
        createdAt: newRoom.createdAt.toISOString(),
        updatedAt: newRoom.updatedAt.toISOString(),
        unreadCount: 0,
        lastMessage: undefined,
      }
    }
  } catch (error) {
    console.error("Error creating/getting DM room:", error)
    return { error: "Failed to create/get DM room" }
  }
}

export async function createDirectMessage(userId: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    // Check if a DM room already exists between these users
    const existingRoom = await db.chatRoom.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            userId: {
              in: [currentUser.id, userId]
            }
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    })

    if (existingRoom) {
      return { chatRoom: existingRoom }
    }

    // Get the other user's details
    const otherUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        role: true
      }
    })

    if (!otherUser) {
      return { error: "User not found" }
    }

    // Create a new DM room
    const newRoom = await db.chatRoom.create({
      data: {
        name: `${currentUser.name} & ${otherUser.name}`,
        isGroup: false,
        users: {
          create: [
            {
              userId: currentUser.id,
              isAdmin: true
            },
            {
              userId: otherUser.id,
              isAdmin: true
            }
          ]
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    })

    return { chatRoom: newRoom }
  } catch (error) {
    console.error("Error creating direct message:", error)
    return { error: "Failed to create direct message" }
  }
}

export async function getMessages(roomId: string) {
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

    return messages
  } catch  {
    return { error: "Failed to fetch messages" }
  }
}
