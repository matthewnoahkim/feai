'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// Dynamically import the editor to avoid SSR issues with Three.js
const EditorContent = dynamic(() => import('@/components/editor/EditorContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cad-text">Loading Editor...</p>
      </div>
    </div>
  ),
});

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId ? (Array.isArray(params.projectId) ? params.projectId[0] : params.projectId) : undefined;

  return <EditorContent projectId={projectId} />;
}
