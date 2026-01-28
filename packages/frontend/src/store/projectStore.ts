/**
 * Project Store - Project management state (Next.js compatible)
 */

import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  data?: any;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveProjectData: (id: string, data: any) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const projects = await response.json();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false 
      });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const project = await response.json();
      set({ currentProject: project, isLoading: false });
      return project;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        isLoading: false 
      });
      return null;
    }
  },

  createProject: async (name: string, description?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create project');
      }
      
      const project = await response.json();
      set((state) => ({ 
        projects: [project, ...state.projects],
        isLoading: false 
      }));
      return project;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false 
      });
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      const updated = await response.json();
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? updated : p),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false 
      });
      throw error;
    }
  },

  saveProjectData: async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/projects/${id}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save project data');
      }
      
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, data, updatedAt: new Date() } : p
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, data, updatedAt: new Date() } 
          : state.currentProject
      }));
    } catch (error) {
      console.error('Failed to save project data:', error);
      throw error;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
