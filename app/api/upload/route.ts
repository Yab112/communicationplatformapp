import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getCurrentUser } from '@/lib/get-session'

const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileType = formData.get('fileType') as string
    const maxSize = fileType === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for video, 5MB for images

    // Validate file type
    if (fileType === 'image' && !validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image format. Supported formats: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    if (fileType === 'video' && !validVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid video format. Supported formats: MP4, WebM, OGG, QuickTime' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 400 }
      )
    }

    // Generate a unique filename with proper extension
    const extension = file.name.split('.').pop()
    const filename = `${user.id}-${Date.now()}.${extension}`

    // Convert File to Buffer for Vercel Blob
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Vercel Blob with explicit content type
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: true,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
