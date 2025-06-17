// store/resources-store.ts
import { create } from "zustand";
import {
  getResources,
  getResourceFolders,
  createResourceFolder,
  addResourceToFolder,
  removeResourceFromFolder,
} from "@/lib/actions/resources";
import { Resource } from "@/types/resource";
import { ResourceFolder } from "@/types/resource-folder";
import { User } from "@/types/user";
import { showToast } from "./toast-util";
import type { ResourceFormValues } from "@/lib/validator/resource";

interface ResourceStore {
  isLoading: boolean;
  isUploading: boolean;
  isRefreshing: boolean;
  resources: Resource[];
  folders: ResourceFolder[];
  selectedFolder: ResourceFolder | null;
  searchQuery: string;
  fetchResources: (opts?: { showFullLoading?: boolean }) => Promise<void>;
  fetchFolders: () => Promise<void>;
  createFolder: (
    name: string,
    description: string | undefined,
    user: User | null
  ) => Promise<void>;
  addToFolder: (resourceId: string, folderId: string) => Promise<void>;
  removeFromFolder: (resourceId: string, folderId: string) => Promise<void>;
  setSelectedFolder: (folder: ResourceFolder | null) => void;
  setSearchQuery: (query: string) => void;
  setIsUploading: (isUploading: boolean) => void;
  setResources: (resources: Resource[]) => void;
  createResourceWithFile: (
    values: ResourceFormValues,
    file: File,
    tags: string[]
  ) => Promise<{ resource?: Resource; error?: string }>;
  handleDownloadResource: (resource: Resource) => Promise<void>;
  enhanceText: (
    text: string,
    type: string,
    context: Record<string, any>
  ) => Promise<{ enhancedText?: string; error?: string }>;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  isLoading: false,
  isUploading: false,
  isRefreshing: false,
  resources: [],
  folders: [],
  selectedFolder: null,
  searchQuery: "",
  setIsUploading: (isUploading) => set({ isUploading }),

  fetchResources: async ({ showFullLoading = false } = {}) => {
    const { selectedFolder, searchQuery } = get();
    if (showFullLoading) set({ isLoading: true });
    else set({ isRefreshing: true });

    try {
      const { resources: fetchedResources, error } = await getResources({
        ...(selectedFolder ? { folderId: selectedFolder.id } : {}),
        ...(!selectedFolder && searchQuery ? { search: searchQuery } : {}),
      });
      if (error) throw new Error(error);

      const transformed = fetchedResources.map((resource) => ({
        ...resource,
        fileSize: resource.fileSize?.toString() || "",
        uploadedBy: {
          ...resource.uploadedBy,
          avatar: resource.uploadedBy.avatar || "",
        },
        folderIds: resource.folderIds || [],
      }));

      set({ resources: transformed });
    } catch (err) {
      showToast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : String(err) || "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  fetchFolders: async () => {
    try {
      const { folders, error } = await getResourceFolders();
      if (error) throw new Error(error);

      set({
        folders: folders.map((f) => ({
          ...f,
          description: f.description ?? undefined,
          createdAt:
            typeof f.createdAt === "string"
              ? f.createdAt
              : f.createdAt.toISOString(),
          updatedAt:
            typeof f.updatedAt === "string"
              ? f.updatedAt
              : f.updatedAt.toISOString(),
        })),
      });
    } catch (err) {
      showToast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : String(err) || "Failed to fetch folders",
        variant: "destructive",
      });
    }
  },

  createFolder: async (name, description, user) => {
    if (!user?.id) {
      showToast({
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

    set((state) => ({ folders: [...state.folders, optimisticFolder] }));

    try {
      const { folder, error } = await createResourceFolder(name, description);
      if (error || !folder) throw new Error(error || "No folder data returned");

      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === tempId
            ? {
                ...folder,
                createdAt:
                  typeof folder.createdAt === "string"
                    ? folder.createdAt
                    : folder.createdAt.toISOString(),
                updatedAt:
                  typeof folder.updatedAt === "string"
                    ? folder.updatedAt
                    : folder.updatedAt.toISOString(),
                description: folder.description ?? undefined,
              }
            : f
        ),
      }));

      showToast({
        title: "Success",
        description: "Folder created successfully",
      });
    } catch (err) {
      set((state) => ({
        folders: state.folders.filter((f) => f.id !== tempId),
      }));
      showToast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  },

  addToFolder: async (resourceId, folderId) => {
    if (resourceId === folderId) {
      showToast({
        title: "Invalid Operation",
        description: "Resource ID and Folder ID cannot be the same in the store .",
        variant: "destructive",
      });
      return;
    }
    const { resources, folders } = get();
    const originalResources = [...resources];
    const originalFolders = [...folders];

    set({
      resources: resources.map((r) =>
        r.id === resourceId
          ? {
              ...r,
              folderIds: Array.from(
                new Set([...(r.folderIds || []), folderId])
              ),
            }
          : r
      ),
      folders: folders.map((f) =>
        f.id === folderId
          ? { ...f, resourceCount: (f.resourceCount || 0) + 1 }
          : f
      ),
    });

    try {
      const result = await addResourceToFolder(resourceId, folderId);
      if (result.error) throw new Error(result.error);
      showToast({ title: "Success", description: "Resource added to folder." });
      await get().fetchResources();
      await get().fetchFolders();
    } catch (err) {
      set({ resources: originalResources, folders: originalFolders });
      showToast({
        title: "Error Adding to Folder",
        description:
          err instanceof Error
            ? err.message
            : String(err) || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  },

  removeFromFolder: async (resourceId, folderId) => {
    try {
      const result = await removeResourceFromFolder(resourceId, folderId);
      if (result.error) throw new Error(result.error);
      showToast({
        title: "Removed",
        description: "Resource removed from folder.",
      });
      await get().fetchResources();
      await get().fetchFolders();
    } catch (err) {
      showToast({
        title: "Error Removing Resource",
        description:
          err instanceof Error
            ? err.message
            : String(err) || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  },

  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setResources: (resources) => set({ resources }),

  createResourceWithFile: async (values, file, tags) => {
    try {
      // 1. Upload file
      set({ isUploading: true });
      console.log("Uploading file:", file);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        return { error: error.error || "Failed to upload file" };
      }
      const { url: fileUrl, size } = await uploadResponse.json();
      // 2. Create resource
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("type", values.type);
      formData.append("department", values.department);
      formData.append("fileType", values.fileType);
      formData.append("courseId", values.courseId || "");
      formData.append("url", fileUrl);
      formData.append("fileSize", size);
      formData.append("tags", JSON.stringify(tags));

      const { resource, error } = await import("@/lib/actions/resources").then(
        (m) => m.createResource(formData)
      );
      if (error) return { error };
      if (resource) {
        // Transform backend resource to frontend Resource type
        const transformed = {
          id: resource.id,
          title: resource.title,
          description: resource.description,
          type: resource.type,
          url: resource.url || "",
          fileSize: resource.fileSize?.toString() || "",
          department: resource.department || "",
          courseId: resource.courseId || "",
          fileType: resource.fileType || "",
          uploadDate: resource.uploadDate
            ? typeof resource.uploadDate === "string"
              ? resource.uploadDate
              : new Date(resource.uploadDate).toISOString()
            : "",
          tags: resource.tags || [],
          uploadedBy: {
            id: resource.author.id,
            name: resource.author.name,
            avatar: resource.author.image || "",
          },
          dueDate: null,
          folderIds: [], // New resources have no folders by default
        };
        await get().fetchResources();
        set({ isUploading: false });
        return { resource: transformed };
      }
      return { error: "Unknown error creating resource." };
    } catch (error) {
      set({ isUploading: false });
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create resource. Please try again.",
      };
    }
  },
  
  handleDownloadResource: async (resource) => {
  // 1. Validate the resource URL
  if (!resource.url) {
    showToast({
      title: "Error",
      description: "No file URL available for download",
      variant: "destructive",
    });
    return;
  }
  try {
    // 2. Fetch the file data 
    const downloadUrl = resource.url.startsWith("http")
      ? resource.url
      : `${window.location.origin}${resource.url}`;
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      console.log(`Failed to download file: ${response.statusText}`);
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const blob = await response.blob();

    // 3. Create a temporary link to trigger the download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // 4. Sanitize the filename and set the download attribute
    const fileExtension = resource.fileType.toLowerCase();
    const sanitizedTitle = resource.title
      .replace(/[^a-z0-9]/gi, "_") // Replaces non-alphanumeric chars with underscores
      .toLowerCase();
    link.download = `${sanitizedTitle}.${fileExtension}`;

    // 5. Trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Success",
      description: "File downloaded successfully",
    });
  } catch (error) {
    // 6. Handle any errors during the process
    showToast({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to download file.",
      variant: "destructive",
    });
  }
},

  enhanceText: async (text: string, type: string, context: Record<string, any>) => {
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, context }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || `Server responded with ${response.status}` };
      }
      if (data.enhancedText) {
        return { enhancedText: data.enhancedText };
      }
      return { error: 'AI did not return enhanced content' };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Could not enhance the text' };
    }
  },
}));
