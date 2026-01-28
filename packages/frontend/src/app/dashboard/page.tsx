'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Folder, MoreVertical, Trash2, Edit2, Clock, Book, ChevronDown, LogOut } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DashboardPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renamingProject, setRenamingProject] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch projects on mount when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      
      if (response.ok) {
        const project = await response.json();
        setShowNewProjectDialog(false);
        setNewProjectName('');
        // Navigate to project schematic page instead of editor
        router.push(`/project/${project.id}/schematic`);
      } else if (response.status === 401) {
        // Session expired or invalid - prompt re-login
        alert('Your session has expired. Please sign in again.');
        signOut({ callbackUrl: '/login' });
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error?.error?.message || 'Failed to create project. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Please check your connection and try again.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProjects(projects.filter(p => p.id !== projectId));
          setActiveMenu(null);
        }
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project');
      }
    }
  };

  const handleRenameProject = (projectId: string, currentName: string) => {
    setRenamingProject(projectId);
    setRenameValue(currentName);
    setActiveMenu(null);
  };

  const handleSaveRename = async (projectId: string) => {
    if (!renameValue.trim()) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updated : p));
        setRenamingProject(null);
        setRenameValue('');
      }
    } catch (err) {
      console.error('Failed to rename project:', err);
      alert('Failed to rename project');
    }
  };

  const handleCancelRename = () => {
    setRenamingProject(null);
    setRenameValue('');
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/project/${projectId}/schematic`);
  };

  const handleEditUserName = () => {
    setNewUserName(session?.user?.name || '');
    setShowEditNameDialog(true);
    setShowUserMenu(false);
  };

  const handleSaveUserName = async () => {
    if (!newUserName.trim()) return;
    
    try {
      const response = await fetch('/api/auth/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName.trim() }),
      });
      
      if (response.ok) {
        await updateSession();
        setShowEditNameDialog(false);
        setNewUserName('');
      }
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cad-text font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cad-border">
        <Link 
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity no-underline"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <span className="font-serif font-semibold text-cad-text text-lg">FeAI</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {session && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-cad-text hover:bg-gray-50 transition-colors border border-transparent hover:border-cad-border"
              >
                <span>{session.user.name || session.user.email}</span>
                <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cad-border shadow-lg z-50">
                  <button
                    onClick={handleEditUserName}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-cad-text hover:bg-gray-50 font-sans text-left"
                  >
                    <Edit2 size={14} />
                    Edit Username
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-sans text-left border-t border-cad-border"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
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
                Create and manage your designs
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
                  {renamingProject === project.id ? (
                    <div className="mb-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(project.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onBlur={() => handleSaveRename(project.id)}
                        className="w-full px-2 py-1 border border-cad-accent text-sm font-serif focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3 className="font-serif text-base text-cad-text mb-1 truncate">
                      {project.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-sans">
                    <Clock size={12} />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === project.id ? null : project.id);
                      }}
                      className="p-1.5 hover:bg-white/90 bg-white/70 backdrop-blur-sm rounded border border-cad-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="More options"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>
                    
                    {activeMenu === project.id && (
                      <div 
                        className="absolute right-0 top-full mt-1 w-40 bg-white border border-cad-border shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameProject(project.id, project.name);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cad-text hover:bg-gray-50 font-sans text-left"
                        >
                          <Edit2 size={14} />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-sans text-left border-t border-cad-border"
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
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setShowNewProjectDialog(false);
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-cad-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewProjectDialog(false);
                  setNewProjectName('');
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

      {/* Edit Username Dialog */}
      {showEditNameDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white border border-cad-border w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-cad-border">
              <h2 className="font-serif text-xl text-cad-text">Edit Username</h2>
            </div>
            <div className="px-6 py-6">
              <label className="block mb-2 font-sans text-sm text-cad-text">
                Display Name
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveUserName();
                  if (e.key === 'Escape') setShowEditNameDialog(false);
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-cad-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditNameDialog(false);
                  setNewUserName('');
                }}
                className="px-4 py-2 text-sm font-sans text-cad-text border border-cad-border hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserName}
                disabled={!newUserName.trim()}
                className="px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(activeMenu || showUserMenu) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setActiveMenu(null);
            setShowUserMenu(false);
          }}
        />
      )}

      {/* Footer with API Docs link */}
      <footer className="border-t border-cad-border py-4 px-8 bg-white">
        <div className="max-w-5xl mx-auto flex justify-center">
          <Link
            href="/api-docs"
            className="flex items-center gap-2 text-xs font-sans text-gray-500 hover:text-cad-accent transition-colors no-underline"
          >
            <Book size={14} />
            API Documentation
          </Link>
        </div>
      </footer>
    </div>
  );
}
