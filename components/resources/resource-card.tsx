"use client"

import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye, Loader2, X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react"
import type { Resource } from "@/types/resource"
import { getFileIcon } from "@/lib/file-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// File type configurations for styling
const fileTypeConfig = {
  pdf: {
    bgColor: "bg-red-50 hover:bg-red-100",
    borderColor: "border-blue-200",
    iconColor: "text-red-600",
    badgeColor: "bg-red-100 text-red-700 hover:bg-red-200",
    buttonColor: "bg-red-500 hover:bg-red-600",
  },
  docx: {
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  pptx: {
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    badgeColor: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
  },
  xlsx: {
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    badgeColor: "bg-green-100 text-green-700 hover:bg-green-200",
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
  zip: {
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
  },
  rar: {
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
  },
  mp4: {
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  mp3: {
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    borderColor: "border-indigo-200",
    iconColor: "text-indigo-600",
    badgeColor: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    buttonColor: "bg-indigo-500 hover:bg-indigo-600",
  },
  jpg: {
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
  },
  png: {
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
  },
  default: {
    bgColor: "bg-slate-50 hover:bg-slate-100",
    borderColor: "border-slate-200",
    iconColor: "text-slate-600",
    badgeColor: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    buttonColor: "bg-slate-500 hover:bg-slate-600",
  },
}

interface ResourceCardProps {
  resource: Resource
}

// Preview Modal Components
const PreviewHeader = ({ resource, styling, onClose }: { resource: Resource; styling: any; onClose: () => void }) => {
  const FileIcon = getFileIcon(resource.fileType)
  return (
    <DialogHeader className="sticky top-0 z-20 bg-white border-b p-4 flex items-center justify-between backdrop-blur-sm bg-white/90">
      <div className="flex items-center gap-3">
        <FileIcon className={cn("h-6 w-6", styling.iconColor)} />
        <DialogTitle className="text-xl font-semibold line-clamp-1">{resource.title}</DialogTitle>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={cn(styling.badgeColor, "text-sm font-medium")}>
          {resource.type}
        </Badge>
        <Badge variant="outline" className="uppercase text-blue-600 border-blue-200 text-sm font-medium">
          {resource.fileType}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </DialogHeader>
  )
}

const PreviewToolbar = ({
  fileType,
  zoomLevel,
  isFullScreen,
  onZoomIn,
  onZoomOut,
  onToggleFullScreen,
}: {
  fileType: string
  zoomLevel: number
  isFullScreen: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFullScreen: () => void
}) => {
  if (!["pdf", "jpg", "jpeg", "png", "gif"].includes(fileType)) return null

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b p-2 flex items-center gap-2 justify-center md:justify-end">
      <div className="bg-white border rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.5}
          aria-label="Zoom out (Press -)"
          className="h-8 w-8 rounded-full"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium px-1">{Math.round(zoomLevel * 100)}%</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={zoomLevel >= 3}
          aria-label="Zoom in (Press +)"
          className="h-8 w-8 rounded-full"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullScreen}
        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
        className="rounded-full h-8 w-8"
      >
        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}

const PreviewContent = ({
  resource,
  fileType,
  zoomLevel,
  isLoading,
  error,
  onRetry,
  styling,
  onDownload,
}: {
  resource: Resource
  fileType: string
  zoomLevel: number
  isLoading: boolean
  error: string | null
  onRetry: () => void
  styling: any
  onDownload: () => void
}) => {
  const FileIcon = getFileIcon(resource.fileType)

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium text-gray-600">Loading preview...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-md">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <FileIcon className={cn("h-16 w-16", styling.iconColor)} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error Loading Preview</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button variant="outline" onClick={onRetry} className="px-6">
          Try Again
        </Button>
      </div>
    )
  }

  switch (fileType) {
    case "pdf":
      return (
        <iframe
          src={`${window.location.origin}${resource.url}#toolbar=0&navpanes=0&zoom=${zoomLevel * 100}`}
          className="w-full h-full rounded-md border shadow-xl bg-white"
          style={{ minHeight: "300px", maxHeight: "100%" }}
          title={resource.title}
        />
      )
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return (
        <div className="flex items-center justify-center w-full h-full overflow-hidden bg-[#f5f5f5] bg-opacity-50 backdrop-blur-sm p-4">
          <img
            src={`${window.location.origin}${resource.url}`}
            alt={resource.title}
            className="max-w-full max-h-full object-contain rounded-md shadow-xl"
            style={{
              transform: `scale(${zoomLevel})`,
              transition: "transform 0.2s",
              filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
            }}
          />
        </div>
      )
    case "mp4":
    case "webm":
    case "mov":
      return (
        <div className="flex items-center justify-center w-full h-full overflow-hidden bg-black rounded-lg">
          <video controls className="max-w-full max-h-full rounded-md shadow-xl">
            <source src={`${window.location.origin}${resource.url}`} type={`video/${fileType}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    case "mp3":
    case "wav":
    case "ogg":
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl p-8">
          <div className="bg-white p-6 rounded-full shadow-md mb-8">
            <FileIcon className="h-24 w-24 text-blue-600" />
          </div>
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">{resource.title}</h3>
            <audio controls className="w-full mb-4">
              <source src={`${window.location.origin}${resource.url}`} type={`audio/${fileType}`} />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-xl p-8">
          <div className={cn("p-8 rounded-full mb-8", styling.bgColor)}>
            <FileIcon className={cn("h-24 w-24", styling.iconColor)} />
          </div>
          <div className="text-center max-w-lg">
            <p className="text-2xl font-bold mb-3">Preview not available</p>
            <p className="text-muted-foreground mb-8 text-lg">
              {fileType === "zip" || fileType === "rar"
                ? "This is a compressed archive file. Please download to extract its contents."
                : fileType === "docx" || fileType === "pptx" || fileType === "xlsx"
                  ? `This is a Microsoft Office ${fileType === "docx" ? "Word" : fileType === "pptx" ? "PowerPoint" : "Excel"} file. Please download to view.`
                  : "Please download the file to view its contents."}
            </p>
            <Button onClick={onDownload} className={cn("px-8 py-6 text-lg", styling.buttonColor)}>
              <Download className="mr-2 h-5 w-5" />
              Download {fileType.toUpperCase()}
            </Button>
          </div>
        </div>
      )
  }
}

const PreviewDetails = ({ resource, FileIcon, styling }: { resource: Resource; FileIcon: any; styling: any }) => (
  <div className="w-full h-full overflow-y-auto p-6 flex flex-col">
    <div className="space-y-8 flex-1">
      {/* File Information */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-600 sticky top-0 bg-gray-50 py-2 flex items-center gap-2">
          <FileIcon className={cn("h-5 w-5", styling.iconColor)} />
          File Information
        </h3>
        <div className="grid grid-cols-2 gap-y-3 bg-white rounded-lg p-4 shadow-sm">
          <span className="text-sm text-muted-foreground">Type:</span>
          <span className="text-sm font-medium">{resource.fileType.toUpperCase()}</span>
          <span className="text-sm text-muted-foreground">Size:</span>
          <span className="text-sm font-medium">{resource.fileSize}</span>
        </div>
      </div>

      {/* Department & Course */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-600 sticky top-0 bg-gray-50 py-2">Department & Course</h3>
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-4 shadow-sm">
          {resource.department && (
            <Badge variant="outline" className="text-base px-3 py-1 bg-white">
              {resource.department}
            </Badge>
          )}
          {resource.courseId && (
            <Badge variant="outline" className="text-base px-3 py-1 bg-white">
              {resource.courseId}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-600 sticky top-0 bg-gray-50 py-2">Description</h3>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-base leading-relaxed break-words">{resource.description}</p>
        </div>
      </div>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-600 sticky top-0 bg-gray-50 py-2">Tags</h3>
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-4 shadow-sm">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm px-3 py-1 bg-white">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Upload Information */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-600 sticky top-0 bg-gray-50 py-2">Upload Information</h3>
        <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm">
          <div className="relative">
            <img
              src={resource.uploadedBy.avatar || "/placeholder.svg?height=48&width=48"}
              alt={resource.uploadedBy.name}
              className="h-14 w-14 rounded-full border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="text-lg font-medium">{resource.uploadedBy.name}</p>
            <p className="text-base text-muted-foreground">
              {formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const PreviewFooter = ({
  onClose,
  onDownload,
  isDownloading,
  styling,
}: {
  onClose: () => void
  onDownload: () => void
  isDownloading: boolean
  styling: any
}) => (
  <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-sm border-t p-4 flex justify-end gap-4 flex-wrap">
    <Button variant="outline" onClick={onClose} className="px-4 py-2 sm:px-6 sm:py-2 rounded-full">
      Close
    </Button>
    <Button
      onClick={onDownload}
      disabled={isDownloading}
      className={cn(
        "px-4 py-2 sm:px-6 sm:py-2 rounded-full shadow-md transition-all hover:shadow-lg",
        styling.buttonColor,
      )}
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
)

export function ResourceCard({ resource }: ResourceCardProps) {
  // State management
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hooks and refs
  const { toast } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const FileIcon = getFileIcon(resource.fileType)
  const fileType = resource.fileType.toLowerCase()
  const styling = fileTypeConfig[fileType as keyof typeof fileTypeConfig] || fileTypeConfig.default

  // Event handlers
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
      const downloadUrl = resource.url.startsWith("http") ? resource.url : `${window.location.origin}${resource.url}`

      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const fileExtension = resource.fileType.toLowerCase()
      const sanitizedTitle = resource.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      link.download = `${sanitizedTitle}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "File downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download file.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      dialogRef.current?.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err)
        toast({
          title: "Error",
          description: "Failed to enter full-screen mode",
          variant: "destructive",
        })
      })
    } else {
      document.exitFullscreen().catch((err) => console.error("Failed to exit fullscreen:", err))
    }
    setIsFullScreen(!isFullScreen)
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))

  // Effects
  useEffect(() => {
    if (isPreviewOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      dialogRef.current.focus()
      dialogRef.current.addEventListener("keydown", handleKeyDown)
      return () => dialogRef.current?.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPreviewOpen])

  useEffect(() => {
    if (isPreviewOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault()
          handleZoomIn()
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault()
          handleZoomOut()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPreviewOpen, zoomLevel])

  useEffect(() => {
    if (isPreviewOpen) {
      setIsInitialLoading(true)
      setError(null)
    } else {
      setIsInitialLoading(false)
      setError(null)
      setZoomLevel(1)
    }
  }, [isPreviewOpen])

  const formattedDate =
    typeof window !== "undefined" ? formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true }) : ""

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden hover:shadow-md transition-all duration-200 border-l-4",
          styling.borderColor,
        )}
      >
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight line-clamp-1">{resource.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={cn("flex items-center gap-1", styling.iconColor)}>
                  <FileIcon className={cn("h-4 w-4", styling.iconColor)} />
                  {resource.fileType.toUpperCase()}
                </span>
                <span>•</span>
                <span>{resource.fileSize}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewOpen(true)}
                className={cn("hover:bg-opacity-70", styling.iconColor)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("hover:bg-opacity-70", styling.iconColor)}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className={styling.badgeColor}>
              {resource.type}
            </Badge>
            {resource.department && (
              <Badge variant="outline" className="hover:bg-opacity-70">
                {resource.department}
              </Badge>
            )}
            {resource.courseId && (
              <Badge variant="outline" className="hover:bg-opacity-70">
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
              src={resource.uploadedBy.avatar || "/placeholder.svg"}
              alt={resource.uploadedBy.name}
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{resource.uploadedBy.name}</span>
          </div>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </CardFooter>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent 
          ref={dialogRef}
          className="!w-[98vw] !max-w-[2400px] !h-[95vh] !p-0 flex flex-col animate-in fade-in-50 duration-300 overflow-hidden rounded-xl border-0 shadow-2xl"
          aria-describedby="preview-description"
        >
          <PreviewHeader resource={resource} styling={styling} onClose={() => setIsPreviewOpen(false)} />

          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            <div className="flex-[4_4_0%] min-w-0 h-full flex flex-col bg-gradient-to-b from-white to-gray-50 relative">
              <PreviewToolbar
                fileType={fileType}
                zoomLevel={zoomLevel}
                isFullScreen={isFullScreen}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggleFullScreen={toggleFullScreen}
              />

              <div className="flex-1 flex items-center justify-center overflow-hidden p-6 bg-gray-50 bg-opacity-70 backdrop-blur-sm relative">
                <div className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 shadow-lg">
                  <PreviewContent
                    resource={resource}
                    fileType={fileType}
                    zoomLevel={zoomLevel}
                    isLoading={isInitialLoading}
                    error={error}
                    onRetry={() => {
                      setError(null)
                      setIsInitialLoading(true)
                    }}
                    styling={styling}
                    onDownload={handleDownload}
                  />
                  </div>
              </div>
            </div>

            <div className="w-full md:w-[800px] h-full overflow-y-auto bg-gray-50 border-t md:border-t-0 md:border-l flex flex-col shadow-inner">
              <PreviewDetails resource={resource} FileIcon={FileIcon} styling={styling} />
            </div>
          </div>

          <PreviewFooter
            onClose={() => setIsPreviewOpen(false)}
            onDownload={handleDownload}
            isDownloading={isDownloading}
            styling={styling}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
