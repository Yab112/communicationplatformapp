"use client";

import { useState, useEffect, useMemo } from "react";
import { ResourceList } from "@/components/resources/resource-list";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { CreateResourceModal } from "@/components/resources/create-resource-modal";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@/types/resource";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getResources } from "@/lib/actions/resources";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/user-context";
import { ResourceSkeletonGrid } from "@/components/skeletons/resource-skeleton";


export function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const fetchResources = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const { resources: fetchedResources, error } = await getResources({});

      if (error) throw new Error(error);

      // Transform the database response to match Resource type
      const transformedResources = fetchedResources.map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url || "",
        fileSize: resource.fileSize?.toString() || "",
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
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch only
  useEffect(() => {
    fetchResources(true);
  }, []);

  // Apply all filters locally
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        // Apply all filters locally
        if (filters.search && !resource.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !resource.description?.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.teacherName && !resource.uploadedBy.name.toLowerCase().includes(filters.teacherName.toLowerCase())) {
          return false;
        }
        if (filters.department && resource.department.toLowerCase() !== filters.department.toLowerCase()) {
          return false;
        }
        if (filters.courseId && resource.courseId.toLowerCase() !== filters.courseId.toLowerCase()) {
          return false;
        }
        if (filters.fileType && resource.fileType.toLowerCase() !== filters.fileType.toLowerCase()) {
          return false;
        }
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
  }, [resources, filters, sortBy]);

  const handleCreateResource = async (newResource: Resource) => {
    setIsCreateModalOpen(false);
    // Add the new resource to the local state
    setResources(currentResources => [newResource, ...currentResources]);

    toast({
      title: "Success",
      description: "Resource has been created successfully.",
    });
  };

  const handleRefresh = () => {
    fetchResources(false);
  };

  // Get user role from context
  const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto feeds-scroll-hidden p-4 md:p-6">
          <div className="mx-auto max-w-6xl w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Resources</h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                {isTeacher && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

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
                <ResourceSkeletonGrid />
              ) : (
                <ResourceList resources={filteredResources} viewMode={viewMode} />
              )}

              {isRefreshing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right spacer for balance */}
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
