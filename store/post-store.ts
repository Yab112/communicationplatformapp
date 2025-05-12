import { create } from 'zustand';
import type { PostStore } from './types';

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => 
    set((state) => ({ 
      posts: [post, ...state.posts] 
    })),
  updatePost: (post) =>
    set((state) => ({
      posts: state.posts.map((p) => 
        p.id === post.id ? post : p
      ),
    })),
  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    })),
  clearPosts: () => set({ posts: [] }),
})); 