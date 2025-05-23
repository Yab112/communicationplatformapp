import type { Resource } from '@/types/resource';
import type { Post } from '@/types/post';

export interface ResourceStore {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  deleteResource: (resourceId: string) => void;
  clearResources: () => void;
}

export interface PostStore {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (postId: string) => void;
  clearPosts: () => void;
} 