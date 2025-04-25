"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import type { Resource } from "@/types/resource"
import { getFileIcon } from "@/lib/file-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const FileIcon = getFileIcon(resource.fileType)

  const handleDownload = () => {
    // Handle download here
  }

  return (
    <>
      <div className="transition-all duration-200 hover:scale-[1.01] hover:shadow-md">
        <Card className="h-full flex flex-col overflow-hidden border border-muted rounded-xl bg-white dark:bg-zinc-900 transition-colors duration-200 hover:bg-muted/50">
          <CardHeader className="p-4 pb-0 flex-row gap-3 items-start">
            <div className="h-10 w-10 rounded-lg  flex items-center justify-center text-primary">
              <FileIcon className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-base leading-snug line-clamp-1">{resource.title}</h3>
              <p className="text-xs text-muted-foreground">{resource.subject}</p>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 flex-1">
            <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{resource.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge>{resource.fileType.toUpperCase()}</Badge>
              <span className="text-sm text-muted-foreground">
                Uploaded {formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })}
              </span>
            </div>
            <div className="bg-muted rounded-md p-4 min-h-[300px] flex items-center justify-center">
              {resource.fileType === "pdf" ? (
                <iframe
                  src="/placeholder.svg?height=400&width=600"
                  className="w-full h-[400px]"
                  title={resource.title}
                />
              ) : (
                <div className="text-center">
                  <FileIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p>Preview not available for this file type</p>
                  <Button className="mt-4" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to view
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Description</h3>
              <p>{resource.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
