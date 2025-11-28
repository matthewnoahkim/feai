/**
 * SimulationPanel - Main FEA UI Container
 * Provides tabbed interface for Mesh, Materials, Boundary Conditions, and Results
 */

import React from 'react';
import { useFEAStore } from '../../store/feaStore';
import { useDocumentStore } from '../../store/documentStore';
import { MeshPanel } from './MeshPanel';
import { MaterialPanel } from './MaterialPanel';
import { BoundaryConditionsPanel } from './BoundaryConditionsPanel';
import { ResultsPanel } from './ResultsPanel';

// Icons
const MeshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const MaterialIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const BCIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ResultsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function SimulationPanel() {
  const { document } = useDocumentStore();
  const {
    isSimulationMode,
    activeFEAPanel,
    setActiveFEAPanel,
    exitSimulationMode,
    mesh,
    materialAssignments,
    boundaryConditions,
    solverStatus,
    solverProgress,
    solverMessage,
    results,
    runSimulation,
    cancelSimulation,
    resetFEA,
  } = useFEAStore();

  if (!isSimulationMode) return null;

  const partStudioId = document?.activeElementId || '';

  const tabs = [
    { id: 'mesh' as const, label: 'Mesh', icon: <MeshIcon />, badge: mesh ? '✓' : null },
    { id: 'material' as const, label: 'Material', icon: <MaterialIcon />, badge: materialAssignments.length > 0 ? '✓' : null },
    { id: 'bc' as const, label: 'Loads & BCs', icon: <BCIcon />, badge: boundaryConditions.length > 0 ? String(boundaryConditions.length) : null },
    { id: 'results' as const, label: 'Results', icon: <ResultsIcon />, badge: results ? '✓' : null },
  ];

  const isRunning = ['meshing', 'preparing', 'solving', 'postProcessing'].includes(solverStatus);
  const canRun = mesh && boundaryConditions.some((bc) => bc.type === 'fixed' || bc.type === 'displacement');

  const handleRun = async () => {
    if (isRunning) {
      await cancelSimulation();
    } else {
      await runSimulation(partStudioId);
    }
  };

  const handleClose = () => {
    if (isRunning) {
      cancelSimulation();
    }
    resetFEA();
    exitSimulationMode();
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-cad-dark border-l border-cad-border flex flex-col z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-cad-darker">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-cad-text">FEA Simulation</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-cad-border rounded transition-colors"
          title="Exit Simulation Mode"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-cad-border bg-cad-darker">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFEAPanel(tab.id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-2 px-1 text-xs transition-colors relative
              ${activeFEAPanel === tab.id
                ? 'text-blue-400 bg-cad-dark'
                : 'text-cad-text-dim hover:text-cad-text hover:bg-cad-dark/50'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="absolute top-1 right-2 w-4 h-4 flex items-center justify-center text-[10px] font-medium bg-green-500/20 text-green-400 rounded-full">
                {tab.badge}
              </span>
            )}
            {activeFEAPanel === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activeFEAPanel === 'mesh' && <MeshPanel />}
        {activeFEAPanel === 'material' && <MaterialPanel />}
        {activeFEAPanel === 'bc' && <BoundaryConditionsPanel />}
        {activeFEAPanel === 'results' && <ResultsPanel />}
      </div>

      {/* Run Button & Status */}
      <div className="border-t border-cad-border bg-cad-darker p-3 space-y-3">
        {/* Status */}
        {solverStatus !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cad-text-dim">{solverMessage || 'Processing...'}</span>
              <span className="text-cad-text">{solverProgress}%</span>
            </div>
            <div className="h-1.5 bg-cad-dark rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  solverStatus === 'error' ? 'bg-red-500' :
                  solverStatus === 'completed' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${solverProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Run/Stop Button */}
        <button
          onClick={handleRun}
          disabled={!canRun && !isRunning}
          className={`
            w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
            ${isRunning
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              : canRun
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20'
                : 'bg-cad-border text-cad-text-dim cursor-not-allowed'
            }
          `}
        >
          {isRunning ? (
            <>
              <StopIcon />
              <span>Stop</span>
            </>
          ) : (
            <>
              <PlayIcon />
              <span>Run Simulation</span>
            </>
          )}
        </button>

        {/* Validation Messages */}
        {!mesh && (
          <p className="text-xs text-yellow-500 text-center">
            Generate mesh before running simulation
          </p>
        )}
        {mesh && !boundaryConditions.some((bc) => bc.type === 'fixed' || bc.type === 'displacement') && (
          <p className="text-xs text-yellow-500 text-center">
            Add at least one fixed support or constraint
          </p>
        )}
      </div>
    </div>
  );
}

