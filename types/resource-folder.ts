export interface ResourceFolder {
  id: string;
  name: string;
  description?: string;
  authorId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  resourceCount: number; // Number of resources in the folder
}

export interface ResourceFoldersResponse {
  folders: ResourceFolder[];
  error: string | null;
}

export interface CreateResourceFolderResponse {
  folder: ResourceFolder | null;
  error: string | null;
}

export interface DeleteResourceFolderResponse {
  success?: boolean;
  error?: string;
}

export interface AddResourceToFolderResponse {
  success?: boolean;
  error?: string;
}

export interface RemoveResourceFromFolderResponse {
  success?: boolean;
  error?: string;
}