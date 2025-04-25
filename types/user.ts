export interface User {
    id: string
    name: string
    avatar: string
    role: "Student" | "Teacher" | "Admin"
    department: string
    status: "online" | "offline"
  }
  