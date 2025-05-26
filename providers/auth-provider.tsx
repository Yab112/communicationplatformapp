"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

type User = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  department: string | null
  status: string
} | null

type AuthContextType = {
  user: User
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const user = session?.user as User | null
  const loading = status === "loading"

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}
