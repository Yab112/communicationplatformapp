"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { User } from "@/types/user"

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData()
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [status, session?.user?.id])

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

export const useUser = () => useContext(UserContext) 