"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Loader2, X } from "lucide-react"
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

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
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
      image: imageUrl, 
      likes: 0,
      comments: [],
    }

    onSubmit(newPost)
    form.reset()
    setImagePreview(null)
    setImageUrl(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Create FormData for the file upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file using the server action
      const result = await uploadFile(formData)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Store the URL returned from the server
      setImageUrl(result.url)
      setImagePreview(result.url)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the image.",
        variant: "destructive",
      })
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
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

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="rounded-md object-cover max-h-[200px] w-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 rounded-full bg-[var(--color-bg)]"
                  onClick={() => {
                    setImagePreview(null)
                    setImageUrl(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={isUploading} asChild>
                <label>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
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
                    onChange={handleImageUpload}
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
