// @/components/resources/resource-list.tsx
"use client";

import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceRow } from "@/components/resources/resource-row";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { motion } from "framer-motion";
import { useResourceStore } from "@/store/resource-store";

interface ResourceListProps {
  resources: Resource[];
  viewMode: "grid" | "list";
  folders: ResourceFolder[];
  onAddToFolder: (resourceId: string, folderId: string) => Promise<void>;
  onRemoveFromFolder?: (resourceId: string) => Promise<void>;
  showRemoveOption?: boolean;
}

export function ResourceList({
  resources,
  viewMode,
  folders: propFolders,
  onAddToFolder,
  onRemoveFromFolder,
  showRemoveOption = false,
}: ResourceListProps) {
  const store = useResourceStore();
  const folders = propFolders ?? store.folders;
  
  // Use the onAddToFolder prop if provided, otherwise use the store's addToFolder
  const addToFolder = async (resourceId: string, folderId: string) => {
    console.log('Adding to folder:', { resourceId, folderId });
    if (resourceId === folderId) {
      throw new Error('Resource ID and Folder ID cannot be the same');
    }
    return onAddToFolder 
      ? onAddToFolder(resourceId, folderId)
      : store.addToFolder(resourceId, folderId);
  };

  const removeFromFolder =
    onRemoveFromFolder ??
    ((id: string) =>
      store.selectedFolder
        ? store.removeFromFolder(id, store.selectedFolder.id)
        : Promise.resolve());

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No resources found</h3>
        <p className="text-muted-foreground">
          There are no resources matching your filters or no resources have been
          uploaded yet.
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ResourceCard
              resource={resource}
              folders={folders}
              onAddToFolder={addToFolder}
              onRemoveFromFolder={removeFromFolder}
              showRemoveOption={showRemoveOption}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <motion.div
          key={resource.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          <ResourceRow
            resource={resource}
            folders={folders}
            onAddToFolder={addToFolder}
            onRemoveFromFolder={removeFromFolder}
            showRemoveOption={showRemoveOption}
          />
        </motion.div>
      ))}
    </div>
  );
}
