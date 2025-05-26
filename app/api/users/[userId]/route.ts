import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = params.userId

    // Only allow users to access their own data unless they're an admin
    if (currentUser.id !== userId && currentUser.role !== "Admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 