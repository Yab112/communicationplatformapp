"use server"

import { put } from "@vercel/blob"
import { getCurrentUser } from "@/lib/get-session"

export async function uploadFile(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    if (!file) {
      return { error: "No file provided" }
    }

    const fileType = formData.get("fileType") as string
    const maxSize = fileType === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for video, 5MB for images

    // Validate file size
    if (file.size > maxSize) {
      return { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` }
    }

    // Generate a unique filename
    const filename = `${user.id}-${Date.now()}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      success: true,
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload file" }
  }
}
