// @/components/resources/resources-page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ResourceList } from "@/components/resources/resource-list";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { CreateResourceModal } from "@/components/resources/create-resource-modal";
import { CreateFolderModal } from "@/components/resources/Preview/CreateFolderModal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Grid,
  List,
  RefreshCw,
  Folder,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResourceStore } from "@/store";
import { useUser } from "@/context/user-context";
import { ResourceSkeletonGrid } from "@/components/skeletons/resource-skeleton";
import { FolderView } from "./folder-view";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ResourcesPage() {
  const {
    isLoading,
    isRefreshing,
    resources,
    folders,
    selectedFolder,
    fetchResources,
    fetchFolders,
    createFolder,
    addToFolder,
    removeFromFolder,
    setSelectedFolder,
    setSearchQuery,
  } = useResourceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
  const [showFoldersDropdown, setShowFoldersDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z">("newest");
  const { user } = useUser();
  const router = useRouter();

  // Initial data fetch
  useEffect(() => {
    fetchFolders();
    fetchResources({ showFullLoading: true });
  }, [fetchFolders, fetchResources]);

  // Fetch resources when folder selection or search changes
  useEffect(() => {
    fetchResources({ showFullLoading: true });
  }, [selectedFolder, fetchResources]);

  // Keep search query in sync with store
  useEffect(() => {
    setSearchQuery(filters.search);
  }, [filters.search, setSearchQuery]);

  // Filter and sort resources for display
  const filteredResources = useMemo(() => {
    let currentResources = resources;
    currentResources = currentResources.filter((resource) => {
      if (
        filters.teacherName &&
        !resource.uploadedBy.name
          .toLowerCase()
          .includes(filters.teacherName.toLowerCase())
      )
        return false;
      if (
        filters.department &&
        resource.department.toLowerCase() !== filters.department.toLowerCase()
      )
        return false;
      if (
        filters.courseId &&
        resource.courseId.toLowerCase() !== filters.courseId.toLowerCase()
      )
        return false;
      if (
        filters.fileType &&
        resource.fileType.toLowerCase() !== filters.fileType.toLowerCase()
      )
        return false;
      if (
        filters.dateRange.from &&
        new Date(resource.uploadDate) < filters.dateRange.from
      )
        return false;
      if (
        filters.dateRange.to &&
        new Date(resource.uploadDate) > filters.dateRange.to
      )
        return false;
      if (filters.year && !resource.tags.includes(filters.year)) return false;
      if (selectedFolder && !resource.folderIds?.includes(selectedFolder.id))
        return false;
      return true;
    });
    return currentResources.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        );
      return a.title.localeCompare(b.title);
    });
  }, [resources, filters, selectedFolder, sortBy]);

  const resourcesToDisplay = filteredResources;

  const handleRefresh = () => fetchResources({ showFullLoading: false });
  const handleCreateFolder = async (name: string, description?: string) => {
    await createFolder(name, description, user);
    setIsFolderModalOpen(false);
  };
  const handleAddToFolder = addToFolder;
  const handleRemoveFromFolder = async (resourceId: string) => {
    if (selectedFolder) {
      await removeFromFolder(resourceId, selectedFolder.id);
    }
  };
  const handleFolderClick = (folder: (typeof folders)[number]) =>
    setSelectedFolder(folder);
  const handleBackToResources = () => {
    setSelectedFolder(null);
    router.push("/resources");
  };

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
          <DropdownMenu
            open={showFoldersDropdown}
            onOpenChange={setShowFoldersDropdown}
          >
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
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "grid" | "list")}
          >
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Sort Dropdown */}
          <select
            className="ml-2 border rounded px-2 py-1 text-sm dark:bg-black dark:text-muted-foreground dark:border-gray-700 dark:hover:border-gray-500"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "newest" | "oldest" | "a-z")
            }
            style={{ minWidth: 100 }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="a-z">A-Z</option>
          </select>
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
            <span className="font-medium text-foreground">
              {selectedFolder.name}
            </span>
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
          resources={resourcesToDisplay}
          viewMode={viewMode}
          onRefresh={handleRefresh}
          onAddToFolder={handleAddToFolder}
          // onRemoveFromFolder={handleRemoveFromFolder}
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
      {!isLoading &&
        !selectedFolder &&
        filteredResources.length === 0 &&
        filters.search && (
          <div className="p-4 text-center text-muted-foreground">
            No resources found matching your search criteria.
          </div>
        )}

      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
