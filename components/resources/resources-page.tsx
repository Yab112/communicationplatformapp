// @/components/resources/resources-page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ResourceList } from "@/components/resources/resource-list";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { CreateResourceModal } from "@/components/resources/create-resource-modal";
import { CreateFolderModal } from "@/components/resources/Preview/CreateFolderModal";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getResources,
  getResourceFolders,
  createResourceFolder,
  deleteResourceFolder,
  addResourceToFolder,
} from "@/lib/actions/resources";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/user-context";
import { ResourceSkeletonGrid } from "@/components/skeletons/resource-skeleton";
import { motion, AnimatePresence } from "framer-motion";

export function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const { user } = useUser();

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    year: "",
    fileType: "",
    department: "",
    courseId: "",
    teacherName: "",
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
  });

  // Sort state
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z">("newest");

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const { folders, error } = await getResourceFolders();
      if (error) throw new Error(error);
      setFolders(
        folders.map((f) => ({
          ...f,
          authorId: f.authorId,
          description: f.description ?? undefined,
          createdAt:
            typeof f.createdAt === "string"
              ? f.createdAt
              : f.createdAt.toISOString(),
          updatedAt:
            typeof f.updatedAt === "string"
              ? f.updatedAt
              : f.updatedAt.toISOString(),
        }))
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Fetch resources with folder filter
  const fetchResources = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const { resources: fetchedResources, error } = await getResources({
        ...(selectedFolder ? { folderId: selectedFolder } : {}),
      });
      if (error) throw new Error(error);

      const transformedResources = fetchedResources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url || "",
        fileSize: resource.fileSize?.toString() || "",
        department: resource.department || "",
        courseId: resource.courseId || "",
        fileType: resource.fileType || "",
        uploadDate: resource.uploadDate,
        tags: resource.tags || [],
        uploadedBy: {
          id: resource.uploadedBy.id,
          name: resource.uploadedBy.name,
          avatar: resource.uploadedBy.avatar || "",
        },
        dueDate: null,
        folderIds: resource.folderIds || [],
      }));

      setResources(transformedResources);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResources(true);
  }, [selectedFolder]);

  // Apply all filters locally
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        if (
          filters.search &&
          !resource.title
            .toLowerCase()
            .includes(filters.search.toLowerCase()) &&
          !resource.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
        ) {
          return false;
        }
        if (
          filters.teacherName &&
          !resource.uploadedBy.name
            .toLowerCase()
            .includes(filters.teacherName.toLowerCase())
        ) {
          return false;
        }
        if (
          filters.department &&
          resource.department.toLowerCase() !== filters.department.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.courseId &&
          resource.courseId.toLowerCase() !== filters.courseId.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.fileType &&
          resource.fileType.toLowerCase() !== filters.fileType.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.dateRange.from &&
          new Date(resource.uploadDate) < filters.dateRange.from
        ) {
          return false;
        }
        if (
          filters.dateRange.to &&
          new Date(resource.uploadDate) > filters.dateRange.to
        ) {
          return false;
        }
        if (filters.year && !resource.tags.includes(filters.year)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
        } else if (sortBy === "oldest") {
          return (
            new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          );
        }
        return a.title.localeCompare(b.title);
      });
  }, [resources, filters, sortBy]);

  const handleCreateResource = async (newResource: Resource) => {
    setIsCreateModalOpen(false);
    setResources((currentResources) => [newResource, ...currentResources]);
    toast({
      title: "Success",
      description: "Resource has been created successfully.",
    });
  };

  const handleRefresh = () => {
    fetchResources(false);
  };

  // Optimistic folder creation
  const handleCreateFolder = async (name: string, description: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const tempId = `temp-${Date.now()}`; // Temporary ID for optimistic update
    const optimisticFolder: ResourceFolder = {
      id: tempId,
      name,
      description,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update the folders state
    setFolders((prev) => [...prev, optimisticFolder]);
    setIsFolderModalOpen(false);

    try {
      const { folder, error } = await createResourceFolder(name, description);
      if (error || !folder) {
        throw new Error(
          error || "Failed to create folder: No folder data returned"
        );
      }

      // Replace the optimistic folder with the real one from the server
      setFolders((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? {
                ...f,
                id: folder.id,
                authorId: folder.authorId,
                description: folder.description ?? undefined,
                createdAt:
                  typeof folder.createdAt === "string"
                    ? folder.createdAt
                    : folder.createdAt.toISOString(),
                updatedAt:
                  typeof folder.updatedAt === "string"
                    ? folder.updatedAt
                    : folder.updatedAt.toISOString(),
              }
            : f
        )
      );
      toast({
        title: "Success",
        description: "Folder created successfully.",
      });
    } catch (err) {
      // Rollback on error
      setFolders((prev) => prev.filter((f) => f.id !== tempId));
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  // Handle adding a resource to a folder
  const handleAddToFolder = async (resourceId: string, folderId: string) => {
    try {
      // Optimistically update the resource's folderIds
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? {
                ...r,
                folderIds: Array.from(
                  new Set([...(r.folderIds || []), folderId])
                ),
              }
            : r
        )
      );
      // If the selected folder is set and the resource is not in that folder after the update, remove it from the list
      if (
        selectedFolder &&
        ![
          ...(resources.find((r) => r.id === resourceId)?.folderIds || []),
          folderId,
        ].includes(selectedFolder)
      ) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      }
      await addResourceToFolder(resourceId, folderId);
      toast({
        title: "Success",
        description: `Resource added to ${
          folders.find((f) => f.id === folderId)?.name || "folder"
        }`,
      });
    } catch (err) {
      // Rollback optimistic update
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? {
                ...r,
                folderIds: (r.folderIds || []).filter((id) => id !== folderId),
              }
            : r
        )
      );
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to add resource to folder",
        variant: "destructive",
      });
    }
  };

  const isTeacher =
    user?.role?.toLowerCase() === "teacher" ||
    user?.role?.toLowerCase() === "admin";

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto feeds-scroll-hidden p-4 md:p-6">
          <div className="mx-auto max-w-6xl w-full">
            {/* Folder Dropdown */}
            <div className="mb-4 flex items-center gap-4">
              <select
                className="rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 transition-colors focus:ring-2 focus:ring-blue-500"
                value={selectedFolder || ""}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
              >
                <option
                  value=""
                  className="bg-background dark:bg-zinc-800 dark:text-zinc-100"
                >
                  All Resources
                </option>
                {folders.map((folder) => (
                  <option
                    key={folder.id}
                    value={folder.id}
                    className="bg-background dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {folder.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={() => setIsFolderModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                + New Folder
              </Button>

              {selectedFolder && isTeacher && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await deleteResourceFolder(selectedFolder);
                      setSelectedFolder(null);
                      await fetchFolders();
                      await fetchResources(true);
                      toast({
                        title: "Success",
                        description: "Folder deleted successfully.",
                      });
                    } catch (err) {
                      toast({
                        title: "Error",
                        description:
                          err instanceof Error
                            ? err.message
                            : "Failed to delete folder",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Delete Folder
                </Button>
              )}
            </div>

            {/* Folder Creation Modal */}
            <CreateFolderModal
              isOpen={isFolderModalOpen}
              onClose={() => setIsFolderModalOpen(false)}
              onSubmit={handleCreateFolder}
            />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Resources
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                {isTeacher && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <Tabs
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as "grid" | "list")
                  }
                >
                  <TabsList className="grid w-[160px] grid-cols-2 bg-transparent rounded-md p-1 border border-blue-100/50 dark:border-blue-900/50 mb-1">
                    <TabsTrigger
                      value="grid"
                      className="hover:bg-blue-100/50 dark:hover:bg-blue-900/50 data-[state=active]:bg-blue-500/40 dark:data-[state=active]:bg-blue-700/40"
                    >
                      <Grid className="h-4 w-4 mr-1" />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="hover:bg-blue-100/50 dark:hover:bg-blue-900/50 data-[state=active]:bg-blue-500/40 dark:data-[state=active]:bg-blue-700/40"
                    >
                      <List className="h-4 w-4 mr-1" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <select
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "oldest" | "a-z")
                  }
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A-Z</option>
                </select>
              </div>
            </div>

            <ResourceFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={() => {
                setFilters({
                  search: "",
                  subject: "",
                  year: "",
                  fileType: "",
                  department: "",
                  courseId: "",
                  teacherName: "",
                  dateRange: {
                    from: undefined,
                    to: undefined,
                  },
                });
              }}
            />

            <div className="mt-6">
              {isLoading ? (
                <ResourceSkeletonGrid />
              ) : filteredResources.length === 0 && selectedFolder ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        transition: { repeat: Infinity, duration: 2 },
                      }}
                    >
                      <svg
                        className="w-24 h-24 text-zinc-400 dark:text-zinc-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </motion.div>
                    <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      This Folder is Empty
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      No resources have been added to this folder yet.
                    </p>
                    <Button
                      onClick={() => setSelectedFolder(null)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      View All Resources
                    </Button>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <ResourceList
                  resources={filteredResources}
                  viewMode={viewMode}
                  folders={folders} // Pass folders to ResourceList
                  onAddToFolder={handleAddToFolder} // Pass callback for adding to folder
                />
              )}

              {isRefreshing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-0 xl:w-24 2xl:w-48 flex-shrink-0" />
      </div>

      {isTeacher && (
        <CreateResourceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateResource}
        />
      )}
    </div>
  );
}
