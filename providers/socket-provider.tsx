"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { io as createSocketIOClient, type Socket } from "socket.io-client"

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInitializer = async () => {
      try {
        // First, we need to fetch the API route to initialize the Socket.IO server
        await fetch("/api/socket")

        // Create Socket.IO client
        const socketIo = createSocketIOClient({
          path: "/api/socket/io",
          addTrailingSlash: false,
        })

        socketIo.on("connect", () => {
          console.log("Socket connected")
          setIsConnected(true)
        })

        socketIo.on("disconnect", () => {
          console.log("Socket disconnected")
          setIsConnected(false)
        })

        setSocket(socketIo)

        // Cleanup function
        return () => {
          socketIo.disconnect()
        }
      } catch (error) {
        console.error("Socket initialization error:", error)
      }
    }

    socketInitializer()

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
