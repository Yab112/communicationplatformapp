import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

let io: SocketIOServer | null = null

export async function GET(req: Request) {
  if (!io) {
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
      
      // Handle new post creation
      socket.on('create-post', async (data) => {
        try {
          const token = await getToken({ req })
          if (!token) {
            socket.emit('error', 'Unauthorized')
            return
          }

          const post = await db.post.create({
            data: {
              content: data.content,
              department: data.department,
              authorId: token.sub as string,
              image: data.image || null,
            },
            include: {
              author: true,
              comments: {
                include: {
                  author: true,
                },
              },
            },
          })

          io?.emit('new-post', post)
        } catch (error) {
          console.error('Error creating post:', error)
          socket.emit('error', 'Failed to create post')
        }
      })

      // Handle post likes
      socket.on('like-post', async (data) => {
        try {
          const token = await getToken({ req })
          if (!token) {
            socket.emit('error', 'Unauthorized')
            return
          }

          const existingLike = await db.like.findUnique({
            where: {
              postId_userId: {
                postId: data.postId,
                userId: token.sub as string,
              },
            },
          })

          if (existingLike) {
            await db.like.delete({
              where: {
                id: existingLike.id,
              },
            })
          } else {
            await db.like.create({
              data: {
                postId: data.postId,
                userId: token.sub as string,
              },
            })
          }

          const likes = await db.like.count({
            where: {
              postId: data.postId,
            },
          })

          io?.emit('post-liked', {
            postId: data.postId,
            likes,
          })
        } catch (error) {
          console.error('Error liking post:', error)
          socket.emit('error', 'Failed to like post')
        }
      })

      // Handle comments
      socket.on('add-comment', async (data) => {
        try {
          const token = await getToken({ req })
          if (!token) {
            socket.emit('error', 'Unauthorized')
            return
          }

          const comment = await db.comment.create({
            data: {
              content: data.content,
              postId: data.postId,
              authorId: token.sub as string,
            },
            include: {
              author: true,
            },
          })

          io?.emit('new-comment', {
            postId: data.postId,
            comment,
          })
        } catch (error) {
          console.error('Error adding comment:', error)
          socket.emit('error', 'Failed to add comment')
        }
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    httpServer.listen(3001)
  }

  return NextResponse.json({ success: true })
}

// Add this to make TypeScript happy
declare global {
  var io: SocketIOServer | null
}
