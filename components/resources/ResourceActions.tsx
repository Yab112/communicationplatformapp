import { useState } from "react";
import { MoreVertical, Download, Eye, FolderPlus, FolderMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import type { FileTypeStyle } from "@/types/resource";
import type { User } from "@/types/user";

interface ResourceActionsProps {
  resource: Resource;
  styling: FileTypeStyle;
  onPreview: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  user: User | null;
  folders: ResourceFolder[];
  showFolderMenu: boolean;
  setShowFolderMenu: (show: boolean) => void;
  optimisticFolderId: string | null;
  loadingFolder: boolean;
  handleAddToFolder: (resourceId: string, folderId: string) => Promise<void>;
  onRemoveFromFolder?: (resourceId: string) => void;
  showRemoveOption?: boolean;
}

export function ResourceActions({
  resource,
  onPreview,
  onDownload,
  isDownloading,
  folders,
  loadingFolder,
  handleAddToFolder,
  onRemoveFromFolder,
  showRemoveOption = false,
}: ResourceActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePreviewClick = () => {
    setIsOpen(false);
    onPreview();     
  };

  const handleFolderSelect = async (folderId: string) => {
    try {
      // Find the folder to validate it exists
      const selectedFolder = folders.find(f => f.id === folderId);
      if (!selectedFolder) {
        throw new Error("Selected folder not found");
      }

      console.log("ResourceActions: Adding resource to folder:", { 
        resourceId: resource.id, 
        folderId,
        resourceTitle: resource.title,
        folderName: selectedFolder.name,
        currentFolderIds: resource.id
      });

      // Check if resource is already in this folder
      if (resource.folderIds?.includes(folderId)) {
        throw new Error(`Resource "${resource.title}" is already in folder "${selectedFolder.name}"`);
      }

      await handleAddToFolder(resource.id, folderId);
      setIsOpen(false);
    } catch (error) {
      console.error("ResourceActions: Failed to add resource to folder:", error);
      // Re-throw the error to be handled by the parent component
      throw error;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-transparent"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePreviewClick}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download"}
        </DropdownMenuItem>
        {showRemoveOption && onRemoveFromFolder && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRemoveFromFolder(resource.id)}
              className="text-destructive focus:text-destructive"
            >
              <FolderMinus className="mr-2 h-4 w-4" />
              Remove from Folder
            </DropdownMenuItem>
          </>
        )}
        {!showRemoveOption && folders.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={loadingFolder}>
                <FolderPlus className="mr-2 h-4 w-4" />
                {loadingFolder ? "Adding..." : "Add to Folder"}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => handleFolderSelect(folder.id)}
                    disabled={loadingFolder || resource.folderIds?.includes(folder.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{folder.name}</span>
                      {resource.folderIds?.includes(folder.id) && (
                        <span className="text-xs text-muted-foreground">Added</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
