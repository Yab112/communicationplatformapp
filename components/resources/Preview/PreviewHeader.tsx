import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFileIcon } from "@/lib/file-utils";
import type { PreviewHeaderProps } from "@/types/resource";

export function PreviewHeader({ resource, styling, onClose }: PreviewHeaderProps) {
  const FileIcon = getFileIcon(resource.fileType);
  
  return (
    <DialogHeader
      className={cn(
        "sticky top-0 z-20 border-b p-4 flex items-center justify-between backdrop-blur-sm bg-transparent",

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
}