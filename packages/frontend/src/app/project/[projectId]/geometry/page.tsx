'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Box, Save } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useWorkflowStore } from '@/store/workflowStore';
import { useMaterialLibraryStore } from '@/store/materialLibraryStore';
import { useProjectStore } from '@/store/projectStore';
import { useDocumentStore } from '@/store/documentStore';
import { useSchematicStore } from '@/store/schematicStore';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cad-text">Loading CAD Editor...</p>
      </div>
    </div>
  );
}

// The editor pulls in three.js; load it on the client only.
const EditorShell = dynamic(
  () => import('@/components/editor/EditorShell').then(m => ({ default: m.EditorShell })),
  { ssr: false, loading: () => <LoadingSpinner /> },
);

export default function GeometryPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { defaultMaterialId, setGeometryReady, updateStepStatus, setCurrentStep } = useWorkflowStore();
  const materials = useMaterialLibraryStore((s) => s.materials);
  const { currentProject } = useProjectStore();
  const { document } = useDocumentStore();
  const { getNodesByType, markNodeComplete } = useSchematicStore();

  useEffect(() => {
    setCurrentStep('geometry');
    updateStepStatus('geometry', 'in-progress');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Geometry counts as done for the workflow once the active studio has a part.
  useEffect(() => {
    if (!document) return;
    const activePartStudio = document.partStudios.find(ps => ps.id === document.activeElementId);
    const hasParts = !!(activePartStudio?.parts && activePartStudio.parts.length > 0);
    setGeometryReady(hasParts);
    if (hasParts) {
      updateStepStatus('geometry', 'complete');
      getNodesByType('geometry').forEach(n => markNodeComplete(n.id));
    }
  }, [document, setGeometryReady, updateStepStatus, getNodesByType, markNodeComplete]);

  const defaultMaterial = defaultMaterialId ? materials.find(m => m.id === defaultMaterialId) : null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <EditorShell
        projectId={projectId}
        renderHeader={({ save }) => (
          <nav className="bg-white border-b border-cad-border px-4 py-2 flex items-center justify-between z-50">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="logo-link flex items-center gap-2 no-underline">
                <Logo size="md" />
              </Link>
              <div className="w-px h-6 bg-cad-border" />
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-cad-accent" />
                <h1 className="font-serif text-lg text-cad-text">Geometry</h1>
              </div>
              <span className="text-xs text-cad-text-dim font-sans">{currentProject?.name || 'Project'}</span>
              {defaultMaterial && (
                <>
                  <div className="w-px h-6 bg-cad-border" />
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: defaultMaterial.color || '#3b82f6' }} />
                    <span className="text-xs text-cad-text-dim font-sans">Material: {defaultMaterial.name}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void save()}
                className="flex items-center gap-2 px-3 py-1.5 text-cad-text-dim hover:text-cad-text text-sm font-sans transition-colors border border-cad-border hover:border-cad-accent"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </nav>
        )}
      />
    </div>
  );
}
