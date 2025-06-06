// @/components/resources/resource-list.tsx
"use client";

import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceRow } from "@/components/resources/resource-row";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { motion } from "framer-motion";

interface ResourceListProps {
  resources: Resource[];
  viewMode: "grid" | "list";
  folders: ResourceFolder[];
  onAddToFolder: (resourceId: string, folderId: string) => Promise<void>;
}

export function ResourceList({ resources, viewMode, folders, onAddToFolder }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No resources found</h3>
        <p className="text-muted-foreground">
          There are no resources matching your filters or no resources have been uploaded yet.
        </p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={
        viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col space-y-3"
      }
    >
      {resources.map((resource) =>
        viewMode === "grid" ? (
          <ResourceCard
            key={resource.id}
            resource={resource}
            folders={folders}
            onAddToFolder={onAddToFolder}
          />
        ) : (
          <ResourceRow key={resource.id} resource={resource} />
        )
      )}
    </motion.div>
  );
}