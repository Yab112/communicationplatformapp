"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, VideoIcon, Loader2, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Post } from "@/types/post"
import { uploadFile } from "@/lib/file-upload"
import { useToast } from "@/hooks/use-toast"

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(1000, "Post content is too long"),
  department: z.string().min(1, "Department is required"),
})

type PostFormValues = z.infer<typeof postSchema>

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: Post) => void
}

interface UploadResponse {
  success: boolean;
  url: string;
  name: string;
  size: number;
  type: string;
  error?: string;
}

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoPoster, setVideoPoster] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      department: "",
    },
  })

  const handleSubmit = (values: PostFormValues) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      content: values.content,
      department: values.department,
      author: {
        id: "current-user",
        name: "Current User",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Admin",
      },
      createdAt: new Date().toISOString(),
      image: imageUrl || undefined,
      video: videoUrl || undefined,
      videoPoster: videoPoster || undefined,
      likes: 0,
      comments: [],
      isLiked: false,
    }

    onSubmit(newPost)
    form.reset()
    setImagePreview(null)
    setImageUrl(null)
    setVideoUrl(null)
    setVideoPoster(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

    if (type === 'image' && !validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      })
      return
    }

    if (type === 'video' && !validVideoTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid video file (MP4, WebM, OGG, or QuickTime)",
        variant: "destructive",
      })
      return
    }

    // Clear existing media
    setImagePreview(null)
    setImageUrl(null)
    setVideoUrl(null)
    setVideoPoster(null)
    setUploadProgress(0)

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", type)

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      // Create a promise that resolves when upload is complete
      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (error) {
              reject(new Error('Invalid response format'))
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(new Error(errorResponse.error || 'Upload failed'))
            } catch {
              reject(new Error('Upload failed'))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'))
        })
      })

      // Start the upload
      xhr.open('POST', '/api/upload')
      xhr.send(formData)

      // Wait for upload to complete
      const result = await uploadPromise

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (type === 'image') {
        setImageUrl(result.url)
        setImagePreview(result.url)
      } else {
        setVideoUrl(result.url)

        // Generate thumbnail after successful upload
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.src = URL.createObjectURL(file)

        video.onloadeddata = () => {
          video.currentTime = video.duration * 0.25
        }

        video.onseeked = () => {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7)
            URL.revokeObjectURL(video.src)
            setVideoPoster(thumbnailUrl)
          } else {
            URL.revokeObjectURL(video.src)
            toast({
              title: "Warning",
              description: "Could not generate video thumbnail",
              variant: "destructive",
            })
          }
        }

        video.onerror = () => {
          URL.revokeObjectURL(video.src)
          toast({
            title: "Warning",
            description: "Could not generate video thumbnail",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading the file.",
        variant: "destructive",
      })
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveMedia = () => {
    setImagePreview(null)
    setImageUrl(null)
    setVideoUrl(null)
    setVideoPoster(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Current user" />
                <AvatarFallback>CU</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Current User</p>
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 w-[180px]">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What would you like to share?"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(imagePreview || videoUrl) && (
              <div className="relative">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-md object-cover max-h-[200px] w-full"
                  />
                )}
                {videoUrl && (
                  <video
                    src={videoUrl}
                    poster={videoPoster || undefined}
                    controls
                    className="rounded-md object-cover max-h-[200px] w-full"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 rounded-full bg-[var(--color-bg)]"
                  onClick={handleRemoveMedia}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isUploading}
                asChild
              >
                <label>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      <span>Add Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={isUploading}
                  />
                </label>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isUploading}
                asChild
              >
                <label>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <VideoIcon className="h-4 w-4" />
                      <span>Add Video</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={isUploading}
                  />
                </label>
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Post</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
