// @/components/resources/resource-card.tsx
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/user-context";
import { getFileIcon } from "@/lib/file-utils";
import { fileTypeConfig } from "@/types/resource";
import { ResourceActions } from "./ResourceActions";
import { PreviewHeader } from "./Preview/PreviewHeader";
import { PreviewToolbar } from "./Preview/PreviewToolbar";
import { PreviewContent } from "./Preview/PreviewContent";
import { PreviewDetails } from "./Preview/PreviewDetails";
import { PreviewFooter } from "./Preview/PreviewFooter";
import type { ResourceCardProps } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { useResourceStore } from "@/store/resource-store";

export interface ExtendedResourceCardProps extends ResourceCardProps {
  folders: ResourceFolder[];
  onAddToFolder: (resourceId: string, folderId: string) => Promise<void>;
  onRemoveFromFolder?: (resourceId: string) => Promise<void>;
  showRemoveOption?: boolean;
}

export function ResourceCard({
  resource,
  folders,
  onAddToFolder,
  onRemoveFromFolder,
  showRemoveOption = false,
}: ExtendedResourceCardProps) {
  const handleDownloadResource = useResourceStore(
    (state) => state.handleDownloadResource
  );
  const viewerRef = useRef<HTMLDivElement>(null);

  // State management
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [optimisticFolderId, setOptimisticFolderId] = useState<string | null>(
    resource.folderIds?.[0] || null
  );
  const [loadingFolder, setLoadingFolder] = useState(false);
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const FileIcon = getFileIcon(resource.fileType);
  const fileType = resource.fileType.toLowerCase();
  const styling =
    fileTypeConfig[fileType as keyof typeof fileTypeConfig] ||
    fileTypeConfig.default;
  const toggleFullScreen = () => {
    // Target the viewer pane for entering fullscreen
    const elementToFullscreen = viewerRef.current;
    if (!elementToFullscreen) return;

    if (!isFullScreen) {
      elementToFullscreen.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
        toast({
          title: "Error",
          description: "Could not enter full-screen mode.",
          variant: "destructive",
        });
      });
    } else {
      // Exit is always called on the document
      if (document.fullscreenElement) {
        document
          .exitFullscreen()
          .catch((err) => console.error("Failed to exit fullscreen:", err));
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));

  // Folder assignment handler for UI
  const handleAddToFolder = async (resourceId: string, folderId: string) => {
    try {
      setOptimisticFolderId(folderId);
      setLoadingFolder(true);
      setShowFolderMenu(false);
      await onAddToFolder(resourceId, folderId);
      setLoadingFolder(false);
    } catch (error) {
      setLoadingFolder(false);
      setOptimisticFolderId(null);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add resource to folder",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isPreviewOpen && dialog) {
      const focusableElements = dialog.querySelectorAll(
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

      dialog.focus();
      dialog.addEventListener("keydown", handleKeyDown);
      return () => {
        dialog.removeEventListener("keydown", handleKeyDown);
      };
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
  }, [isPreviewOpen]);

  useEffect(() => {
    if (isPreviewOpen) {
      setIsInitialLoading(true);
      setError(null);
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        // These states should ideally be reset when isPreviewOpen becomes false,
        // not just on effect cleanup (which happens on unmount or dependency change).
        // We'll handle reset explicitly when isPreviewOpen changes below.
      };
    }
  }, [isPreviewOpen]);

  // Reset preview states when the dialog is closed
  useEffect(() => {
    if (!isPreviewOpen) {
      setIsInitialLoading(false);
      setError(null);
      setZoomLevel(1);
      setIsFullScreen(false);
    }
  }, [isPreviewOpen]);

  // Clean up resources when component unmounts - this is for the card itself
  useEffect(() => {
    return () => {
      // Cleanup function
    };
  }, []);

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

            <ResourceActions
              resource={resource}
              styling={styling}
              onPreview={() => setIsPreviewOpen(true)}
              onDownload={() => handleDownloadResource(resource)}
              isDownloading={false}
              user={user}
              folders={folders}
              showFolderMenu={showFolderMenu}
              setShowFolderMenu={setShowFolderMenu}
              optimisticFolderId={optimisticFolderId}
              loadingFolder={loadingFolder}
              handleAddToFolder={handleAddToFolder}
              onRemoveFromFolder={onRemoveFromFolder}
              showRemoveOption={showRemoveOption}
            />
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
              ref={viewerRef}
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
                    onDownload={() => handleDownloadResource(resource)}
                  />
                </div>
              </div>
            </div>
            {!isFullScreen && (
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
            )}
          </div>

          <PreviewFooter
            onClose={() => setIsPreviewOpen(false)}
            onDownload={() => handleDownloadResource(resource)}
            isDownloading={false}
            styling={styling}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
