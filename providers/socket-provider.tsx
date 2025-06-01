// components/socket-provider.ts
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { updateUserStatus } from "@/lib/actions/users";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        if (isMounted.current) {
          setSocket(null);
          setIsConnected(false);
        }
      }
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      path: "/api/socket",
      auth: {
        token: `Bearer ${session.user.id}`,
      },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", async () => {
      console.log("Socket connected:", socketInstance.id);
      if (isMounted.current) {
        setSocket(socketInstance);
        setIsConnected(true);
        // Update user status to online when connected
        try {
          await updateUserStatus("online");
        } catch (error) {
          console.error("Failed to update user status:", error);
        }
      }
    });

    socketInstance.on("disconnect", async (reason) => {
      console.log("Socket disconnected:", reason);
      if (isMounted.current) {
        setIsConnected(false);
        // Update user status to offline when disconnected
        try {
          await updateUserStatus("offline");
        } catch (error) {
          console.error("Failed to update user status:", error);
        }
      }
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      if (isMounted.current) {
        toast({
          title: "Socket Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      if (isMounted.current) {
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat server",
          variant: "destructive",
        });
      }
    });

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        try {
          await updateUserStatus("online");
        } catch (error) {
          console.error("Failed to update user status:", error);
        }
      } else {
        try {
          await updateUserStatus("offline");
        } catch (error) {
          console.error("Failed to update user status:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (socketInstance) {
        socketInstance.disconnect();
        socketRef.current = null;
        if (isMounted.current) {
          setSocket(null);
          setIsConnected(false);
        }
      }
    };
  }, [session?.user?.id, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);