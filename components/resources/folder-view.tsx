import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceList } from "./resource-list";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { useResourceStore } from '@/store';
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
  onRefresh: () => void;
  onAddToFolder: (resourceId: string, folderId: string) => Promise<void>;
}

export function FolderView({
  folder,
  resources,
  viewMode,
  onRefresh,
  onAddToFolder,
}: Omit<FolderViewProps, 'onBack' | 'onRemoveFromFolder'>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { folders, removeFromFolder } = useResourceStore();
  const { toast } = useToast();

  const handleDeleteFolder = async () => {
    try {
      // ...existing code...
    } catch {
      // ...existing code...
    }
  };

  // Use the store's removeFromFolder for consistency
  const handleRemoveFromFolder = async (resourceId: string) => {
    try {
      await removeFromFolder(resourceId, folder.id);
      toast({
        title: 'Success',
        description: 'Resource removed from folder',
      });
      onRefresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove resource from folder',
        variant: 'destructive',
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
        folders={folders}
        onAddToFolder={onAddToFolder}
        onRemoveFromFolder={handleRemoveFromFolder}
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