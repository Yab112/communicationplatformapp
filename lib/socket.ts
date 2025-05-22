import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'
import { getToken } from "next-auth/jwt"
import { db } from "@/lib/db"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

export const initSocket = async (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('🚀 Initializing Socket.IO server...')
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    })

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        console.log('🔒 Authenticating socket connection...')
        const token = await getToken({ req: socket.handshake.headers as any })
        if (!token) {
          console.log('❌ Authentication failed: No token')
          return next(new Error('Unauthorized'))
        }
        socket.data.userId = token.sub
        console.log('✅ Socket authenticated for user:', token.sub)
        next()
      } catch (error) {
        console.error('❌ Authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })

    // Socket event handlers
    io.on('connection', async (socket) => {
      console.log('🔌 New client connected:', socket.id)
      
      // Handle joining chat rooms
      socket.on('join-room', async (roomId) => {
        try {
          console.log(`👥 User ${socket.data.userId} attempting to join room ${roomId}`)
          const isMember = await db.chatRoom.findFirst({
            where: {
              id: roomId,
              users: {
                some: {
                  userId: socket.data.userId
                }
              }
            }
          })

          if (!isMember) {
            console.log(`❌ User ${socket.data.userId} is not a member of room ${roomId}`)
            socket.emit('error', 'Not a member of this chat room')
            return
          }

          socket.join(roomId)
          console.log(`✅ User ${socket.data.userId} joined room ${roomId}`)
        } catch (error) {
          console.error('❌ Error joining room:', error)
          socket.emit('error', 'Failed to join room')
        }
      })

      // Handle leaving chat rooms
      socket.on('leave-room', (roomId) => {
        socket.leave(roomId)
        console.log(`User ${socket.data.userId} left room ${roomId}`)
      })

      // Handle user online status
      socket.on('user-online', async () => {
        try {
          await db.user.update({
            where: { id: socket.data.userId },
            data: { status: 'ONLINE' }
          })
          io.emit('user-status-change', { userId: socket.data.userId, status: 'ONLINE' })
        } catch (error) {
          console.error('Error updating user status:', error)
          socket.emit('error', 'Failed to update user status')
        }
      })

      // Handle sending messages
      socket.on('send-message', async (data) => {
        try {
          const isMember = await db.chatRoom.findFirst({
            where: {
              id: data.roomId,
              users: {
                some: {
                  userId: socket.data.userId
                }
              }
            }
          })

          if (!isMember) {
            socket.emit('error', 'Not a member of this chat room')
            return
          }

          const message = await db.message.create({
            data: {
              content: data.content,
              senderId: socket.data.userId,
              chatRoomId: data.roomId,
              ...(data.fileUrl && {
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileType: data.fileType,
                fileSize: data.fileSize,
              }),
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                }
              },
            },
          })

          await db.chatRoom.update({
            where: { id: data.roomId },
            data: { updatedAt: new Date() }
          })

          io.to(data.roomId).emit('new-message', message)
        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('error', 'Failed to send message')
        }
      })

      // Handle typing indicators
      socket.on('typing', ({ roomId }) => {
        socket.to(roomId).emit('user-typing', socket.data.userId)
      })

      socket.on('stop-typing', ({ roomId }) => {
        socket.to(roomId).emit('user-stop-typing', socket.data.userId)
      })

      socket.on('disconnect', async () => {
        try {
          await db.user.update({
            where: { id: socket.data.userId },
            data: { status: 'OFFLINE' }
          })
          io.emit('user-status-change', { userId: socket.data.userId, status: 'OFFLINE' })
        } catch (error) {
          console.error('Error updating user status:', error)
        }
      })
    })

    res.socket.server.io = io
  }
  return res.socket.server.io
} 