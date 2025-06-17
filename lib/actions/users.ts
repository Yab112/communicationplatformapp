"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"
import { UserRole, UserStatus } from "@/types/user"

export async function getUsers() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    })
    console.log('user--------------------->',users)
    return { users }
  } catch  {
    return { error: "Failed to fetch users" }
  }
}

export async function getTeachers() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      console.log("No current user found in getTeachers")
      return { error: "Unauthorized" }
    }

    console.log("Fetching teachers for user:", currentUser.id)
    const teachers = await db.user.findMany({
      where: {
        role: "teacher"
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        department: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: "asc",
      },
    })

    // console.log("Found teachers:", teachers)

    if (!teachers || teachers.length === 0) {
      console.log("No teachers found in database")
      return { users: [] }
    }

    // Transform the data to match User type
    const transformedTeachers = teachers.map(teacher => ({
      ...teacher,
      role: teacher.role as UserRole,
      status: teacher.status as UserStatus
    }))

    // console.log("Transformed teachers:", transformedTeachers)
    return { users: transformedTeachers }
  } catch (error) {
    console.error("Error in getTeachers:", error)
    return { error: "Failed to fetch teachers" }
  }
}

export async function getStudents() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    const students = await db.user.findMany({
      where: {
        role: "student" as const
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        department: true,
        year: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: "asc",
      },
    })

    // Transform the data to match User type
    const transformedStudents = students.map(student => ({
      ...student,
      role: student.role as UserRole,
      status: student.status as UserStatus
    }))

    return { users: transformedStudents }
  } catch (error) {
    console.error("Error fetching students:", error)
    return { error: "Failed to fetch students" }
  }
}

export async function getUserProfile(userId: string) {
  try {
    console.log("Getting profile for userId:", userId)
    const currentUser = await getCurrentUser()
    console.log("Current user from session:", currentUser)

    if (!currentUser) {
      console.log("No current user found - unauthorized")
      return { error: "Unauthorized" }
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
    })

    console.log("Database query result:", user)

    if (!user) {
      console.log("No user found with id:", userId)
      return { error: "User not found" }
    }

    return { user }
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return { error: "Failed to fetch user profile" }
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { error: "Unauthorized" }
    }

    // Validate role
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      return { error: "Invalid role" }
    }

    await db.user.update({
      where: { id: userId },
      data: { role: role as "STUDENT" | "TEACHER" | "ADMIN" },
    })

    return { success: true }
  } catch  {
    return { error: "Failed to update user role" }
  }
}

export async function updateUserStatus(status: "online" | "offline") {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: "Unauthorized" }
    }

    await db.user.update({
      where: { id: currentUser.id },
      data: { status },
    })

    return { success: true }
  } catch  {
    return { error: "Failed to update user status" }
  }
}
