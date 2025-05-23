import { File, Image, Video, Music, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileAttachmentProps {
  url: string
  name: string
  type: string
  size: number
}

export function FileAttachment({ url, name, type, size }: FileAttachmentProps) {
  const getFileIcon = () => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />
    if (type.startsWith("text/")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isPreviewable = type.startsWith("image/") || type.startsWith("video/")

  return (
    <div className="mt-2 rounded-lg border bg-card p-2">
      {isPreviewable ? (
        <div className="space-y-2">
          {type.startsWith("image/") ? (
            <img
              src={url}
              alt={name}
              className="max-h-48 rounded-md object-cover"
            />
          ) : (
            <video
              src={url}
              controls
              className="max-h-48 rounded-md"
            />
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <span className="text-sm">{name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(size)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <span className="text-sm">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(size)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open(url, "_blank")}
            >
              <File className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
