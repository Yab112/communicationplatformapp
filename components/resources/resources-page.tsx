// @/components/resources/resources-page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ResourceList } from "@/components/resources/resource-list";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { CreateResourceModal } from "@/components/resources/create-resource-modal";
import { CreateFolderModal } from "@/components/resources/Preview/CreateFolderModal";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, RefreshCw, Folder, Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/types/resource";
import type { ResourceFolder } from "@/types/resource-folder";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getResources,
  getResourceFolders,
  createResourceFolder,
  deleteResourceFolder,
  addResourceToFolder,
  removeResourceFromFolder,
} from "@/lib/actions/resources";
import { useUser } from "@/context/user-context";
import { ResourceSkeletonGrid } from "@/components/skeletons/resource-skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { FolderView } from "./folder-view";
import { cn } from "@/lib/utils";

export function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<ResourceFolder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useUser();
  const [showFoldersDropdown, setShowFoldersDropdown] = useState(false);

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

  // Optimistic state for folder operations
  const [optimisticFolderOperations, setOptimisticFolderOperations] = useState<{
    [key: string]: { folderId: string; operation: 'add' | 'remove' }
  }>({});

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

  // Fetch resources with folder and search filters
  const fetchResources = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // If we're in a folder view, we can use the optimistic state to show resources immediately
      if (selectedFolder) {
        const folderResources = resources.filter(resource => 
          resource.folderIds?.includes(selectedFolder.id)
        );
        setResources(folderResources);
        setIsLoading(false);
        setIsRefreshing(false);
      }

      const { resources: fetchedResources, error } = await getResources({
        ...(selectedFolder ? { folderId: selectedFolder.id } : {}),
        ...(!selectedFolder && searchQuery ? { search: searchQuery } : {}),
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

  // Initial data fetch
  useEffect(() => {
    Promise.all([fetchFolders(), fetchResources(true)]);
  }, []);

  // Fetch resources when folder selection or search changes
  useEffect(() => {
    fetchResources(true);
  }, [selectedFolder, searchQuery]);

  // Apply local filters (excluding search which is now backend filtered)
  const filteredResources = useMemo(() => {
    let currentResources = resources;

    // Apply local filters only when not in a folder view, or apply filters WITHIN the folder view
    // Based on requirement, filters apply to the currently viewed set of resources.
    currentResources = currentResources.filter((resource) => {
      // Search filter is now handled in fetchResources when not in a folder view
      // When in a folder view, search should likely be handled here, but for now
      // the requirement is search on ALL resources OR resources in a folder, not both simultaneously.
      // We keep local filters for other criteria like subject, year, etc.
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
      // Only include resources that are in the selected folder if a folder is selected
      if (selectedFolder && !resource.folderIds?.includes(selectedFolder.id)) {
        return false;
      }
      return true;
    });

    // Apply sort
    return currentResources.sort((a, b) => {
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
  }, [resources, filters, sortBy, selectedFolder]);

  const handleCreateResource = async (newResource: Resource) => {
    setIsCreateModalOpen(false);
    // Re-fetch resources to include the new resource, especially if in a folder view
    fetchResources(false);
    toast({
      title: "Success",
      description: "Resource has been created successfully.",
    });
  };

  const handleRefresh = () => {
    fetchResources(false);
  };

  const handleCreateFolder = async (name: string, description?: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticFolder: ResourceFolder = {
      id: tempId,
      name,
      description,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resourceCount: 0,
    };

    setFolders((prev) => [...prev, optimisticFolder]);
    setIsFolderModalOpen(false);

    try {
      const { folder, error } = await createResourceFolder(name, description);
      if (error) throw new Error(error);
      if (!folder) throw new Error("No folder data returned");

      setFolders((prev) =>
        prev.map((f) => (f.id === tempId ? {
          ...folder,
          createdAt: typeof folder.createdAt === 'string' ? folder.createdAt : folder.createdAt.toISOString(),
          updatedAt: typeof folder.updatedAt === 'string' ? folder.updatedAt : folder.updatedAt.toISOString(),
          description: folder.description ?? undefined,
        } : f))
      );

      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    } catch (error) {
      setFolders((prev) => prev.filter((f) => f.id !== tempId));
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  // Handle adding resource to folder with optimistic update
  const handleAddToFolder = async (resourceId: string, folderId: string) => {
    try {
      // Optimistically update the UI
      setOptimisticFolderOperations(prev => ({
        ...prev,
        [resourceId]: { folderId, operation: 'add' }
      }));

      // Update the resources state optimistically
      setResources(prevResources =>
        prevResources.map(resource =>
          resource.id === resourceId
            ? {
                ...resource,
                folderIds: Array.from(new Set([...(resource.folderIds || []), folderId]))
              }
            : resource
        )
      );

      // Update folder counts optimistically
      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === folderId
            ? { ...folder, resourceCount: (folder.resourceCount || 0) + 1 }
            : folder
        )
      );

      // Make the API call
      const { error } = await addResourceToFolder(resourceId, folderId);
      if (error) throw new Error(error);

      // If we're in the folder view, update the displayed resources
      if (selectedFolder?.id === folderId) {
        setResources(prevResources => {
          const resourceToAdd = prevResources.find(r => r.id === resourceId);
          if (resourceToAdd) {
            return [...prevResources, resourceToAdd];
          }
          return prevResources;
        });
      }

      toast({
        title: "Success",
        description: "Resource added to folder successfully",
      });
    } catch (err) {
      // Revert optimistic updates on error
      setOptimisticFolderOperations(prev => {
        const newState = { ...prev };
        delete newState[resourceId];
        return newState;
      });

      setResources(prevResources =>
        prevResources.map(resource =>
          resource.id === resourceId
            ? {
                ...resource,
                folderIds: resource.folderIds?.filter(id => id !== folderId) || []
              }
            : resource
        )
      );

      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === folderId
            ? { ...folder, resourceCount: Math.max(0, (folder.resourceCount || 0) - 1) }
            : folder
        )
      );

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add resource to folder",
        variant: "destructive",
      });
    }
  };

  // Handle removing resource from folder with optimistic update
  const handleRemoveFromFolder = async (resourceId: string) => {
    if (!selectedFolder) return;

    try {
      // Optimistically update the UI
      setOptimisticFolderOperations(prev => ({
        ...prev,
        [resourceId]: { folderId: selectedFolder.id, operation: 'remove' }
      }));

      // Update the resources state optimistically
      setResources(prevResources =>
        prevResources.map(resource =>
          resource.id === resourceId
            ? {
                ...resource,
                folderIds: resource.folderIds?.filter(id => id !== selectedFolder.id) || []
              }
            : resource
        )
      );

      // Make the API call
      const { error } = await removeResourceFromFolder(resourceId, selectedFolder.id);
      if (error) throw new Error(error);

      // Update folder counts optimistically
      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === selectedFolder.id
            ? { ...folder, resourceCount: Math.max(0, (folder.resourceCount || 0) - 1) }
            : folder
        )
      );

      toast({
        title: "Success",
        description: "Resource removed from folder successfully",
      });
    } catch (err) {
      // Revert optimistic updates on error
      setOptimisticFolderOperations(prev => {
        const newState = { ...prev };
        delete newState[resourceId];
        return newState;
      });

      setResources(prevResources =>
        prevResources.map(resource =>
          resource.id === resourceId
            ? {
                ...resource,
                folderIds: [...(resource.folderIds || []), selectedFolder.id]
              }
            : resource
        )
      );

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to remove resource from folder",
        variant: "destructive",
      });
    }
  };

  const isTeacher =
    user?.role?.toLowerCase() === "teacher" ||
    user?.role?.toLowerCase() === "admin";

  const handleFolderClick = (folder: ResourceFolder) => {
    // Optimistically update the UI
    setSelectedFolder(folder);
    
    // Immediately filter resources for the selected folder
    const folderResources = resources.filter(resource => 
      resource.folderIds?.includes(folder.id)
    );
    setResources(folderResources);
    
    // Then fetch the complete data
    fetchResources(true);
  };

  const handleBackToResources = () => {
    setSelectedFolder(null);
  };

  // Filter resources based on the selected folder locally for display in ResourceList
  // This is important because fetchResources might bring in resources not just for the selected folder
  // if selectedFolder is null (main view). When selectedFolder is not null, fetchResources
  // already filters by folderId.
  const resourcesToDisplay = useMemo(() => {
    if (!selectedFolder) {
      return filteredResources; // Use locally filtered resources in main view
    } else {
      // When in a folder view, the resources state should already be filtered by fetchResources
      // but we still apply local filters (except search) and sorting.
      return filteredResources;
    }
  }, [filteredResources, selectedFolder]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Resources</h2>
          <p className="text-sm text-muted-foreground">
            Manage and organize your learning resources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu open={showFoldersDropdown} onOpenChange={setShowFoldersDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Folder className="h-4 w-4 mr-2" />
                Folders
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] p-0">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-2">
                  {folders.length > 0 ? (
                    folders.map((folder) => (
                      <div
                        key={folder.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent",
                          selectedFolder?.id === folder.id && "bg-accent"
                        )}
                        onClick={() => {
                          handleFolderClick(folder);
                          setShowFoldersDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{folder.name}</p>
                            {folder.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {folder.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {folder.resourceCount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No folders found.
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsFolderModalOpen(true);
                    setShowFoldersDropdown(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Folder
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Resource
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Breadcrumbs */}
      {selectedFolder && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={handleBackToResources}
          >
            Resources
          </Button>
          <ChevronRight className="h-4 w-4" />
          <div className="flex items-center space-x-2">
            <Folder className="h-4 w-4" />
            <span className="font-medium text-foreground">{selectedFolder.name}</span>
          </div>
        </div>
      )}

      {/* Resource Filters - Show only in main view */}
      {!selectedFolder && (
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
      )}

      {/* Resource List or Folder View */}
      {isLoading ? (
        <ResourceSkeletonGrid />
      ) : selectedFolder ? (
        <FolderView
          folder={selectedFolder}
          resources={resourcesToDisplay} // resources state is already filtered by fetchResources when selectedFolder is set
          viewMode={viewMode}
          onBack={handleBackToResources}
          onRefresh={handleRefresh}
          onAddToFolder={handleAddToFolder}
          onRemoveFromFolder={handleRemoveFromFolder}
        />
      ) : (
        <ResourceList
          resources={resourcesToDisplay} // resources state is all resources, filtered locally
          viewMode={viewMode}
          folders={folders}
          onAddToFolder={handleAddToFolder}
          onRemoveFromFolder={handleRemoveFromFolder} // Pass remove handler for main view if needed (e.g., remove from ANY folder)
          showRemoveOption={false} // Hide remove from folder option in main view list
        />
      )}

      {/* Empty state for main resource list */}
      {!isLoading && !selectedFolder && filteredResources.length === 0 && searchQuery && (
         <div className="p-4 text-center text-muted-foreground">
           No resources found matching your search criteria.
         </div>
       )}

      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateResource}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
