// lib/socket-server.ts (Simplified & Corrected)
import { Server as NetServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

// Define interfaces right in the file for clarity
interface SocketData {
  userId?: string;
}

// Global variable to hold the single socket server instance
let io: SocketIOServer | null = null;

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO server not initialized. Ensure the standalone server is running.");
  }
  return io;
}

export function initSocketServer(server: NetServer): SocketIOServer {
  if (io) {
    console.log("Socket.IO server already initialized.");
    return io;
  }

  console.log("🚀 Attaching Socket.IO to HTTP server...");

  io = new SocketIOServer(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket: Socket<any, any, any, SocketData>, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token || !token.startsWith("Bearer ")) {
        return next(new Error("Unauthorized: Invalid token format"));
      }
      const userId = token.split(" ")[1];
      if (!userId) {
        return next(new Error("Unauthorized: User ID missing from token"));
      }
      socket.data.userId = userId;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  // Main Connection Handler
  io.on("connection", (socket: Socket<any, any, any, SocketData>) => {
    const userId = socket.data.userId;
    if (!userId) return;

    console.log(`🔌 Client connected: ${socket.id} (User: ${userId})`);
    socket.join(`user:${userId}`);

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (User: ${userId}, Reason: ${reason})`);
    });

    // Add other event listeners like "send-message", "join-room" etc. here
  });

  return io;
}