'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Folder, MoreVertical, Trash2, Edit2, Clock, ChevronDown, LogOut, FolderOpen, Calendar, Edit3, Pencil, Search, LayoutList, PanelRightClose, PanelRight } from 'lucide-react';

interface FolderType {
  id: string;
  name: string;
  order?: number;
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
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'dateModified-asc' | 'dateModified-desc' | 'dateCreated-asc' | 'dateCreated-desc'>('dateModified-desc');
  const [filterFolderId, setFilterFolderId] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCreateError, setFolderCreateError] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMoveToMenuId, setShowMoveToMenuId] = useState<string | null>(null);
  const [moveToMenuAnchor, setMoveToMenuAnchor] = useState<{ left: number; top: number } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ left: number; top: number } | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [folderRenameError, setFolderRenameError] = useState<string | null>(null);
  const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showDetailsPane, setShowDetailsPane] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'project'; id: string; name: string } | { type: 'folder'; id: string; name: string; projectCount: number } | null>(null);

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
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }
    const cmp = (a: Project, b: Project) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'dateModified-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'dateModified-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'dateCreated-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'dateCreated-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    };
    list.sort(cmp);
    return list;
  })();

  const selectedProjects = sortedAndFilteredProjects.filter((p) => selectedProjectIds.includes(p.id));
  const selectedProject = selectedProjects.length === 1 ? selectedProjects[0] : null;
  const currentFolder = filterFolderId ? folders.find((f) => f.id === filterFolderId) : null;

  const handleProjectRowClick = (projectId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedProjectIds((prev) =>
        prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
      );
    } else {
      setSelectedProjectIds([projectId]);
    }
  };

  const handleFoldersReorder = async (orderedIds: string[]) => {
    try {
      const response = await fetch('/api/folders/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderIds: orderedIds }),
      });
      if (response.ok) {
        setFolders((prev) => {
          const byId = new Map(prev.map((f) => [f.id, f]));
          return orderedIds.map((id) => byId.get(id)).filter(Boolean) as FolderType[];
        });
      }
    } catch (error) {
      console.error('Failed to reorder folders:', error);
    } finally {
      setDraggingFolderId(null);
      setDropTargetFolderId(null);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
          folderId: filterFolderId ?? null,
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
    setDeletingFolderId(folderId);
    try {
      const response = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
      if (response.ok) {
        if (filterFolderId === folderId) setFilterFolderId(null);
        setSelectedProjectIds([]);
        await fetchFolders();
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    } finally {
      setDeletingFolderId(null);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
        setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
    setOpenMenuId(null);
    setMenuAnchor(null);
    setDeleteConfirm(null);
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
    <div className="min-h-screen flex flex-col" style={{ background: '#f1f5f9' }}>
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

      {/* File Explorer–style layout */}
      <main className="flex-1 flex flex-col min-h-0" style={{ background: '#f1f5f9' }}>
        {/* Toolbar: + New and search left-aligned, Sort and Details right-aligned */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              New
              <ChevronDown className="w-4 h-4" />
            </button>
            {showNewDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNewDropdown(false)} />
                <div className="absolute left-0 mt-1 w-44 rounded-md shadow-lg z-20 bg-white border border-gray-200 py-1">
                  <button
                    onClick={() => { setShowNewFolderModal(true); setShowNewDropdown(false); }}
                    disabled={folders.length >= 10}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Folder className="w-4 h-4" />
                    New folder
                  </button>
                  <button
                    onClick={() => { setShowNewProjectModal(true); setShowNewDropdown(false); }}
                    disabled={projects.length >= 100}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <LayoutList className="w-4 h-4" />
                    New project
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                Sort
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 mt-1 w-52 rounded-md shadow-lg z-20 bg-white border border-gray-200 py-1">
                    <button onClick={() => { setSortBy('name-asc'); setShowSortDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Name (A–Z)</button>
                    <button onClick={() => { setSortBy('name-desc'); setShowSortDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Name (Z–A)</button>
                    <button onClick={() => { setSortBy('dateModified-desc'); setShowSortDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Date modified (newest first)</button>
                    <button onClick={() => { setSortBy('dateModified-asc'); setShowSortDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Date modified (oldest first)</button>
                    <button onClick={() => { setSortBy('dateCreated-desc'); setShowSortDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Date created (newest first)</button>
                    <button onClick={() => { setSortBy('dateCreated-asc'); setShowSortDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Date created (oldest first)</button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setShowDetailsPane(!showDetailsPane)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
              title={showDetailsPane ? 'Hide details' : 'Show details'}
            >
              {showDetailsPane ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
              Details
            </button>
          </div>
        </div>

        {/* Three-pane body */}
        <div className="flex-1 flex min-h-0">
          {/* Left: folder navigation */}
          <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Folders
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.types.includes('application/x-feai-project-id')) {
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverFolderId('');
                  } else {
                    e.dataTransfer.dropEffect = 'none';
                  }
                }}
                onDragLeave={() => setDragOverFolderId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverFolderId(null);
                  const projectId = e.dataTransfer.getData('application/x-feai-project-id');
                  if (projectId) handleMoveToFolder(projectId, null);
                }}
                className={dragOverFolderId === '' ? 'bg-blue-100 rounded' : undefined}
              >
                <button
                  onClick={() => { setFilterFolderId(null); setSelectedProjectIds([]); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${!filterFolderId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FolderOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">All folders</span>
                </button>
              </div>
              {folders.map((f) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-feai-folder-id', f.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingFolderId(f.id);
                  }}
                  onDragEnd={() => { setDraggingFolderId(null); setDropTargetFolderId(null); }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.types.includes('application/x-feai-folder-id')) {
                      e.dataTransfer.dropEffect = 'move';
                      setDropTargetFolderId(f.id);
                    } else if (e.dataTransfer.types.includes('application/x-feai-project-id')) {
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverFolderId(f.id);
                    }
                  }}
                  onDragLeave={() => { setDragOverFolderId(null); setDropTargetFolderId(null); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverFolderId(null);
                    setDropTargetFolderId(null);
                    const folderId = e.dataTransfer.getData('application/x-feai-folder-id');
                    const projectId = e.dataTransfer.getData('application/x-feai-project-id');
                    if (folderId && folderId !== f.id) {
                      const fromIndex = folders.findIndex((x) => x.id === folderId);
                      const toIndex = folders.findIndex((x) => x.id === f.id);
                      if (fromIndex !== -1 && toIndex !== -1) {
                        const reordered = [...folders];
                        const [removed] = reordered.splice(fromIndex, 1);
                        reordered.splice(toIndex, 0, removed);
                        handleFoldersReorder(reordered.map((x) => x.id));
                      }
                    } else if (projectId) {
                      handleMoveToFolder(projectId, f.id);
                    }
                  }}
                  className={`group flex items-center gap-1 px-3 py-2 text-sm cursor-grab active:cursor-grabbing ${filterFolderId === f.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} ${dragOverFolderId === f.id || dropTargetFolderId === f.id ? 'bg-blue-100 rounded' : ''} ${draggingFolderId === f.id ? 'opacity-50' : ''}`}
                >
                  <button
                    onClick={() => { setFilterFolderId(f.id); setSelectedProjectIds([]); }}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <Folder className="w-4 h-4 flex-shrink-0" style={{ color: '#1a4d8f' }} />
                    <span className="truncate font-medium">{f.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">({f._count.projects})</span>
                  </button>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingFolder(f); setEditingFolderName(f.name); setFolderRenameError(null); }}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                      title="Rename folder"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'folder', id: f.id, name: f.name, projectCount: f._count.projects }); }}
                      disabled={deletingFolderId === f.id}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      title="Delete folder"
                    >
                      {deletingFolderId === f.id ? (
                        <span className="w-3.5 h-3.5 block border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Center: list view */}
          <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-gray-200">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-8 h-8 border-2 border-cad-accent border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">Loading projects...</span>
              </div>
            ) : sortedAndFilteredProjects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Folder className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">
                  {filterFolderId ? 'No projects in this folder' : searchQuery.trim() ? 'No projects match your search' : 'No projects yet'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {!filterFolderId && !searchQuery.trim() ? 'Create a project using the New menu above.' : 'Try a different folder or search.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 w-0">Name</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 w-40">Date modified</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 w-24">Type</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndFilteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/x-feai-project-id', project.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={(e) => handleProjectRowClick(project.id, e)}
                        onDoubleClick={() => handleOpenProject(project.id)}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer select-none ${selectedProjectIds.includes(project.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-2 px-3">
                          <span className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                            {project.name}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600">{formatDate(project.updatedAt)}</td>
                        <td className="py-2 px-3 text-gray-500">Project</td>
                        <td className="py-2 px-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (openMenuId === project.id) {
                                setOpenMenuId(null);
                                setMenuAnchor(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuAnchor({ left: rect.right - 176, top: rect.bottom + 4 });
                                setOpenMenuId(project.id);
                              }
                            }}
                            className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: details pane */}
          {showDetailsPane && (
            <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Details
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedProjects.length > 1 ? (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedProjects.length} projects selected</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedProjects.map((p) => (
                        <li key={p.id} className="truncate">{p.name}</li>
                      ))}
                    </ul>
                  </>
                ) : selectedProject ? (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-1">{selectedProject.name}</h3>
                    {selectedProject.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{selectedProject.description}</p>
                    )}
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500">Type</dt>
                        <dd className="text-gray-900">Project</dd>
                      </div>
                      {selectedProject.folder && (
                        <div>
                          <dt className="text-gray-500">Folder</dt>
                          <dd className="text-gray-900">{selectedProject.folder.name}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-gray-500">Date modified</dt>
                        <dd className="text-gray-900">{formatDate(selectedProject.updatedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Created</dt>
                        <dd className="text-gray-900">{formatDate(selectedProject.createdAt)}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenProject(selectedProject.id)}
                        className="px-3 py-1.5 text-sm text-white rounded"
                        style={{ background: '#1a4d8f' }}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => { setEditingProject(selectedProject); setNewProjectName(selectedProject.name); setNewProjectDescription(selectedProject.description || ''); }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'project', id: selectedProject.id, name: selectedProject.name })}
                        className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : currentFolder ? (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-1">{currentFolder.name}</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500">Type</dt>
                        <dd className="text-gray-900">Folder</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Projects</dt>
                        <dd className="text-gray-900">{currentFolder._count.projects} item(s)</dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Select a project or folder to view details.</p>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-1.5 bg-white border-t border-gray-200 text-xs text-gray-500 flex-shrink-0">
          <span>{sortedAndFilteredProjects.length} item(s)</span>
          {selectedProjectIds.length > 0 && <span>{selectedProjectIds.length} selected</span>}
        </div>
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
                  setOpenMenuId(null);
                  setMenuAnchor(null);
                  setDeleteConfirm({ type: 'project', id: project.id, name: project.name });
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

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Are you sure?
              </h2>
            </div>
            <div className="p-6">
              {deleteConfirm.type === 'project' ? (
                <p className="text-gray-600">
                  Delete project &quot;{deleteConfirm.name}&quot;? This cannot be undone.
                </p>
              ) : (
                <p className="text-gray-600">
                  {deleteConfirm.projectCount > 0
                    ? `Delete folder "${deleteConfirm.name}"? Its ${deleteConfirm.projectCount} project(s) will also be permanently deleted.`
                    : `Delete folder "${deleteConfirm.name}"?`}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteConfirm.type === 'project'
                    ? handleDeleteProject(deleteConfirm.id)
                    : handleDeleteFolder(deleteConfirm.id)
                }
                disabled={deleteConfirm.type === 'folder' && deletingFolderId === deleteConfirm.id}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {deleteConfirm.type === 'folder' && deletingFolderId === deleteConfirm.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
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
