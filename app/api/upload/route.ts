import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await writeFile(join(uploadsDir, "dummy"), "").catch(() => {})

    // Generate unique filename
    const uniqueId = uuidv4()
    const extension = file.name.split(".").pop()
    const filename = `${uniqueId}.${extension}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(join(uploadsDir, filename), buffer)

    // Return file info
    return NextResponse.json({
      url: `/uploads/${filename}`,
      name: file.name,
      type: file.type,
      size: file.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
