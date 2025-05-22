import { NextResponse } from "next/server"
import { createServer } from "http"
import { initSocketServer } from "@/lib/socket-server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const server = createServer()
    const io = initSocketServer(server)
    
    if (!io) {
      return new NextResponse('Socket server initialization failed', { status: 500 })
    }

    return new NextResponse('Socket server initialized', { status: 200 })
  } catch (error) {
    console.error('Socket server error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
