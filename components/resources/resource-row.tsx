"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, ChevronRight } from "lucide-react"
import type { Resource } from "@/types/resource"
import { getFileIcon } from "@/lib/file-utils"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ResourceRowProps {
  resource: Resource
}

export function ResourceRow({ resource }: ResourceRowProps) {
  const [showPreview, setShowPreview] = useState(false)
  const FileIcon = getFileIcon(resource.fileType)

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  const handleDownload = () => {
    // In a real app, this would trigger a download
    alert(`Downloading ${resource.title}`)
  }

  return (
    <>
      <motion.div variants={item}>
        <div className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-4">
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <h3 className="font-medium truncate">{resource.title}</h3>
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resource.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="truncate">{resource.subject}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })}</span>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setShowPreview(true)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

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
