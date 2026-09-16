'use client';

import { Layout } from '@/components/Layout';
import { SimulationPanel } from '@/components/fea';
import { EditorShell } from './EditorShell';

interface EditorContentProps {
  projectId?: string;
}

export default function EditorContent({ projectId }: EditorContentProps) {
  return (
    <Layout>
      <EditorShell projectId={projectId}>
        <SimulationPanel />
      </EditorShell>
    </Layout>
  );
}
