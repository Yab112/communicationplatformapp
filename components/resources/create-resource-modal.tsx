"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UploadIcon as FileUpload, X, Upload, Loader2, Sparkles } from "lucide-react"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Resource } from "@/types/resource"
import { years, fileTypes } from "@/data/mock/resources"
import { departments } from "@/constants/departments"
import { resourceSchema } from "@/lib/validator/resource"
import { useToast } from "@/hooks/use-toast"
import { createResource } from "@/lib/actions/resources"
import { getCoursesForDepartment } from "@/constants/courses"

type ResourceFormValues = z.infer<typeof resourceSchema>

interface CreateResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (resource: Resource) => void
}

export function CreateResourceModal({ isOpen, onClose, onSubmit }: CreateResourceModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [availableCourses, setAvailableCourses] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isEnhancingTitle, setIsEnhancingTitle] = useState(false)
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false)
  const { toast } = useToast()

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      fileType: "",
      department: "",
      type: "",
      courseId: "",
    },
  })

  // Update available courses when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const courses = getCoursesForDepartment(selectedDepartment)
      setAvailableCourses(courses)
    } else {
      setAvailableCourses([])
    }
  }, [selectedDepartment])

  const handleSubmit = async (values: ResourceFormValues) => {
    if (!selectedFile) {
      form.setError("fileUpload", {
        type: "manual",
        message: "Please upload a file",
      })
      return
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      form.setError("fileUpload", {
        type: "manual",
        message: "File size must be less than 10MB",
      })
      return
    }

    // Validate file type
    const allowedTypes = [".pdf", ".docx", ".pptx", ".xlsx", ".zip"]
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(`.${fileExtension}`)) {
      form.setError("fileUpload", {
        type: "manual",
        message: "Invalid file type. Allowed types: PDF, DOCX, PPTX, XLSX, ZIP",
      })
      return
    }

    // Validate required fields
    if (!values.title || !values.description || !values.type || !values.department || !values.fileType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // First, upload the file to blob storage
      const uploadFormData = new FormData()
      uploadFormData.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || "Failed to upload file")
      }

      const { url: fileUrl, fileSize } = await uploadResponse.json()

      // Then create the resource with the blob URL
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description)
      formData.append("type", values.type)
      formData.append("department", values.department)
      formData.append("fileType", values.fileType)
      formData.append("courseId", values.courseId || "")
      formData.append("tags", JSON.stringify(selectedTags))
      formData.append("url", fileUrl)
      formData.append("fileSize", fileSize)

      const { resource, error } = await createResource(formData)

      if (error) {
        console.error("Resource creation error:", error)
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (resource) {
        onSubmit(resource)
        form.reset()
        setSelectedFile(null)
        setSelectedTags([])
        setSelectedDepartment("")
        onClose()
        toast({
          title: "Success",
          description: "Resource has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Auto-detect file type
      const extension = file.name.split(".").pop()?.toLowerCase()
      if (extension && fileTypes.includes(extension)) {
        form.setValue("fileType", extension)
      }
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleEnhanceTitle = async () => {
    const title = form.getValues("title")
    if (!title) {
      toast({
        title: "No title to enhance",
        description: "Please enter a title first before enhancing.",
        variant: "destructive",
      })
      return
    }

    // Don't enhance if title is too short
    if (title.length < 3) {
      toast({
        title: "Title too short",
        description: "Please write a bit more before enhancing.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancingTitle(true)
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: title,
          type: 'resource',
          context: {
            department: form.getValues("department"),
            resourceType: form.getValues("type"),
            fileType: form.getValues("fileType")
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      if (data.enhancedText) {
        // Store the original title in case user wants to revert
        const originalTitle = title;

        form.setValue("title", data.enhancedText, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })

        toast({
          title: "Title enhanced",
          description: (
            <div className="flex flex-col gap-2">
              <p>Your title has been enhanced by AI.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("title", originalTitle, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  })
                  toast({
                    title: "Title reverted",
                    description: "Your original title has been restored.",
                  })
                }}
              >
                Revert to original
              </Button>
            </div>
          ),
        })
      } else {
        throw new Error("AI did not return enhanced content");
      }

    } catch (error) {
      console.error("Title enhancement error:", error)
      const errorMessage = error instanceof Error ? error.message : "Could not enhance the title"

      // Handle specific error cases
      if (errorMessage.includes("AI service is not configured") || errorMessage.includes("AI API key is invalid")) {
        toast({
          title: "AI Enhancement Unavailable",
          description: "The AI enhancement service is currently unavailable. Please try again later or contact support.",
          variant: "destructive",
        })
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch failed")) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the enhancement service. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Enhancement Failed",
          description: "Could not enhance the title. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsEnhancingTitle(false)
    }
  }

  const handleEnhanceDescription = async () => {
    const description = form.getValues("description")
    if (!description) {
      toast({
        title: "No description to enhance",
        description: "Please enter a description first before enhancing.",
        variant: "destructive",
      })
      return
    }

    // Don't enhance if description is too short
    if (description.length < 10) {
      toast({
        title: "Description too short",
        description: "Please write a bit more before enhancing.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancingDescription(true)
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: description,
          type: 'post',
          context: {
            department: form.getValues("department"),
            resourceType: form.getValues("type"),
            fileType: form.getValues("fileType"),
            title: form.getValues("title")
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      if (data.enhancedText) {
        // Store the original description in case user wants to revert
        const originalDescription = description;

        form.setValue("description", data.enhancedText, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })

        toast({
          title: "Description enhanced",
          description: (
            <div className="flex flex-col gap-2">
              <p>Your description has been enhanced by AI.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("description", originalDescription, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  })
                  toast({
                    title: "Description reverted",
                    description: "Your original description has been restored.",
                  })
                }}
              >
                Revert to original
              </Button>
            </div>
          ),
        })
      } else {
        throw new Error("AI did not return enhanced content");
      }

    } catch (error) {
      console.error("Description enhancement error:", error)
      const errorMessage = error instanceof Error ? error.message : "Could not enhance the description"

      // Handle specific error cases
      if (errorMessage.includes("AI service is not configured") || errorMessage.includes("AI API key is invalid")) {
        toast({
          title: "AI Enhancement Unavailable",
          description: "The AI enhancement service is currently unavailable. Please try again later or contact support.",
          variant: "destructive",
        })
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch failed")) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the enhancement service. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Enhancement Failed",
          description: "Could not enhance the description. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsEnhancingDescription(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter resource title" {...field} className="pr-12" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={handleEnhanceTitle}
                          disabled={isEnhancingTitle}
                        >
                          {isEnhancingTitle ? (
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

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Describe the resource..."
                        className="min-h-[100px] resize-none pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleEnhanceDescription}
                        disabled={isEnhancingDescription}
                      >
                        {isEnhancingDescription ? (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedDepartment(value)
                        form.setValue("courseId", "")
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.name} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedDepartment}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {years.map((year) => (
                  <Badge
                    key={year}
                    variant={selectedTags.includes(year) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(year)}
                  >
                    {year}
                  </Badge>
                ))}
                <Badge
                  variant={selectedTags.includes("Exam") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag("Exam")}
                >
                  Exam
                </Badge>
                <Badge
                  variant={selectedTags.includes("Assignment") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag("Assignment")}
                >
                  Assignment
                </Badge>
                <Badge
                  variant={selectedTags.includes("Lecture") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag("Lecture")}
                >
                  Lecture
                </Badge>
                <Badge
                  variant={selectedTags.includes("Lab") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag("Lab")}
                >
                  Lab
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">File Upload</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-muted/50">
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <FileUpload className="h-10 w-10 text-primary mb-2" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(selectedFile.size / 1024)} KB</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, XLSX, ZIP (max 10MB)</p>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.pptx,.xlsx,.zip"
                    />
                  </label>
                )}
              </div>
              {form.formState.errors.fileUpload && (
                <p className="text-sm font-medium text-destructive">
                  {typeof form.formState.errors.fileUpload?.message === "string" ? form.formState.errors.fileUpload.message : ""}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="fileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-blue-50 hover:text-blue-600" disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Resource"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
