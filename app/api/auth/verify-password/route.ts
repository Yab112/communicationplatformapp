import { compare } from "bcrypt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { password, hashedPassword } = await req.json()
    const isValid = await compare(password, hashedPassword)
    
    if (!isValid) {
      return new NextResponse("Invalid password", { status: 401 })
    }

    return new NextResponse("Password verified", { status: 200 })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 