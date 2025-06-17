import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreviewToolbarProps } from "@/types/resource";

export function PreviewToolbar({
  fileType,
  zoomLevel,
  isFullScreen,
  onZoomIn,
  onZoomOut,
  onToggleFullScreen,
  styling,
}: PreviewToolbarProps) {
  if (!["pdf", "jpg", "jpeg", "png", "gif", "docx", "pptx"].includes(fileType))
    return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b p-2 flex items-center gap-2 justify-center md:justify-end backdrop-blur-sm bg-transparent",
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
}