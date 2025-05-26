"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, VideoIcon, Loader2, X, Sparkles } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Post } from "@/types/post"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { departments } from "@/constants/departments"

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(10000, "Post content is too long"),
  department: z.string().min(1, "Department is required"),
  media: z.array(z.object({
    id: z.string(),
    type: z.enum(['image', 'video']),
    url: z.string(),
    poster: z.string().optional(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
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
  const [mediaItems, setMediaItems] = useState<Array<{
    type: 'image' | 'video'
    url: string
    poster?: string
    preview?: string
  }>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Filter departments based on search query
  const filteredDepartments = departments
    .map(d => d.name)
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      department: "",
      media: [],
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
      media: mediaItems.map((item, index) => ({
        id: `media-${Date.now()}-${index}`,
        type: item.type,
        url: item.url,
        poster: item.poster,
        order: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      likes: 0,
      comments: [],
      isLiked: false,
    }

    onSubmit(newPost)
    form.reset()
    setMediaItems([])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files
    if (!files?.length) return

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

    for (const file of Array.from(files)) {
      if (type === 'image' && !validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload valid image files (JPEG, PNG, GIF, or WebP)",
          variant: "destructive",
        })
        continue
      }

      if (type === 'video' && !validVideoTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload valid video files (MP4, WebM, OGG, or QuickTime)",
          variant: "destructive",
        })
        continue
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileType", type)

        const xhr = new XMLHttpRequest()
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
              reject(new Error('Upload failed'))
            }
          })

          xhr.addEventListener('error', () => reject(new Error('Network error occurred')))
          xhr.addEventListener('abort', () => reject(new Error('Upload was cancelled')))
        })

        xhr.open('POST', '/api/upload')
        xhr.send(formData)

        const result = await uploadPromise

        if (result.error) {
          toast({
            title: "Upload failed",
            description: result.error,
            variant: "destructive",
          })
          continue
        }

        if (type === 'image') {
          setMediaItems(prev => [...prev, {
            type: 'image',
            url: result.url,
            preview: result.url,
          }])
        } else {
          // Generate thumbnail for video
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
              setMediaItems(prev => [...prev, {
                type: 'video',
                url: result.url,
                poster: thumbnailUrl,
                preview: thumbnailUrl,
              }])
            }
          }

          video.onerror = () => {
            URL.revokeObjectURL(video.src)
            setMediaItems(prev => [...prev, {
              type: 'video',
              url: result.url,
            }])
          }
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An error occurred while uploading the file.",
          variant: "destructive",
        })
      }
    }

    setIsUploading(false)
    setUploadProgress(0)
  }

  const handleRemoveMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleEnhanceContent = async () => {
    const content = form.getValues("content")
    if (!content) {
      toast({
        title: "No content to enhance",
        description: "Please write something first before enhancing.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/enhance-text', { // Call your new API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content, type: 'post' }), // Send text and type
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the API response if available
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      if (data.enhancedText) {
        form.setValue("content", data.enhancedText, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        toast({
          title: "Content enhanced",
          description: "Your post has been enhanced by AI.",
        })
      } else {
        // This case should ideally be handled by the API returning an error or the original text
        toast({
          title: "Enhancement issue",
          description: "AI did not return enhanced content.",
          variant: "destructive",
        })
      }

    } catch (error) {
      console.error("Enhancement error:", error)
      const errorMessage = error instanceof Error ? error.message : "Could not enhance the content"
      toast({
        title: "Enhancement failed",
        // You can make this more user-friendly based on common errors
        description: errorMessage.includes("AI service is not configured") || errorMessage.includes("AI API key is invalid")
          ? "AI enhancement is currently unavailable. Please contact support."
          : "Could not enhance the content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[800px] max-h-[90vh] p-0 gap-0 overflow-auto bg-[var(--color-bg)]">
        <DialogHeader className="p-6 border-b border-[var(--color-border)]">
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 p-2 bg-background border-b">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search departments..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <SelectItem value="all">
                          All Departments
                        </SelectItem>
                        {filteredDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="What would you like to share?"
                        className="min-h-[120px] resize-none pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleEnhanceContent}
                        disabled={isEnhancing}
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mediaItems.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {mediaItems.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === 'image' ? (
                      <img
                        src={item.preview}
                        alt={`Media ${index + 1}`}
                        className="rounded-md object-cover w-full h-48"
                      />
                    ) : (
                      <video
                        src={item.url}
                        poster={item.poster}
                        controls
                        className="rounded-md object-cover w-full h-48"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full bg-[var(--color-bg)] opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
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
                      <span>Add Images</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
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
                      <span>Add Videos</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    multiple
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
