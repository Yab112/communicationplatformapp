"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { updateUserStatus } from "@/lib/actions/users"
import { User } from "@/types/user"


type UserContextType = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => { },
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
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - session might be invalid
          setUser(null)
          setLoading(false)
          return
        }
        throw new Error(`Failed to fetch user data: ${response.statusText}`)
      }
      const userData = await response.json()

      // Transform the data to match our User type
      const transformedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        role: userData.role as "student" | "teacher" | "admin",
        department: userData.department,
        year: userData.year,
        status: userData.status as "online" | "offline",
        bio: userData.bio,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }

      setUser(transformedUser)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Handle online status
  useEffect(() => {
    const updateStatus = async (newStatus: "online" | "offline") => {
      if (!session?.user?.id) {
        console.warn("Cannot update status: No authenticated user")
        return
      }

      try {
        const result = await updateUserStatus(newStatus)
        if (result.error) {
          console.error("Status update error:", result.error)
          return
        }

        if (user) {
          setUser(prev => prev ? { ...prev, status: newStatus } : null)
        }
      } catch (error) {
        console.error("Error updating user status:", error)
      }
    }

    const handleOnline = () => updateStatus("online")
    const handleOffline = () => updateStatus("offline")
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateStatus("online")
      } else {
        updateStatus("offline")
      }
    }

    // Set initial online status when authenticated and user data is loaded
    if (status === "authenticated" && mounted && user) {
      updateStatus("online")
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup function
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      // Update status to offline when component unmounts
      if (status === "authenticated" && user) {
        updateStatus("offline")
      }
    }
  }, [status, mounted, user])

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