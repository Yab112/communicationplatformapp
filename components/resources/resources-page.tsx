"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ResourceList } from "@/components/resources/resource-list";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { CreateResourceModal } from "@/components/resources/create-resource-modal";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/types/resource";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getResources } from "@/lib/actions/resources";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useSocket } from "@/hooks/use-socket";
import { useResourceStore } from "@/store";

export function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const { user } = useUser();
  const socket = useSocket();

  // Use the resource store
  const { resources, setResources, addResource } = useResourceStore();

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

  const fetchResources = useCallback(async () => {
    try {
      // If we already have resources, don't show loading state
      if (resources.length > 0) {
        setIsLoading(false);
        return;
      }

      const { resources: fetchedResources, error } = await getResources({
        teacherName: filters.teacherName,
        department: filters.department,
        courseId: filters.courseId,
        fileType: filters.fileType,
        search: filters.search,
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // Transform fetched resources to match Resource type
      const transformedResources = fetchedResources.map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url || "",
        fileSize: resource.fileSize?.toString() || "",
        subject: resource.subject || "",
        department: resource.department || "",
        courseId: resource.courseId || "",
        fileType: resource.fileType || "",
        uploadDate: resource.createdAt.toISOString(),
        tags: resource.tags || [],
        uploadedBy: {
          id: resource.author.id,
          name: resource.author.name,
          avatar: resource.author.image || "",
        },
        dueDate: null,
      }));

      setResources(transformedResources);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast, resources.length, setResources]);

  // Initial fetch on mount
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on("new_resource", (newResource: Resource) => {
      setResources([newResource, ...resources]);
    });

    socket.on("resource_updated", (updatedResource: Resource) => {
      setResources(
        resources.map(resource =>
          resource.id === updatedResource.id ? updatedResource : resource
        )
      );
    });

    socket.on("resource_deleted", (resourceId: string) => {
      setResources(resources.filter(resource => resource.id !== resourceId));
    });

    return () => {
      socket.off("new_resource");
      socket.off("resource_updated");
      socket.off("resource_deleted");
    };
  }, [socket, resources, setResources]);

  // Apply date range filter and sorting
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        if (filters.dateRange.from && new Date(resource.uploadDate) < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && new Date(resource.uploadDate) > filters.dateRange.to) {
          return false;
        }
        if (filters.year && !resource.tags.includes(filters.year)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        }
        return a.title.localeCompare(b.title);
      });
  }, [resources, filters.dateRange, filters.year, sortBy]);

  const handleCreateResource = async (newResource: Resource) => {
    setIsCreateModalOpen(false);
    // Optimistically add the new resource
    addResource(newResource);
    
    toast({
      title: "Success",
      description: "Resource has been created successfully.",
    });
  };

  // Get user role from context
  const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";
  

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">Resources</h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                  <TabsList className="grid w-[160px] grid-cols-2 bg-transparent rounded-md p-1 border border-blue-100/50 mb-1">
                    <TabsTrigger
                      value="grid"  
                      className="hover:bg-blue-100/50 data-[state=active]:bg-blue-500/40"
                    >
                      <Grid className="h-4 w-4 mr-1" />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="hover:bg-blue-100/50 data-[state=active]:bg-blue-500/40"
                    >
                      <List className="h-4 w-4 mr-1" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <select
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm"
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
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <ResourceList resources={filteredResources} viewMode={viewMode} />
              )}
            </div>
          </div>
        </div>

        {/* Right spacer for balance */}
        <div className="hidden lg:block w-0 xl:w-24 2xl:w-48 flex-shrink-0" />
      </div>

      {isTeacher && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateResource}
      />
    </div>
  );
}
