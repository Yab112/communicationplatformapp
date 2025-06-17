import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreviewFooterProps } from "@/types/resource";

export function PreviewFooter({
  onClose,
  onDownload,
  isDownloading,
  styling,
}: PreviewFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 border-t p-4 flex justify-end gap-4 flex-wrap backdrop-blur-sm bg-transparent",
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
}