'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useMaterialLibraryStore } from '@/store/materialLibraryStore';
import { useProjectStore } from '@/store/projectStore';
import { useSchematicStore } from '@/store/schematicStore';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const setProject = useWorkflowStore((s) => s.setProject);
  const fetchMaterials = useMaterialLibraryStore((s) => s.fetchMaterials);
  const materials = useMaterialLibraryStore((s) => s.materials);
  const materialsLoaded = useMaterialLibraryStore((s) => s.isLoaded);

  useEffect(() => {
    if (projectId) {
      setProject(projectId);
    }
  }, [projectId, setProject]);

  // A project can ship a stored workflow (mesh, setup, solved results) in
  // project.data.workflow, as the seeded boomilever test simulation does. Every step page
  // fetches the project, so load the workflow from that once it arrives. Both stores only
  // fill an empty state, so local work is never overwritten.
  const currentProject = useProjectStore((s) => s.currentProject);
  useEffect(() => {
    if (!projectId || currentProject?.id !== projectId) return;
    const snapshot = currentProject.data?.workflow;
    if (!snapshot) return;
    useWorkflowStore.getState().hydrateFromSnapshot(projectId, snapshot);
    if (snapshot.schematic) {
      const schematic = useSchematicStore.getState();
      if (schematic.projectId !== projectId) schematic.setProject(projectId, currentProject.name);
      schematic.hydrateSchematic(projectId, snapshot.schematic);
    }
  }, [projectId, currentProject]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMaterials();
    }
  }, [status, fetchMaterials]);

  // A returning user's browser may have `defaultMaterialId` cached from before materials
  // moved to the DB (e.g. the literal 'steel-1018' the app used to hardcode as its
  // initial default) — that will never match a real material's cuid() id. Once the
  // account's materials have loaded, remap a stale id to the seeded preset that carries
  // it as `presetKey`, or clear it if nothing matches at all (same "no default selected"
  // state the app already handles elsewhere).
  useEffect(() => {
    if (!materialsLoaded) return;
    const { defaultMaterialId, setDefaultMaterial } = useWorkflowStore.getState();
    if (!defaultMaterialId) return;
    if (materials.some((m) => m.id === defaultMaterialId)) return;
    const remapped = materials.find((m) => m.presetKey === defaultMaterialId);
    setDefaultMaterial(remapped?.id ?? null);
  }, [materials, materialsLoaded]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cad-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
