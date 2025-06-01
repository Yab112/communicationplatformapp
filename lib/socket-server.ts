// lib/socket-server.ts
import { Server as NetServer, createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io";
import { db } from "@/lib/db";

// Interface for socket event data
interface SendMessageData {
  roomId: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

// Interface for socket data
interface SocketData {
  userId?: string;
}

let io: SocketIOServer | null = null;

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO server not initialized");
  }
  return io;
}

export function initSocketServer(server?: NetServer): SocketIOServer {
  if (io) return io;

  console.log("🚀 Initializing Socket.IO server...");

  // Create a standalone HTTP server if none provided
  const httpServer = server || createServer();
  const port = server ? undefined : (process.env.SOCKET_PORT || 3001);

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    serveClient: false,
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e8,
    allowEIO3: true,
  });

  // 🔐 Auth middleware
  io.use((socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) {
        console.log("❌ Authentication failed: No token");
        return next(new Error("Unauthorized"));
      }

      const match = token.match(/^Bearer (.+)$/);
      if (!match) {
        console.log("❌ Authentication failed: Invalid token format");
        return next(new Error("Unauthorized"));
      }

      socket.data.userId = match[1];
      console.log("✅ Socket authenticated for user:", socket.data.userId);
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // 📡 Socket connection
  io.on("connection", (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
    console.log("🔌 New client connected:", socket.id);

    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
      console.log(`✅ User ${socket.data.userId} joined their room`);
    }

    socket.on("disconnect", (reason) => {
      console.log("🔌 Client disconnected:", socket.id, "Reason:", reason);
    });

    socket.on("send-message", async (data: SendMessageData) => {
      try {
        if (!socket.data.userId) {
          socket.emit("error", "User not authenticated");
          return;
        }

        console.log("📨 Received message:", { roomId: data.roomId, content: data.content });

        const isMember = await db.chatRoom.findFirst({
          where: {
            id: data.roomId,
            users: { some: { userId: socket.data.userId } },
          },
        });

        if (!isMember) {
          socket.emit("error", "Not a member of this chat room");
          return;
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
          include: { sender: { select: { id: true, name: true } } },
        });

        await db.chatRoom.update({
          where: { id: data.roomId },
          data: { updatedAt: new Date() },
        });

        io!.to(data.roomId).emit("new-message", message);
        console.log("✅ Message sent to room:", data.roomId);

        const usersToNotify = await db.chatRoomUser.findMany({
          where: {
            chatRoomId: data.roomId,
            userId: { not: socket.data.userId },
            user: { notificationSettings: { chatNotifications: true } },
          },
          select: { userId: true },
        });

        const notificationData = usersToNotify.map((u) => ({
          userId: u.userId,
          type: "message",
          content: `${message.sender.name} sent a message: ${data.content.slice(0, 50)}...`,
          relatedId: message.id,
          isRead: false,
        }));

        const savedNotifications = await db.$transaction(
          notificationData.map((data) => db.notification.create({ data }))
        );

        savedNotifications.forEach((notification, index) => {
          io!.to(`user:${usersToNotify[index].userId}`).emit("notification", {
            ...notification,
            createdAt: notification.createdAt.toISOString(),
          });
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("join-room", async (roomId: string) => {
      try {
        if (!socket.data.userId) {
          socket.emit("error", "User not authenticated");
          return;
        }

        console.log(`🔑 User ${socket.data.userId} attempting to join room:`, roomId);

        const isMember = await db.chatRoom.findFirst({
          where: {
            id: roomId,
            users: { some: { userId: socket.data.userId } },
          },
        });

        if (isMember) {
          socket.join(roomId);
          console.log("✅ Joined room:", roomId);
        } else {
          console.log("❌ Unauthorized to join room:", roomId);
          socket.emit("error", "Unauthorized to join room");
        }
      } catch (error) {
        console.error("Room join error:", error);
        socket.emit("error", "Failed to join room");
      }
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      console.log("✅ Left room:", roomId);
    });
  });

  io.on("error", (error: Error) => {
    console.error("Socket.IO server error:", error);
  });

  io.on("connect_error", (error: Error) => {
    console.error("Socket.IO connection error:", error);
  });

  // Start standalone server if no server provided
  if (!server && port) {
    httpServer.listen(port, () => {
      console.log(`🚀 Socket.IO server running on port ${port}`);
    });
  }

  return io;
}