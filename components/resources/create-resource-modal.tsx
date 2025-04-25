"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UploadIcon as FileUpload, X, Upload } from "lucide-react"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Resource } from "@/types/resource"
import { subjects, years, fileTypes } from "@/data/mock/resources"
import { resourceSchema } from "@/lib/validator/resource"

type ResourceFormValues = z.infer<typeof resourceSchema>

interface CreateResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (resource: Resource) => void
}

export function CreateResourceModal({ isOpen, onClose, onSubmit }: CreateResourceModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      fileType: "",
    },
  })

  const handleSubmit = (values: ResourceFormValues) => {
    if (!selectedFile) {
      form.setError("fileUpload", {
        type: "manual",
        message: "Please upload a file",
      })
      return
    }

    // In a real app, you would upload the file to a server here
    const newResource: Resource = {
      id: `resource-${Date.now()}`,
      title: values.title,
      subject: values.subject,
      description: values.description,
      fileType: values.fileType,
      fileSize: `${Math.round(selectedFile.size / 1024)} KB`,
      uploadDate: new Date().toISOString(),
      tags: selectedTags,
      uploadedBy: {
        id: "teacher-1",
        name: "Dr. Alan Turing",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    }

    onSubmit(newResource)
    form.reset()
    setSelectedFile(null)
    setSelectedTags([])
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Upload Resource</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
