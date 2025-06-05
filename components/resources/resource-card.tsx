import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Plus,
} from "lucide-react";
import type { Resource } from "@/types/resource";
import { getFileIcon } from "@/lib/file-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/user-context";
import {
  getResourceFolders,
  addResourceToFolder,
} from "@/lib/actions/resources";
import type { ResourceFolder } from "@/types/resource-folder";

// FileTypeStyle type (unchanged)
type FileTypeStyle = {
  bgColor: string;
  borderColor: string;
  iconColor: string;
  badgeColor: string;
  buttonColor: string;
  previewBg: string;
  cardBg: string;
  cardHoverBg: string;
  darkCardBg: string;
  darkCardHoverBg: string;
};

// fileTypeConfig (unchanged, included for reference)
const fileTypeConfig: Record<string, FileTypeStyle> = {
  pdf: {
    bgColor:
      "bg-white hover:bg-red-50/50 dark:bg-gray-900 dark:hover:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    badgeColor:
      "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70",
    buttonColor:
      "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
    previewBg:
      "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-red-50/50 dark:hover:bg-red-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-red-950/30",
  },
  docx: {
    bgColor:
      "bg-white hover:bg-blue-50/50 dark:bg-gray-900 dark:hover:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeColor:
      "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70",
    buttonColor:
      "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    previewBg:
      "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-blue-950/30",
  },
  pptx: {
    bgColor:
      "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-950/70",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    badgeColor:
      "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/70",
    buttonColor:
      "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
    previewBg:
      "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-orange-50/50 dark:hover:bg-orange-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-orange-950/30",
  },
  xlsx: {
    bgColor:
      "bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-950/70",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    badgeColor:
      "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70",
    buttonColor:
      "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    previewBg:
      "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-green-50/50 dark:hover:bg-green-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-green-950/30",
  },
  zip: {
    bgColor:
      "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-950/70",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeColor:
      "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/70",
    buttonColor:
      "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
    previewBg:
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-purple-950/30",
  },
  rar: {
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    previewBg:
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-purple-950/30",
  },
  mp4: {
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    previewBg:
      "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-blue-950/30",
  },
  mp3: {
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    borderColor: "border-indigo-200",
    iconColor: "text-indigo-600",
    badgeColor: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    buttonColor: "bg-indigo-500 hover:bg-indigo-600",
    previewBg:
      "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-indigo-950/30",
  },
  jpg: {
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
    previewBg:
      "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-amber-950/30",
  },
  png: {
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
    previewBg:
      "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-amber-950/30",
  },
  default: {
    bgColor:
      "bg-white hover:bg-slate-50/50 dark:bg-gray-900 dark:hover:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    badgeColor:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900/70",
    buttonColor:
      "bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700",
    previewBg:
      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-slate-950/30",
  },
};

interface ResourceCardProps {
  resource: Resource;
}

// PreviewHeader (unchanged, included for completeness)
const PreviewHeader = ({
  resource,
  styling,
  onClose,
}: {
  resource: Resource;
  styling: any;
  onClose: () => void;
}) => {
  const FileIcon = getFileIcon(resource.fileType);
  return (
    <DialogHeader
      className={cn(
        "sticky top-0 z-20 border-b p-4 flex items-center justify-between backdrop-blur-sm",
        styling.previewBg
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", styling.bgColor)}>
          <FileIcon className={cn("h-6 w-6", styling.iconColor)} />
        </div>
        <DialogTitle className="text-xl font-semibold line-clamp-1 text-[var(--color-fg)]">
          {resource.title}
        </DialogTitle>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className={cn(styling.badgeColor, "text-sm font-medium")}
        >
          {resource.type}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "uppercase text-sm font-medium",
            styling.iconColor,
            styling.borderColor
          )}
        >
          {resource.fileType}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cn("hover:bg-opacity-70 rounded-full", styling.iconColor)}
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </DialogHeader>
  );
};

// PreviewToolbar (unchanged, included for completeness)
const PreviewToolbar = ({
  fileType,
  zoomLevel,
  isFullScreen,
  onZoomIn,
  onZoomOut,
  onToggleFullScreen,
  styling,
}: {
  fileType: string;
  zoomLevel: number;
  isFullScreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullScreen: () => void;
  styling: any;
}) => {
  if (!["pdf", "jpg", "jpeg", "png", "gif", "docx", "pptx"].includes(fileType))
    return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b p-2 flex items-center gap-2 justify-center md:justify-end backdrop-blur-sm",
        styling.previewBg
      )}
    >
      <div
        className={cn(
          "rounded-full px-3 py-1 flex items-center gap-1 shadow-sm",
          styling.bgColor
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.5}
          aria-label="Zoom out (Press -)"
          className={cn("h-8 w-8 rounded-full", styling.iconColor)}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className={cn("text-xs font-medium px-1", styling.iconColor)}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={zoomLevel >= 3}
          aria-label="Zoom in (Press +)"
          className={cn("h-8 w-8 rounded-full", styling.iconColor)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullScreen}
        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
        className={cn(
          "rounded-full h-8 w-8",
          styling.borderColor,
          styling.iconColor
        )}
      >
        {isFullScreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

// Updated PreviewContent
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
  resource: Resource;
  fileType: string;
  zoomLevel: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  styling: any;
  onDownload: () => void;
}) => {
  const FileIcon = getFileIcon(resource.fileType);
  const [iframeLoading, setIframeLoading] = useState(true);

  if (isLoading) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm",
          styling.previewBg,
          "bg-opacity-80 dark:bg-black dark:bg-opacity-90"
        )}
      >
        <div className={cn("p-4 rounded-full mb-4", styling.bgColor)}>
          <Loader2
            className={cn("h-12 w-12 animate-spin", styling.iconColor)}
          />
        </div>
        <p className={cn("text-sm font-medium", styling.iconColor)}>
          Loading preview...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center rounded-xl shadow-md",
          styling.cardBg
        )}
      >
        <div className={cn("p-4 rounded-full mb-4", styling.bgColor)}>
          <FileIcon className={cn("h-16 w-16", styling.iconColor)} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[var(--color-fg)]">
          Error Loading Preview
        </h3>
        <p className="text-[var(--color-muted-fg)] mb-6 max-w-md">{error}</p>
        <Button variant="outline" onClick={onRetry} className="px-6">
          Try Again
        </Button>
      </div>
    );
  }

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  switch (fileType) {
    case "pdf":
      const pdfUrl = (resource.url || "").startsWith("http")
        ? resource.url
        : `${window.location.origin}${resource.url}`;
      return (
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden",
            styling.cardBg
          )}
        >
          <div
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              styling.previewBg,
              "bg-opacity-80 dark:bg-black dark:bg-opacity-90"
            )}
          />
          {iframeLoading && (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center bg-opacity-90 backdrop-blur-sm",
                styling.previewBg,
                "dark:bg-black dark:bg-opacity-80"
              )}
            >
              <Loader2
                className={cn(
                  "h-12 w-12 animate-spin",
                  styling.iconColor,
                  "mb-4"
                )}
              />
              <p className={cn("text-sm font-medium", styling.iconColor)}>
                Loading PDF preview...
              </p>
            </div>
          )}
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&zoom=${zoomLevel * 100}`}
            className={cn(
              "relative w-full h-full rounded-md border-0 shadow-xl",
              styling.cardBg
            )}
            style={{ minHeight: "300px", maxHeight: "100%" }}
            title={resource.title}
            onLoad={handleIframeLoad}
          />
        </div>
      );
    case "docx":
    case "pptx":
      const officeUrl = (resource.url || "").startsWith("http")
        ? resource.url || ""
        : `${window.location.origin}${resource.url || ""}`;
      return (
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden",
            styling.cardBg
          )}
        >
          <div
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              styling.previewBg,
              "bg-opacity-80 dark:bg-black dark:bg-opacity-90"
            )}
          />
          {iframeLoading && (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center bg-opacity-90 backdrop-blur-sm",
                styling.previewBg,
                "dark:bg-black dark:bg-opacity-80"
              )}
            >
              <Loader2
                className={cn(
                  "h-12 w-12 animate-spin",
                  styling.iconColor,
                  "mb-4"
                )}
              />
              <p className={cn("text-sm font-medium", styling.iconColor)}>
                Loading document preview...
              </p>
            </div>
          )}
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              officeUrl
            )}`}
            className={cn(
              "relative w-full h-full rounded-md border-0 shadow-xl",
              styling.cardBg
            )}
            style={{ minHeight: "300px", maxHeight: "100%" }}
            title={resource.title}
            onLoad={handleIframeLoad}
          />
        </div>
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      const imageUrl = (resource.url || "").startsWith("http")
        ? resource.url
        : `${window.location.origin}${resource.url}`;
      return (
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden",
            styling.cardBg
          )}
        >
          <div
            className={cn(
              "absolute inset-0 backdrop-blur-sm",
              styling.previewBg,
              "bg-opacity-80 dark:bg-black dark:bg-opacity-90"
            )}
          />
          <img
            src={imageUrl}
            alt={resource.title}
            className="relative max-w-full max-h-full object-contain rounded-md shadow-xl"
            style={{
              transform: `scale(${zoomLevel})`,
              transition: "transform 0.2s ease-in-out",
            }}
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      );
    default:
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-8 text-center rounded-xl shadow-md",
            styling.cardBg
          )}
        >
          <div className={cn("p-6 rounded-full mb-6", styling.bgColor)}>
            <FileIcon className={cn("h-24 w-24", styling.iconColor)} />
          </div>
          <p className="text-2xl font-bold mb-3 text-[var(--color-fg)]">
            Preview not available
          </p>
          <p className="text-[var(--color-muted-fg)] mb-6 max-w-md">
            This file type cannot be previewed. Please download the file to view
            its contents.
          </p>
          <Button
            onClick={onDownload}
            className={cn(styling.buttonColor, "text-white px-6")}
          >
            Download File
          </Button>
        </div>
      );
  }
};

// PreviewDetails (unchanged from previous response, included for completeness)
const PreviewDetails = ({
  resource,
  FileIcon,
  styling,
}: {
  resource: Resource;
  FileIcon: any;
  styling: any;
}) => ( 
  <div
    className={cn(
      "w-full h-full overflow-y-auto p-4 sm:p-6 flex flex-col",
      styling.cardBg
    )}
  >
    <div className="space-y-6 flex-1">
      {/* Upload Information */}
      <div className="space-y-3">
        <h3
          className={cn(
            "text-lg font-semibold flex items-center gap-2 sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
            styling.previewBg
          )}
        >
          <FileIcon className={cn("h-5 w-5", styling.iconColor)} />
          Upload Information
        </h3>
        <div className={cn("rounded-lg p-4 shadow-sm", styling.bgColor)}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  resource.uploadedBy.avatar ||
                  "/placeholder.svg?height=48&width=48"
                }
                alt={resource.uploadedBy.name}
                className={cn(
                  "h-12 w-12 rounded-full ring-2 ring-offset-2",
                  styling.borderColor
                )}
              />
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 bg-green-500 h-3 w-3 rounded-full border-2",
                  styling.borderColor
                )}
              />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {resource.uploadedBy.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDistanceToNow(new Date(resource.uploadDate), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* File Information */}
      <div className="space-y-3">
        <h3
          className={cn(
            "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
            styling.previewBg
          )}
        >
          File Information
        </h3>
        <div
          className={cn(
            "rounded-lg p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4",
            styling.bgColor
          )}
        >
          <div className="space-y-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Type
            </span>
            <div className="flex items-center gap-2">
              <FileIcon className={cn("h-4 w-4", styling.iconColor)} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {resource.fileType.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Size
            </span>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resource.fileSize}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Category
            </span>
            <Badge variant="secondary" className={styling.badgeColor}>
              {resource.type}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Upload Date
            </span>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {new Date(resource.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Department & Course */}
      <div className="space-y-3">
        <h3
          className={cn(
            "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
            styling.previewBg
          )}
        >
          Department & Course
        </h3>
        <div
          className={cn("rounded-lg p-4 shadow-sm space-y-3", styling.bgColor)}
        >
          {resource.department ? (
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Department
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-sm px-3 py-1",
                  styling.borderColor,
                  styling.iconColor
                )}
              >
                {resource.department}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No department specified
            </p>
          )}
          {resource.courseId && (
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Course
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-sm px-3 py-1",
                  styling.borderColor,
                  styling.iconColor
                )}
              >
                {resource.courseId}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="space-y-3">
          <h3
            className={cn(
              "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
              styling.previewBg
            )}
          >
            Tags
          </h3>
          <div className={cn("rounded-lg p-4 shadow-sm", styling.bgColor)}>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1",
                    styling.borderColor,
                    styling.iconColor
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-3">
        <h3
          className={cn(
            "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
            styling.previewBg
          )}
        >
          Description
        </h3>
        <div className={cn("rounded-lg p-4 shadow-sm", styling.bgColor)}>
          <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-gray-100">
            {resource.description || "No description available"}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// PreviewFooter (unchanged, included for completeness)
const PreviewFooter = ({
  onClose,
  onDownload,
  isDownloading,
  styling,
}: {
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  styling: any;
}) => (
  <div
    className={cn(
      "sticky bottom-0 z-10 border-t p-4 flex justify-end gap-4 flex-wrap backdrop-blur-sm",
      styling.previewBg
    )}
  >
    <Button
      variant="outline"
      onClick={onClose}
      className={cn(
        "px-4 py-2 sm:px-6 sm:py-2 rounded-full",
        styling.borderColor,
        styling.iconColor
      )}
    >
      Close
    </Button>
    <Button
      onClick={onDownload}
      disabled={isDownloading}
      className={cn(
        "px-4 py-2 sm:px-6 sm:py-2 rounded-full shadow-md transition-all hover:shadow-lg",
        styling.buttonColor
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
);

export function ResourceCard({ resource }: ResourceCardProps) {
  // State management
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [optimisticFolderId, setOptimisticFolderId] = useState<string | null>(
    resource.folderId || null
  );
  const [loadingFolder, setLoadingFolder] = useState(false);

  // Hooks and refs
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const FileIcon = getFileIcon(resource.fileType);
  const fileType = resource.fileType.toLowerCase();
  const styling =
    fileTypeConfig[fileType as keyof typeof fileTypeConfig] ||
    fileTypeConfig.default;

  // Event handlers
  const handleDownload = async () => {
    if (!resource.url) {
      toast({
        title: "Error",
        description: "No file URL available for download",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const downloadUrl = resource.url.startsWith("http")
        ? resource.url
        : `${window.location.origin}${resource.url}`;
      const response = await fetch(downloadUrl);
      if (!response.ok)
        throw new Error(`Failed to download file: ${response.statusText}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileExtension = resource.fileType.toLowerCase();
      const sanitizedTitle = resource.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      link.download = `${sanitizedTitle}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to download file.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      dialogRef.current?.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
        toast({
          title: "Error",
          description: "Failed to enter full-screen mode",
          variant: "destructive",
        });
      });
    } else {
      document
        .exitFullscreen()
        .catch((err) => console.error("Failed to exit fullscreen:", err));
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));

  useEffect(() => {
    if (isPreviewOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      dialogRef.current.focus();
      dialogRef.current.addEventListener("keydown", handleKeyDown);
      return () =>
        dialogRef.current?.removeEventListener("keydown", handleKeyDown);
    }
  }, [isPreviewOpen]);

  useEffect(() => {
    if (isPreviewOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          handleZoomOut();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isPreviewOpen, zoomLevel]);

  useEffect(() => {
    if (isPreviewOpen) {
      setIsInitialLoading(true);
      setError(null);
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsInitialLoading(false);
      setError(null);
      setZoomLevel(1);
    }
  }, [isPreviewOpen]);

  useEffect(() => {
    if (
      user &&
      (user.role.toLowerCase() === "teacher" ||
        user.role.toLowerCase() === "admin")
    ) {
      getResourceFolders().then(({ folders }) => {
        setFolders(
          folders.map((f) => ({
            ...f,
            description: f.description ?? undefined,
            createdAt:
              typeof f.createdAt === "string"
                ? f.createdAt
                : f.createdAt.toISOString(),
            updatedAt:
              typeof f.updatedAt === "string"
                ? f.updatedAt
                : f.updatedAt.toISOString(),
          }))
        );
      });
    }
  }, [user]);
  
  const handleAddToFolder = async (folderId: string) => {
    setOptimisticFolderId(folderId);
    setLoadingFolder(true);
    setShowFolderMenu(false);
    await addResourceToFolder(resource.id, folderId);
    setLoadingFolder(false);
  };

  const formattedDate =
    typeof window !== "undefined"
      ? formatDistanceToNow(new Date(resource.uploadDate), { addSuffix: true })
      : "";

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          styling.cardBg,
          styling.cardHoverBg,
          "hover:shadow-lg hover:scale-[1.02]"
        )}
      >
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight line-clamp-1">
                {resource.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className={cn("flex items-center gap-1", styling.iconColor)}
                >
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
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              {user && (user.role.toLowerCase() === "teacher" || user.role.toLowerCase() === "admin") && (
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn("hover:bg-opacity-70", styling.iconColor)}
                    onClick={() => setShowFolderMenu((v) => !v)}
                    aria-label="Add to folder"
                    disabled={loadingFolder}
                  >
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </Button>
                  {showFolderMenu && (
                    <div className="absolute z-50 mt-2 right-0 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded shadow-lg min-w-[180px]">
                      {folders.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No folders found</div>
                      ) : (
                        folders.map((folder) => {
                          return (
                            <button
                              key={folder.id}
                              className={`w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors ${
                                optimisticFolderId === folder.id
                                  ? "bg-blue-50 dark:bg-blue-900 font-semibold"
                                  : ""
                              }`}
                              onClick={() => handleAddToFolder(folder.id)}
                              disabled={loadingFolder}
                            >
                              {folder.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className={styling.badgeColor}>
              {resource.type}
            </Badge>
            {resource.department && (
              <Badge
                variant="outline"
                className={cn(
                  "hover:bg-opacity-70",
                  styling.borderColor,
                  styling.iconColor
                )}
              >
                {resource.department}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <img
              src={resource.uploadedBy.avatar || "/placeholder.svg"}
              alt={resource.uploadedBy.name}
              className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-background"
            />
            <span className="text-sm text-muted-foreground">
              {resource.uploadedBy.name}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </CardFooter>

        {user &&
          (user.role.toLowerCase() === "teacher" ||
            user.role.toLowerCase() === "admin") && (
            <div className="relative flex items-center gap-2 mt-2">
              <Button
                size="icon"
                variant="ghost"
                className="border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 hover:bg-blue-100/60 dark:hover:bg-blue-900/60"
                onClick={() => setShowFolderMenu((v) => !v)}
                aria-label="Add to folder"
                disabled={loadingFolder}
              >
                <Plus className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </Button>
              {showFolderMenu && (
                <div className="absolute z-50 mt-2 right-0 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded shadow-lg min-w-[180px]">
                  {folders.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No folders found
                    </div>
                  ) : (
                    folders.map((folder) => (
                      <button
                        key={folder.id}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors ${
                          optimisticFolderId === folder.id
                            ? "bg-blue-50 dark:bg-blue-900 font-semibold"
                            : ""
                        }`}
                        onClick={() => handleAddToFolder(folder.id)}
                        disabled={loadingFolder}
                      >
                        {folder.name}
                      </button>
                    ))
                  )}
                </div>
              )}
              {optimisticFolderId && (
                <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                  {folders.find((f) => f.id === optimisticFolderId)?.name ||
                    "In Folder"}
                </span>
              )}
            </div>
          )}
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          ref={dialogRef}
          className={cn(
            "!w-[98vw] !max-w-[2400px] !h-[95vh] !p-0 flex flex-col animate-in fade-in-50 duration-300 overflow-hidden rounded-xl border-0 shadow-2xl",
            styling.cardBg
          )}
          aria-describedby="preview-description"
        >
          <PreviewHeader
            resource={resource}
            styling={styling}
            onClose={() => setIsPreviewOpen(false)}
          />

          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            <div
              className={cn(
                "flex-[4_4_0%] min-w-0 h-full flex flex-col relative",
                styling.previewBg,
                "bg-opacity-80 dark:bg-black dark:bg-opacity-90 backdrop-blur-sm"
              )}
            >
              <PreviewToolbar
                fileType={fileType}
                zoomLevel={zoomLevel}
                isFullScreen={isFullScreen}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggleFullScreen={toggleFullScreen}
                styling={styling}
              />

              <div
                className={cn(
                  "flex-1 flex items-center justify-center overflow-hidden p-6 relative",
                  styling.previewBg,
                  "bg-opacity-80 dark:bg-black dark:bg-opacity-90 backdrop-blur-sm"
                )}
              >
                <div className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 shadow-lg">
                  <PreviewContent
                    resource={resource}
                    fileType={fileType}
                    zoomLevel={zoomLevel}
                    isLoading={isInitialLoading}
                    error={error}
                    onRetry={() => {
                      setError(null);
                      setIsInitialLoading(true);
                    }}
                    styling={styling}
                    onDownload={handleDownload}
                  />
                </div>
              </div>
            </div>

            <div
              className={cn(
                "w-full md:w-[800px] h-full overflow-y-auto border-t md:border-t-0 md:border-l flex flex-col shadow-inner",
                styling.cardBg
              )}
            >
              <PreviewDetails
                resource={resource}
                FileIcon={FileIcon}
                styling={styling}
              />
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
  );
}
