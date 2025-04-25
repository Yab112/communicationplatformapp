"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFileIcon } from "@/lib/file-utils"
import { Resource } from "@/types/resource"

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const FileIcon = getFileIcon(resource.fileType)

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const handleDownload = () => {
    // In a real app, this would trigger a download
    alert(`Downloading ${resource.title}`)
  }

  return (
    <>
      <motion.div variants={item}>
        <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-0 flex-row gap-2 items-start">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <h3 className="font-medium leading-none line-clamp-1">{resource.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{resource.subject}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex-1">
            <p className="text-sm line-clamp-2 mb-3">{resource.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })}
            </p>
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
