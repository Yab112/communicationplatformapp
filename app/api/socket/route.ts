import { NextResponse } from "next/server"
import { createServer } from "http"
import { initSocketServer } from "@/lib/socket-server"

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const server = createServer()
    const io = initSocketServer(server)

    if (!io) {
      return new NextResponse('Socket server initialization failed', { status: 500 })
    }

    // Handle WebSocket upgrade
    const upgradeHeader = req.headers.get('upgrade')
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new NextResponse('Expected websocket', { status: 400 })
    }

    return new NextResponse(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    })
    } catch (error) {
    console.error('Socket server error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
}
}
