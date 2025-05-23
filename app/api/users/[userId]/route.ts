import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/get-session"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        email: true,
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