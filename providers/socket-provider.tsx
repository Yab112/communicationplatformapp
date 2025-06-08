// providers/socket-provider.tsx (Corrected Version)
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (socketRef.current) {
      return;
    }

    const socketInstance = io("http://localhost:3001", {
      // Points to your standalone server
      path: "/api/socket",
      auth: {
        token: `Bearer ${session.user.id}`,
      },
      withCredentials: true,
      reconnection: true,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected on client:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected on client");
      setIsConnected(false);
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
