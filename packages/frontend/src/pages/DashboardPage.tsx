/**
 * Dashboard Page - Project management
 * Minimalistic design for viewing and creating projects
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore, Project } from '../store/projectStore'
import { Plus, Folder, MoreVertical, Trash2, Edit2, Clock } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { projects, isLoading, fetchProjects, createProject, deleteProject } = useProjectStore()
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Fetch projects on mount
  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    
    try {
      const project = await createProject(newProjectName.trim())
      setShowNewProjectDialog(false)
      setNewProjectName('')
      // Navigate to the new project
      navigate(`/editor/${project.id}`)
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId)
      setActiveMenu(null)
    }
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}`)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cad-border">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <span className="font-serif font-semibold text-cad-text text-lg">FeAI</span>
        </button>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.name} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center bg-cad-accent text-white text-sm font-sans">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="font-sans text-sm text-cad-text">{user.name}</span>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-sans text-cad-text border border-cad-border hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-8 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-cad-text mb-2">
                Your Projects
              </h1>
              <p className="font-sans text-sm text-gray-600">
                Create and manage your CAD designs
              </p>
            </div>
            <button
              onClick={() => setShowNewProjectDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cad-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-cad-border">
              <Folder size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-serif text-lg text-cad-text mb-2">No projects yet</h3>
              <p className="font-sans text-sm text-gray-600 mb-6">
                Create your first project to get started
              </p>
              <button
                onClick={() => setShowNewProjectDialog(true)}
                className="px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative border border-cad-border p-4 hover:border-cad-accent transition-colors cursor-pointer"
                  onClick={() => handleOpenProject(project.id)}
                >
                  {/* Project Thumbnail */}
                  <div className="aspect-video bg-gray-50 border border-cad-border mb-4 flex items-center justify-center">
                    {project.thumbnail ? (
                      <img 
                        src={project.thumbnail} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Folder size={32} className="text-gray-300" />
                    )}
                  </div>
                  
                  {/* Project Info */}
                  <h3 className="font-serif text-base text-cad-text mb-1 truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-sans">
                    <Clock size={12} />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenu(activeMenu === project.id ? null : project.id)
                      }}
                      className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    
                    {activeMenu === project.id && (
                      <div className="absolute right-0 top-8 w-36 bg-white border border-cad-border shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Implement rename
                            setActiveMenu(null)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cad-text hover:bg-gray-50 font-sans"
                        >
                          <Edit2 size={14} />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-sans"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-cad-border w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-cad-border">
              <h2 className="font-serif text-xl text-cad-text">New Project</h2>
            </div>
            <div className="px-6 py-6">
              <label className="block mb-2 font-sans text-sm text-cad-text">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject()
                  if (e.key === 'Escape') setShowNewProjectDialog(false)
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-cad-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewProjectDialog(false)
                  setNewProjectName('')
                }}
                className="px-4 py-2 text-sm font-sans text-cad-text border border-cad-border hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}

