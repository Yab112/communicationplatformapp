"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { io as ClientIO, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (!session?.user) return

    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_APP_URL || '', {
      path: '/api/socket/io',
      addTrailingSlash: false,
      auth: {
        token: session.user.id
      }
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      socketInstance.emit('user-online')
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
