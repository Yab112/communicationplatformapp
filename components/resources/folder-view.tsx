import { useState } from "react";
import { ChevronRight, Folder, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceList } from "./resource-list";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { deleteResourceFolder, removeResourceFromFolder } from "@/lib/actions/resources";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FolderViewProps {
  folder: ResourceFolder;
  resources: Resource[];
  viewMode: "grid" | "list";
  onBack: () => void;
  onRefresh: () => void;
  onAddToFolder: (resourceId: string, folderId: string) => Promise<void>;
  onRemoveFromFolder: (resourceId: string) => Promise<void>;
}

export function FolderView({
  folder,
  resources,
  viewMode,
  onBack,
  onRefresh,
  onAddToFolder,
  onRemoveFromFolder,
}: FolderViewProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteFolder = async () => {
    try {
      const { error } = await deleteResourceFolder(folder.id);
      if (error) throw new Error(error);
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromFolder = async (resourceId: string) => {
    try {
      const { error } = await removeResourceFromFolder(resourceId, folder.id);
      if (error) throw new Error(error);
      toast({
        title: "Success",
        description: "Resource removed from folder",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove resource from folder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Folder Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{folder.name}</h2>
          {folder.description && (
            <p className="text-sm text-muted-foreground">{folder.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {folder.resourceCount} {folder.resourceCount === 1 ? "resource" : "resources"}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Folder
        </Button>
      </div>

      {/* Resource List */}
      <ResourceList
        resources={resources}
        viewMode={viewMode}
        folders={[]}
        onAddToFolder={onAddToFolder}
        onRemoveFromFolder={onRemoveFromFolder}
        showRemoveOption={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? This action cannot be undone.
              All resources will remain in your library but will be removed from this folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 