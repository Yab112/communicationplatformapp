// components/socket-provider.ts
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

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
      auth: {
        userId: session.user.id,
      },
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      if (isMounted.current) {
        setSocket(socketInstance);
        setIsConnected(true);
      }
    });

    socketInstance.on("disconnect", () => {
      if (isMounted.current) {
        setIsConnected(false);
      }
    });

    socketInstance.on("error", (error) => {
      if (isMounted.current) {
        toast({
          title: "Socket Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    return () => {
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