'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Folder, MoreVertical, Trash2, Edit2, Clock, ChevronDown, LogOut, FolderOpen, Calendar, Edit3, Pencil, Settings } from 'lucide-react';

interface FolderType {
  id: string;
  name: string;
  createdAt: string;
  _count: { projects: number };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string | null;
  folderId?: string | null;
  folder?: { id: string; name: string } | null;
}

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'lastOpened' | 'lastEdited' | 'dateCreated'>('lastEdited');
  const [filterFolderId, setFilterFolderId] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCreateError, setFolderCreateError] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMoveToMenuId, setShowMoveToMenuId] = useState<string | null>(null);
  const [moveToMenuAnchor, setMoveToMenuAnchor] = useState<{ left: number; top: number } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ left: number; top: number } | null>(null);
  const [showManageFoldersModal, setShowManageFoldersModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [folderRenameError, setFolderRenameError] = useState<string | null>(null);
  const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchProjects = async () => {
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

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  // Fetch projects and folders when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
      fetchFolders();
    }
  }, [status]);

  const sortedAndFilteredProjects = (() => {
    let list = filterFolderId
      ? projects.filter((p) => p.folderId === filterFolderId)
      : [...projects];
    const cmp = (a: Project, b: Project) => {
      switch (sortBy) {
        case 'alphabetical':
          return (a.name || '').localeCompare(b.name || '');
        case 'lastOpened':
          return (new Date(b.lastOpenedAt || 0).getTime() - new Date(a.lastOpenedAt || 0).getTime());
        case 'lastEdited':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'dateCreated':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    };
    list.sort(cmp);
    return list;
  })();

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setShowNewProjectModal(false);
        setNewProjectName('');
        setNewProjectDescription('');
        // Navigate to the new project's schematic page
        router.push(`/project/${project.id}/schematic`);
      } else if (response.status === 401) {
        // Session expired, redirect to login
        alert('Your session has expired. Please sign in again.');
        signOut({ callbackUrl: '/login' });
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error?.error?.message || 'Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastOpenedAt: new Date().toISOString() }),
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, lastOpenedAt: new Date().toISOString() } : p
        )
      );
    } catch (_) {}
    router.push(`/project/${projectId}/schematic`);
  };

  const handleMoveToFolder = async (projectId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, folderId: updated.folderId, folder: updated.folder } : p)));
        await fetchFolders();
      }
    } catch (error) {
      console.error('Failed to move project:', error);
    }
    setShowMoveToMenuId(null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setFolderCreateError(null);
    setIsCreatingFolder(true);
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        await fetchFolders();
        setShowNewFolderModal(false);
        setNewFolderName('');
      } else {
        setFolderCreateError((data?.error?.message) || `Failed to create folder (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      setFolderCreateError('Network error. Please try again.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !editingFolderName.trim()) return;
    setFolderRenameError(null);
    setIsUpdatingFolder(true);
    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingFolderName.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        await fetchFolders();
        setEditingFolder(null);
        setEditingFolderName('');
      } else {
        setFolderRenameError((data?.error?.message) || `Failed to rename folder (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to rename folder:', error);
      setFolderRenameError('Network error. Please try again.');
    } finally {
      setIsUpdatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    const count = folder?._count?.projects ?? 0;
    const message = count > 0
      ? `Delete "${folder?.name}"? Its ${count} project(s) will be moved to no folder.`
      : `Delete "${folder?.name}"?`;
    if (!confirm(message)) return;
    setDeletingFolderId(folderId);
    try {
      const response = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
      if (response.ok) {
        if (filterFolderId === folderId) setFilterFolderId(null);
        await fetchFolders();
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    } finally {
      setDeletingFolderId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
    setOpenMenuId(null);
  };

  const handleRenameProject = async () => {
    if (!editingProject || !newProjectName.trim()) return;

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        setProjects(
          projects.map((p) =>
            p.id === editingProject.id
              ? { ...p, name: newProjectName.trim(), description: newProjectDescription.trim() }
              : p
          )
        );
        setEditingProject(null);
        setNewProjectName('');
        setNewProjectDescription('');
      }
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show loading state while checking auth
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

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header
        className="px-8 py-4 flex items-center justify-between"
        style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="logo-link flex items-center gap-2 no-underline">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: '#1a4d8f' }}
            >
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
          </Link>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ background: '#1a4d8f' }}
            >
              {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20"
                style={{ background: 'white', border: '1px solid #e2e8f0' }}
              >
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {session?.user?.email}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Page Title and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: '#1a4d8f' }}>
            My Projects
          </h1>
          <div className="flex items-center gap-3">
            {/* Folder filter */}
            <div className="relative">
              <select
                value={filterFolderId ?? ''}
                onChange={(e) => setFilterFolderId(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All folders</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f._count.projects})
                  </option>
                ))}
              </select>
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sort: {sortBy === 'alphabetical' ? 'Alphabetical' : sortBy === 'lastOpened' ? 'Last opened' : sortBy === 'lastEdited' ? 'Last edited' : 'Date created'}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 mt-1 w-44 rounded-md shadow-lg z-20 bg-white border border-gray-200 py-1">
                    {(['alphabetical', 'lastOpened', 'lastEdited', 'dateCreated'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          setShowSortDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        {opt === 'alphabetical' ? 'Alphabetical' : opt === 'lastOpened' ? 'Last opened' : opt === 'lastEdited' ? 'Last edited' : 'Date created'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => folders.length < 10 && setShowNewFolderModal(true)}
              disabled={folders.length >= 10}
              title={folders.length >= 10 ? 'Maximum number of folders (10) reached' : undefined}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Folder className="w-4 h-4" />
              New folder
            </button>
            <button
              onClick={() => setShowManageFoldersModal(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Manage folders
            </button>
            <button
              onClick={() => projects.length < 100 && setShowNewProjectModal(true)}
              disabled={projects.length >= 100}
              title={projects.length >= 100 ? 'Maximum number of projects (100) reached' : undefined}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#1a4d8f' }}
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : sortedAndFilteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {filterFolderId ? 'No projects in this folder' : 'No projects yet'}
            </h2>
            <p className="text-gray-500 mb-4">
              {filterFolderId ? 'Move projects here or create a new project.' : 'Create your first project to get started'}
            </p>
            {!filterFolderId && (
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-md"
                style={{ background: '#1a4d8f' }}
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Project Info - no thumbnail/icon */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 flex-1"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      {project.name}
                    </h3>
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          if (openMenuId === project.id) {
                            setOpenMenuId(null);
                            setMenuAnchor(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuAnchor({ left: rect.right - 176, top: rect.bottom + 4 });
                            setOpenMenuId(project.id);
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
                  )}

                  <div className="space-y-1 text-xs text-gray-500">
                    {project.folder && (
                      <div className="flex items-center gap-1">
                        <Folder className="w-3 h-3 flex-shrink-0" />
                        <span>{project.folder.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3 flex-shrink-0" />
                      <span>Last opened: {project.lastOpenedAt ? formatDate(project.lastOpenedAt) : 'Never'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Edit3 className="w-3 h-3 flex-shrink-0" />
                      <span>Last edited: {formatDate(project.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>Created: {formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Project card menu - portaled so it is not clipped by the card */}
      {openMenuId && menuAnchor && typeof document !== 'undefined' && (() => {
        const project = sortedAndFilteredProjects.find((p) => p.id === openMenuId);
        if (!project) return null;
        return createPortal(
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => { setOpenMenuId(null); setMenuAnchor(null); setShowMoveToMenuId(null); setMoveToMenuAnchor(null); }}
            />
            <div
              className="fixed w-44 rounded-md shadow-lg z-20 bg-white border border-gray-200 py-1"
              style={{ left: menuAnchor.left, top: menuAnchor.top }}
            >
              <button
                onClick={() => {
                  setEditingProject(project);
                  setNewProjectName(project.name);
                  setNewProjectDescription(project.description || '');
                  setOpenMenuId(null);
                  setMenuAnchor(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  if (showMoveToMenuId === project.id) {
                    setShowMoveToMenuId(null);
                    setMoveToMenuAnchor(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMoveToMenuAnchor({ left: rect.left, top: rect.bottom });
                    setShowMoveToMenuId(project.id);
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Move to folder
                <ChevronDown className="w-3 h-3 ml-auto" />
              </button>
              <button
                onClick={() => {
                  handleDeleteProject(project.id);
                  setOpenMenuId(null);
                  setMenuAnchor(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>,
          document.body
        );
      })()}

      {/* Move to folder dropdown - portaled so it is not clipped by the card */}
      {showMoveToMenuId && moveToMenuAnchor && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed w-48 rounded-md shadow-lg z-30 bg-white border border-gray-200 py-1 max-h-64 overflow-y-auto"
          style={{ left: moveToMenuAnchor.left, top: moveToMenuAnchor.top }}
        >
          <button
            onClick={() => {
              handleMoveToFolder(showMoveToMenuId, null);
              setShowMoveToMenuId(null);
              setMoveToMenuAnchor(null);
              setOpenMenuId(null);
              setMenuAnchor(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            No folder
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                handleMoveToFolder(showMoveToMenuId, f.id);
                setShowMoveToMenuId(null);
                setMoveToMenuAnchor(null);
                setOpenMenuId(null);
                setMenuAnchor(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {f.name}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold" style={{ color: '#1a4d8f' }}>
                Create New Project
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My FEA Project"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your project"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                style={{ background: '#1a4d8f' }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold" style={{ color: '#1a4d8f' }}>
                New Folder
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateFolder();
              }}
              className="p-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Folder name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => { setNewFolderName(e.target.value); setFolderCreateError(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Client A"
                autoFocus
                disabled={isCreatingFolder}
              />
              {folderCreateError && (
                <p className="mt-2 text-sm text-red-600">{folderCreateError}</p>
              )}
            </form>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                  setFolderCreateError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                disabled={isCreatingFolder}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || isCreatingFolder}
                className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                style={{ background: '#1a4d8f' }}
              >
                {isCreatingFolder ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage folders modal */}
      {showManageFoldersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: '#1a4d8f' }}>
                Manage folders
              </h2>
              <button
                type="button"
                onClick={() => { setShowManageFoldersModal(false); setEditingFolder(null); }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {folders.length === 0 ? (
                <p className="text-gray-500 text-sm">No folders yet. Create one from the toolbar.</p>
              ) : (
                <ul className="space-y-1">
                  {folders.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-2 py-2 px-3 rounded-md hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium truncate flex-1">{f.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">({f._count.projects})</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => { setEditingFolder(f); setEditingFolderName(f.name); setFolderRenameError(null); }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                          title="Rename folder"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFolder(f.id)}
                          disabled={deletingFolderId === f.id}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Delete folder"
                        >
                          {deletingFolderId === f.id ? (
                            <span className="w-4 h-4 block border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => { setShowManageFoldersModal(false); setEditingFolder(null); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename folder modal */}
      {editingFolder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold" style={{ color: '#1a4d8f' }}>
                Rename folder
              </h2>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleRenameFolder(); }}
              className="p-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Folder name</label>
              <input
                type="text"
                value={editingFolderName}
                onChange={(e) => { setEditingFolderName(e.target.value); setFolderRenameError(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Client A"
                autoFocus
                disabled={isUpdatingFolder}
              />
              {folderRenameError && (
                <p className="mt-2 text-sm text-red-600">{folderRenameError}</p>
              )}
            </form>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setEditingFolder(null); setEditingFolderName(''); setFolderRenameError(null); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                disabled={isUpdatingFolder}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                disabled={!editingFolderName.trim() || isUpdatingFolder}
                className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                style={{ background: '#1a4d8f' }}
              >
                {isUpdatingFolder ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold" style={{ color: '#1a4d8f' }}>
                Edit Project
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingProject(null);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                style={{ background: '#1a4d8f' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
