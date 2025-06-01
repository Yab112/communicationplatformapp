"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getStudents, getTeachers } from "@/lib/actions/users"
import type { User } from "@/context/user-context"
import type { UserRole, UserStatus } from "@/types/user"

type UsersContextType = {
  students: User[]
  teachers: User[]
  loadingStudents: boolean
  loadingTeachers: boolean
  refreshStudents: () => Promise<void>
  refreshTeachers: () => Promise<void>
}

const UsersContext = createContext<UsersContextType>({
  students: [],
  teachers: [],
  loadingStudents: true,
  loadingTeachers: true,
  refreshStudents: async () => {},
  refreshTeachers: async () => {},
})

export const useUsers = () => {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider")
  }
  return context
}

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<User[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      const result = await getStudents()
      if ("users" in result && Array.isArray(result.users)) {
        const transformedUsers: User[] = result.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role === "STUDENT" ? "Student" : user.role === "TEACHER" ? "Teacher" : "Admin",
          department: user.department,
          year: user.year,
          status: user.status.toLowerCase() as "online" | "offline",
          bio: null
        }))
        setStudents(transformedUsers)
      } else {
        setStudents([])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      const result = await getTeachers()
      if ("users" in result && Array.isArray(result.users)) {
        const transformedUsers: User[] = result.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role === "STUDENT" ? "Student" : user.role === "TEACHER" ? "Teacher" : "Admin",
          department: user.department,
          year: user.year,
          status: user.status.toLowerCase() as "online" | "offline",
          bio: null
        }))
        setTeachers(transformedUsers)
      } else {
        setTeachers([])
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
      setTeachers([])
    } finally {
      setLoadingTeachers(false)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchTeachers()
  }, [])

  return (
    <UsersContext.Provider
      value={{
        students,
        teachers,
        loadingStudents,
        loadingTeachers,
        refreshStudents: fetchStudents,
        refreshTeachers: fetchTeachers,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
} 