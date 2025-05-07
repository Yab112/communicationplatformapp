export type UserRole = "ADMIN" | "STUDENT" | "TEACHER"
export type UserStatus = "ONLINE" | "OFFLINE" | "AWAY"

export interface User {
    id: string
    name: string
    email: string
    emailVerified: Date | null
    image: string | null
    password: string | null
    role: string
    department: string | null
    status: string
    createdAt: Date
    updatedAt: Date
}
  