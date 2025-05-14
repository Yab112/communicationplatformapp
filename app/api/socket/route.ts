import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

let io: SocketIOServer | null = null

interface ServerError extends Error {
  code?: string;
}

export async function GET(req: Request) {
  if (!io) {
    try {
      const httpServer = new NetServer()
      io = new SocketIOServer(httpServer, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true
        }
      })

      io.on('connection', async (socket) => {
        console.log('Client connected:', socket.id)
        
        // Handle joining chat rooms
        socket.on('join-room', (roomId) => {
          socket.join(roomId)
        })

        // Handle leaving chat rooms
        socket.on('leave-room', (roomId) => {
          socket.leave(roomId)
        })

        // Handle user online status
        socket.on('user-online', async (userId) => {
          try {
            const token = await getToken({ req: socket.handshake.headers as any })
            if (!token || token.sub !== userId) {
              socket.emit('error', 'Unauthorized')
              return
            }

            await db.user.update({
              where: { id: userId },
              data: { status: 'online' }
            })

            io?.emit('user-status-change', { userId, status: 'online' })
          } catch (error) {
            console.error('Error updating user status:', error)
            socket.emit('error', 'Failed to update user status')
          }
        })

        // Handle sending messages
        socket.on('send-message', async (data) => {
          try {
            const token = await getToken({ req: socket.handshake.headers as any })
            if (!token) {
              socket.emit('error', 'Unauthorized')
              return
            }

            const message = await db.message.create({
              data: {
                content: data.content,
                senderId: token.sub as string,
                chatRoomId: data.roomId,
                ...(data.fileUrl && {
                  fileUrl: data.fileUrl,
                  fileName: data.fileName,
                  fileType: data.fileType,
                  fileSize: data.fileSize,
                }),
              },
              include: {
                sender: true,
              },
            })

            io?.to(data.roomId).emit('new-message', message)
          } catch (error) {
            console.error('Error sending message:', error)
            socket.emit('error', 'Failed to send message')
          }
        })

        // Handle typing indicators
        socket.on('typing', ({ roomId, user }) => {
          socket.to(roomId).emit('user-typing', user)
        })

        socket.on('stop-typing', ({ roomId, user }) => {
          socket.to(roomId).emit('user-stop-typing', user)
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })

      // Start the server
      const port = 3001
      try {
        await new Promise<void>((resolve, reject) => {
          httpServer.listen(port, () => {
            console.log(`Socket.IO server running on port ${port}`)
            resolve()
          })

          httpServer.on('error', (error) => {
            reject(error)
          })
        })
      } catch (error) {
        console.error('Error starting Socket.IO server:', error)
        throw new Error('Could not find an available port for Socket.IO server')
      }
    } catch (error) {
      console.error('Error initializing Socket.IO server:', error)
      return NextResponse.json({ error: 'Failed to initialize Socket.IO server' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

// Add this to make TypeScript happy
declare global {
  var io: SocketIOServer | null
}
