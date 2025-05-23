import { create } from 'zustand';
import type { ResourceStore } from './types';
import type { Resource } from '@/types/resource';

export const useResourceStore = create<ResourceStore>((set) => ({
  resources: [],
  setResources: (resources) => set({ resources }),
  addResource: (resource) => 
    set((state) => ({ 
      resources: [resource, ...state.resources] 
    })),
  updateResource: (resource) =>
    set((state) => ({
      resources: state.resources.map((r) => 
        r.id === resource.id ? resource : r
      ),
    })),
  deleteResource: (resourceId) =>
    set((state) => ({
      resources: state.resources.filter((r) => r.id !== resourceId),
    })),
  clearResources: () => set({ resources: [] }),
})); 