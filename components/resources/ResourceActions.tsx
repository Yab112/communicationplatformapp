import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResourceActionsProps } from "@/types/resource";

export function ResourceActions({
  //   resource,
  styling,
  onPreview,
  onDownload,
  isDownloading,
  folders,
  showFolderMenu,
  setShowFolderMenu,
  optimisticFolderId,
  loadingFolder,
  handleAddToFolder,
}: ResourceActionsProps) {
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPreview}
        className={cn("hover:bg-opacity-70", styling.iconColor)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("hover:bg-opacity-70", styling.iconColor)}
        onClick={onDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>

      <div className="relative">
        <Button
          size="icon"
          variant="ghost"
          className={cn("hover:bg-opacity-70", styling.iconColor)}
          onClick={() => setShowFolderMenu(!showFolderMenu)} // Fixed this line
          aria-label="Add to folder"
          disabled={loadingFolder}
        >
          <Plus className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        </Button>
        {showFolderMenu && (
          <div className="absolute z-50 mt-2 right-0 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded shadow-lg min-w-[200px]">
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
      </div>
    </div>
  );
}
