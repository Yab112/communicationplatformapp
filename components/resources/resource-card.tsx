"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, Loader2 } from "lucide-react"
import type { Resource } from "@/types/resource"
import { getFileIcon } from "@/lib/file-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()
  const FileIcon = getFileIcon(resource.fileType)

  const handleDownload = async () => {
    if (!resource.url) {
      toast({
        title: "Error",
        description: "No file URL available for download",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      // First, get the file name from the URL
      const fileName = resource.title + '.' + resource.fileType.toLowerCase()
      
      // Fetch the file
      const response = await fetch(resource.url)
      if (!response.ok) throw new Error("Failed to download file")
      
      // Get the blob
      const blob = await response.blob()
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "File downloaded successfully",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Format date on client-side only
  const formattedDate = typeof window !== 'undefined' 
    ? formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })
    : ''

  return (
    <>
      <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-200">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight line-clamp-1">{resource.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileIcon className="h-4 w-4" />
                  {resource.fileType.toUpperCase()}
                </span>
                <span>•</span>
                <span>{resource.fileSize}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(true)} className="hover:bg-blue-50 hover:text-blue-600">
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-blue-50 hover:text-blue-600"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
              {resource.type}
            </Badge>
            {resource.department && (
              <Badge variant="outline" className="hover:bg-blue-50">
                {resource.department}
              </Badge>
            )}
            {resource.courseId && (
              <Badge variant="outline" className="hover:bg-blue-50">
                {resource.courseId}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <img
              src={resource.uploadedBy.avatar}
              alt={resource.uploadedBy.name}
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{resource.uploadedBy.name}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formattedDate}
          </span>
        </CardFooter>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{resource.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                {resource.type}
              </Badge>
              <Badge variant="outline" className="uppercase">
                {resource.fileType}
              </Badge>
              {resource.department && (
                <Badge variant="outline">
                  {resource.department}
                </Badge>
              )}
              {resource.courseId && (
                <Badge variant="outline">
                  {resource.courseId}
                </Badge>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={resource.uploadedBy.avatar}
                  alt={resource.uploadedBy.name}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{resource.uploadedBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
