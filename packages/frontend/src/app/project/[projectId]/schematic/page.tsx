'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Database, Box, Grid3X3, Settings, BarChart3, ChevronRight, Check, Circle, Loader2 } from 'lucide-react';
import { useWorkflowStore, WorkflowStep } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';

interface WorkflowBlock {
  id: WorkflowStep;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const WORKFLOW_BLOCKS: WorkflowBlock[] = [
  {
    id: 'engineering-data',
    name: 'Engineering Data',
    description: 'Define material properties',
    icon: Database,
    route: 'engineering-data',
  },
  {
    id: 'geometry',
    name: 'Geometry',
    description: 'Create CAD model',
    icon: Box,
    route: 'geometry',
  },
  {
    id: 'mesh',
    name: 'Mesh',
    description: 'Generate finite element mesh',
    icon: Grid3X3,
    route: 'mesh',
  },
  {
    id: 'setup',
    name: 'Setup',
    description: 'Define loads & constraints',
    icon: Settings,
    route: 'setup',
  },
  {
    id: 'results',
    name: 'Results',
    description: 'Run analysis & view results',
    icon: BarChart3,
    route: 'results',
  },
];

function StatusIcon({ status }: { status: 'pending' | 'in-progress' | 'complete' }) {
  switch (status) {
    case 'complete':
      return (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      );
    case 'in-progress':
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <Circle className="w-3 h-3 text-gray-300" />
        </div>
      );
  }
}

function ConnectionLine({ fromStatus, toStatus }: { fromStatus: 'pending' | 'in-progress' | 'complete'; toStatus: 'pending' | 'in-progress' | 'complete' }) {
  const isComplete = fromStatus === 'complete';
  return (
    <div className="flex items-center px-2">
      <div className={`h-0.5 w-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isComplete ? 'text-green-500' : 'text-gray-300'}`} />
    </div>
  );
}

export default function SchematicPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const projectId = params.projectId as string;
  
  const { setProject, stepStatus, currentStep, setCurrentStep } = useWorkflowStore();
  const { fetchProject, currentProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setProject(projectId);
      fetchProject(projectId).then(() => {
        setIsLoading(false);
      });
    }
  }, [projectId, setProject, fetchProject]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleBlockClick = (block: WorkflowBlock) => {
    setCurrentStep(block.id);
    router.push(`/project/${projectId}/${block.route}`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cad-text">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-cad-text-dim hover:text-cad-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-sans">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-cad-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
                <span className="text-white font-serif font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="font-serif text-lg text-cad-text">
                  {currentProject?.name || 'Project'}
                </h1>
                <p className="text-xs text-cad-text-dim font-sans">Project Schematic</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-cad-text-dim font-sans">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-cad-text mb-2">Analysis Workflow</h2>
            <p className="text-cad-text-dim font-sans">
              Follow the steps below to complete your finite element analysis
            </p>
          </div>

          {/* Workflow Blocks */}
          <div className="flex items-stretch justify-center gap-2">
            {WORKFLOW_BLOCKS.map((block, index) => {
              const status = stepStatus[block.id];
              const Icon = block.icon;
              const isActive = currentStep === block.id;
              
              return (
                <div key={block.id} className="flex items-center">
                  {/* Block */}
                  <button
                    onClick={() => handleBlockClick(block)}
                    className={`
                      relative p-6 bg-white border-2 transition-all duration-200 
                      min-w-[180px] text-left group hover:shadow-lg
                      ${isActive 
                        ? 'border-cad-accent shadow-md ring-2 ring-cad-accent/20' 
                        : status === 'complete'
                          ? 'border-green-500 hover:border-green-600'
                          : 'border-cad-border hover:border-cad-accent'
                      }
                    `}
                  >
                    {/* Status Badge */}
                    <div className="absolute -top-3 -right-3">
                      <StatusIcon status={status} />
                    </div>
                    
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center mb-4
                      ${isActive 
                        ? 'bg-cad-accent/10 text-cad-accent' 
                        : status === 'complete'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-cad-accent/10 group-hover:text-cad-accent'
                      }
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className={`
                      font-serif text-base mb-1
                      ${isActive ? 'text-cad-accent' : 'text-cad-text'}
                    `}>
                      {block.name}
                    </h3>
                    <p className="text-xs text-cad-text-dim font-sans">
                      {block.description}
                    </p>
                    
                    {/* Step Number */}
                    <div className="absolute bottom-2 right-2 text-xs text-cad-text-dim font-sans">
                      Step {index + 1}
                    </div>
                  </button>
                  
                  {/* Connection Line */}
                  {index < WORKFLOW_BLOCKS.length - 1 && (
                    <ConnectionLine 
                      fromStatus={status} 
                      toStatus={stepStatus[WORKFLOW_BLOCKS[index + 1].id]} 
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Materials Summary */}
            <div className="bg-white border border-cad-border p-6">
              <h4 className="font-serif text-lg text-cad-text mb-4">Engineering Data</h4>
              <MaterialsSummary />
            </div>
            
            {/* Geometry Summary */}
            <div className="bg-white border border-cad-border p-6">
              <h4 className="font-serif text-lg text-cad-text mb-4">Model Status</h4>
              <GeometrySummary projectId={projectId} />
            </div>
            
            {/* Analysis Summary */}
            <div className="bg-white border border-cad-border p-6">
              <h4 className="font-serif text-lg text-cad-text mb-4">Analysis Status</h4>
              <AnalysisSummary />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-cad-border py-4 px-6">
        <div className="text-center text-xs text-cad-text-dim font-sans">
          FeAI - Finite Element Analysis Interface
        </div>
      </footer>
    </div>
  );
}

function MaterialsSummary() {
  const { materials, defaultMaterialId } = useWorkflowStore();
  const customMaterials = materials.filter((m) => m.isCustom);
  const defaultMaterial = materials.find((m) => m.id === defaultMaterialId);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Default Material:</span>
        <span className="text-cad-text font-sans font-medium">
          {defaultMaterial?.name || 'Not set'}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Custom Materials:</span>
        <span className="text-cad-text font-sans font-medium">{customMaterials.length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Library Materials:</span>
        <span className="text-cad-text font-sans font-medium">
          {materials.length - customMaterials.length}
        </span>
      </div>
    </div>
  );
}

function GeometrySummary({ projectId }: { projectId: string }) {
  const { geometryReady, meshData } = useWorkflowStore();
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Geometry:</span>
        <span className={`font-sans font-medium ${geometryReady ? 'text-green-600' : 'text-yellow-600'}`}>
          {geometryReady ? 'Ready' : 'Not created'}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Mesh:</span>
        <span className={`font-sans font-medium ${meshData ? 'text-green-600' : 'text-yellow-600'}`}>
          {meshData ? 'Generated' : 'Not generated'}
        </span>
      </div>
      {meshData && (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-cad-text-dim font-sans">Nodes:</span>
            <span className="text-cad-text font-sans font-medium">
              {meshData.nodeCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cad-text-dim font-sans">Elements:</span>
            <span className="text-cad-text font-sans font-medium">
              {meshData.elementCount.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function AnalysisSummary() {
  const { boundaryConditions, loads, analysisResults, isRunning } = useWorkflowStore();
  const activeBCs = boundaryConditions.filter((bc) => bc.enabled);
  const activeLoads = loads.filter((l) => l.enabled);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Boundary Conditions:</span>
        <span className="text-cad-text font-sans font-medium">{activeBCs.length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Loads:</span>
        <span className="text-cad-text font-sans font-medium">{activeLoads.length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-cad-text-dim font-sans">Analysis:</span>
        <span className={`font-sans font-medium ${
          isRunning ? 'text-blue-600' : 
          analysisResults ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {isRunning ? 'Running...' : analysisResults ? 'Complete' : 'Not run'}
        </span>
      </div>
      {analysisResults && (
        <div className="pt-2 border-t border-cad-border">
          <div className="flex justify-between text-sm">
            <span className="text-cad-text-dim font-sans">Max Stress:</span>
            <span className="text-cad-text font-sans font-medium">
              {(analysisResults.stress.vonMises.max / 1e6).toFixed(2)} MPa
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
