export type UserRole = "ADMIN" | "STUDENT" | "TEACHER"
export type UserStatus = "ONLINE" | "OFFLINE" | "AWAY"

export interface User {
    id: string
    name: string
    email: string
    emailVerified: Date | null
    image: string | null
    role: UserRole
    department: string | null
    status: UserStatus
    createdAt: Date
    updatedAt: Date
}
  