import type { Server as NetServer } from "http"
import { Server as ServerIO } from "socket.io"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Global variable to maintain socket instance
let io: ServerIO

export async function GET(req: Request) {
  // Get the raw Node.js request and response objects
  const res = new NextResponse()
  const requestHeaders = new Headers(req.headers)
  const socketUrl = new URL(req.url)

  // Check if Socket.IO server is already initialized
  if (!io) {
    // Get the raw Node.js server
    const httpServer: NetServer = (res as any).socket?.server

    if (!httpServer) {
      return NextResponse.json({ error: "Socket server cannot be initialized" }, { status: 500 })
    }

    // Initialize Socket.IO server
    io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    // Socket.IO event handlers
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)

      // User joins a chat room
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId)
        console.log(`User joined room: ${roomId}`)
      })

      // User leaves a chat room
      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId)
        console.log(`User left room: ${roomId}`)
      })

      // User sends a message
      socket.on("send-message", (message) => {
        io.to(message.roomId).emit("new-message", message)
      })

      // User is typing
      socket.on("typing", ({ roomId, user }) => {
        socket.to(roomId).emit("user-typing", user)
      })

      // User stops typing
      socket.on("stop-typing", ({ roomId, user }) => {
        socket.to(roomId).emit("user-stop-typing", user)
      })

      // User comes online
      socket.on("user-online", (userId: string) => {
        socket.broadcast.emit("user-status-change", { userId, status: "online" })
      })

      // User goes offline (disconnect)
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`)
      })
    })

    // Attach Socket.IO server to the Node.js server
    ;(res as any).socket.server.io = io
  }

  return NextResponse.json({ success: true })
}
