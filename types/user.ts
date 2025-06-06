export type UserRole = "admin" | "student" | "teacher"
export type UserStatus = "online" | "offline" | "away"

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
    year?: string 
    bio?: string | null
}
  