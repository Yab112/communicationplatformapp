"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export type User = {
  id: string
  name: string
  email: string
  image?: string | null
  role: "Student" | "Teacher" | "Admin"
  department?: string | null
  year?: string | null
  status?: "online" | "offline"
  bio?: string | null
}

type UserContextType = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchUserData = async () => {
    if (!session?.user?.id) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${session.user.id}`)
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData()
    } else if (status === "unauthenticated") {
      setUser(null)
      setLoading(false)
    }
  }, [status, session?.user?.id])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  )
} 