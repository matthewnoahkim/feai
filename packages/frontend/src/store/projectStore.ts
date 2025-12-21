/**
 * Project Store - Project management state
 */

import { create } from 'zustand'
import { fetchWithAuth } from './authStore'

export interface Project {
  id: string
  name: string
  description?: string
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
  userId: string
  data?: any // CAD document data
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<Project | null>
  createProject: (name: string, description?: string) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  saveProjectData: (id: string, data: any) => Promise<void>
  setCurrentProject: (project: Project | null) => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/projects`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const projects = await response.json()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false 
      })
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }
      
      const project = await response.json()
      set({ currentProject: project, isLoading: false })
      return project
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        isLoading: false 
      })
      return null
    }
  },

  createProject: async (name: string, description?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/projects`, {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create project')
      }
      
      const project = await response.json()
      set((state) => ({ 
        projects: [project, ...state.projects],
        isLoading: false 
      }))
      return project
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false 
      })
      throw error
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      
      const updated = await response.json()
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? updated : p),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false 
      })
      throw error
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false 
      })
      throw error
    }
  },

  saveProjectData: async (id: string, data: any) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/projects/${id}/data`, {
        method: 'PUT',
        body: JSON.stringify({ data }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save project data')
      }
      
      // Update local state
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, data, updatedAt: new Date() } : p
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, data, updatedAt: new Date() } 
          : state.currentProject
      }))
    } catch (error) {
      console.error('Failed to save project data:', error)
      throw error
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}))

