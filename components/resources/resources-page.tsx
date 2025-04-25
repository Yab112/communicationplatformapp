"use client";

import { useState } from "react";
import { ResourceList } from "@/components/resources/resource-list";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { CreateResourceModal } from "@/components/resources/create-resource-modal";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { mockResources } from "@/data/mock/resources";
import type { Resource } from "@/types/resource";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>(mockResources);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    // const { toast } = useToast();

    // Filter states
    const [filters, setFilters] = useState({
        search: "",
        subject: "",
        year: "",
        fileType: "",
        dateRange: {
            from: undefined as Date | undefined,
            to: undefined as Date | undefined,
        },
    });

    // Sort state
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z">("newest");

    // Apply filters and sorting
    const filteredResources = resources
        .filter((resource) => {
            // Search filter
            if (
                filters.search &&
                !resource.title.toLowerCase().includes(filters.search.toLowerCase()) &&
                !resource.description
                    .toLowerCase()
                    .includes(filters.search.toLowerCase())
            ) {
                return false;
            }

            // Subject filter
            if (filters.subject && resource.subject !== filters.subject) {
                return false;
            }

            // Year filter
            if (filters.year && !resource.tags.includes(filters.year)) {
                return false;
            }

            // File type filter
            if (filters.fileType && resource.fileType !== filters.fileType) {
                return false;
            }

            // Date range filter
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

            return true;
        })
        .sort((a, b) => {
            // Sort by date or alphabetically
            if (sortBy === "newest") {
                return (
                    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
                );
            } else if (sortBy === "oldest") {
                return (
                    new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
                );
            } else {
                // a-z
                return a.title.localeCompare(b.title);
            }
        });

    const handleCreateResource = (newResource: Resource) => {
        setResources([newResource, ...resources]);
        setIsCreateModalOpen(false);
        // toast({
        //   title: "Resource created",
        //   description: "Your resource has been published successfully.",
        // });
    };

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            subject: "",
            year: "",
            fileType: "",
            dateRange: {
                from: undefined,
                to: undefined,
            },
        });
    };

    // Mock user role - in a real app, this would come from auth
    const isTeacher = true;

    return (
        <div className="flex flex-col h-screen">

            <div className="flex flex-1 overflow-hidden">
                {/* Left spacer for balance on larger screens */}
                <div className="hidden lg:block w-0 xl:w-24 2xl:w-48 flex-shrink-0" />

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mx-auto max-w-6xl w-full">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-2xl font-bold">Resources</h1>

                            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <Tabs
                                    value={viewMode}
                                    onValueChange={(value) =>
                                        setViewMode(value as "grid" | "list")
                                    }
                                >
                                    <TabsList className="grid w-[120px] grid-cols-2">
                                        <TabsTrigger value="grid">
                                            <Grid className="h-4 w-4 mr-1" />
                                            Grid
                                        </TabsTrigger>
                                        <TabsTrigger value="list">
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
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                        />

                        <div className="mt-6">
                            <ResourceList resources={filteredResources} viewMode={viewMode} />
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
