import { FileIcon, FileTextIcon, ImageIcon, VideoIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface FileAttachmentProps {
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

export function FileAttachment({ fileUrl, fileName, fileType, fileSize }: FileAttachmentProps) {
  if (!fileUrl) return null

  const isImage = fileType.startsWith("image/")
  const isVideo = fileType.startsWith("video/")
  const isAudio = fileType.startsWith("audio/")
  const isText = fileType.startsWith("text/") || fileType.includes("document") || fileType.includes("pdf")

  const formattedSize =
    fileSize < 1024 * 1024 ? `${(fileSize / 1024).toFixed(1)} KB` : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`

  const getIcon = () => {
    if (isImage) return <ImageIcon className="h-6 w-6" />
    if (isVideo) return <VideoIcon className="h-6 w-6" />
    if (isText) return <FileTextIcon className="h-6 w-6" />
    return <FileIcon className="h-6 w-6" />
  }

  return (
    <div className="mt-2 rounded-md border border-border bg-background p-3">
      {isImage ? (
        <div className="relative mb-2 overflow-hidden rounded-md">
          <Image
            src={fileUrl}
            alt={fileName}
            width={300}
            height={200}
            className="h-auto max-h-[200px] w-auto max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formattedSize}</span>
        <Button size="sm" variant="outline" className="text-xs" asChild>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" download={fileName}>
            Download
          </a>
        </Button>
      </div>
    </div>
  )
}
