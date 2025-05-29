// app/api/socket/route.ts
import { NextResponse } from "next/server";
import { initSocketServer } from "@/lib/socket-server";

export const dynamic = "force-dynamic";

export async function GET() {
 try {
 initSocketServer(); // Initialize standalone Socket.IO server
 return NextResponse.json({ message: "Socket.IO server initialized" }, { status: 200 });
 } catch (error) {
 console.error("Error initializing Socket.IO:", error);
 return NextResponse.json({ error: "Failed to initialize Socket.IO" }, { status: 500 });
 }
}