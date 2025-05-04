"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { hash, compare } from "bcrypt"
import { sign, verify } from "jsonwebtoken"
import prisma from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  department: z.string().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
})

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export async function signup(formData: FormData) {
  try {
    const parsed = signupSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      department: formData.get("department"),
      role: formData.get("role"),
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(parsed.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        password: hashedPassword,
        department: parsed.department,
        role: parsed.role,
        settings: {
          create: {}, // Create default settings
        },
      },
    })

    // Create JWT token
    const token = sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Set cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

export async function login(formData: FormData) {
  try {
    const parsed = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    })

    if (!user || !user.password) {
      return { error: "Invalid email or password" }
    }

    // Compare password
    const passwordMatch = await compare(parsed.password, user.password)

    if (!passwordMatch) {
      return { error: "Invalid email or password" }
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ONLINE" },
    })

    // Create JWT token
    const token = sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Set cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

export async function logout() {
  try {
    const token = cookies().get("auth-token")?.value

    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as { id: string }

        // Update user status
        await prisma.user.update({
          where: { id: decoded.id },
          data: { status: "OFFLINE" },
        })
      } catch (error) {
        // Token verification failed, but we still want to clear the cookie
      }
    }

    cookies().delete("auth-token")
    return { success: true }
  } catch (error) {
    return { error: "Something went wrong. Please try again." }
  }
}

export async function getCurrentUser() {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return null
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { id: string }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          department: true,
          year: true,
          bio: true,
          status: true,
        },
      })

      return user
    } catch (error) {
      // Token verification failed
      cookies().delete("auth-token")
      return null
    }
  } catch (error) {
    return null
  }
}
