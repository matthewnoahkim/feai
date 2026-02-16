'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWorkflowStore } from '@/store/workflowStore';

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

  useEffect(() => {
    if (projectId) {
      setProject(projectId);
    }
  }, [projectId, setProject]);

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
