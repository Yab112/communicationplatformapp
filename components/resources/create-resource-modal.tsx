"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UploadIcon as FileUpload, X, Upload, Loader2 } from "lucide-react"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Resource } from "@/types/resource"
import { years, fileTypes, departments } from "@/data/mock/resources"
import { resourceSchema } from "@/lib/validator/resource"
import { useToast } from "@/hooks/use-toast"
import { createResource } from "@/lib/actions/resources"

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
  const [isUploading, setIsUploading] = useState(false)
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
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", values.title)
      formData.append("description", values.description)
      formData.append("type", values.type)
      formData.append("department", values.department)
      formData.append("fileType", values.fileType)
      formData.append("courseId", values.courseId || "")
      formData.append("tags", JSON.stringify(selectedTags))

      console.log("Submitting form data:", {
        title: values.title,
        type: values.type,
        department: values.department,
        fileType: values.fileType,
        courseId: values.courseId,
        tags: selectedTags,
        fileSize: selectedFile.size
      })

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
        description: "Failed to create resource. Please try again.",
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
      const extension = file.name.split(".").pop()?.toLowerCase() || ""
      if (extension && fileTypes.includes(extension)) {
        form.setValue("fileType", extension)
      }
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
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
                      <Input placeholder="Enter resource title" {...field} />
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
                    <Textarea placeholder="Describe the resource..." className="min-h-[100px] resize-none" {...field} />
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
                        {selectedDepartment && departments
                          .find(dept => dept.name === selectedDepartment)
                          ?.courses.map((course) => (
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
