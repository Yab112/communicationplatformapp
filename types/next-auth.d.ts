import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      department: string | null
      status: string
    }
  
    interface Session {
      user: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        role: string
        department: string | null
        status: string
      } & DefaultSession["user"]
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      id: string
      role: string
      department: string | null
      status: string
    }
  }
  