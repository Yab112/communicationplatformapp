import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileIcon } from "@/lib/file-utils";
import type { PreviewContentProps } from "@/types/resource";

export function PreviewContent({
  resource,
  fileType,
  zoomLevel,
  isLoading,
  error,
  onRetry,
  styling,
  onDownload,
}: PreviewContentProps) {
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
}