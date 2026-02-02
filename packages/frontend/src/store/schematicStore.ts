/**
 * Schematic Store - Manages ANSYS Workbench-style project schematic
 * Handles nodes, connections, drag-and-drop, and cascade updates
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NodeType = 'engineering-data' | 'geometry' | 'mesh' | 'setup' | 'results';

export interface SchematicNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  status: 'pending' | 'in-progress' | 'complete' | 'outdated';
  lastUpdated?: number;
  data?: any; // Type-specific data stored with the node
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}

// Define valid connection types (source -> target)
const VALID_CONNECTIONS: Record<NodeType, NodeType[]> = {
  'engineering-data': ['geometry'],
  'geometry': ['mesh'],
  'mesh': ['setup'],
  'setup': ['results'],
  'results': [],
};

// Define which node types can have multiple instances
const MULTI_INSTANCE_TYPES: NodeType[] = ['geometry', 'mesh', 'setup', 'results'];

interface SchematicState {
  // Project info
  projectId: string | null;
  projectName: string;
  
  // Nodes and connections
  nodes: SchematicNode[];
  connections: Connection[];
  
  // Selection state
  selectedNodeId: string | null;
  
  // Drag state
  draggingNodeType: NodeType | null;
  dragPosition: { x: number; y: number } | null;
  
  // Actions
  setProject: (projectId: string, name?: string) => void;
  setProjectName: (name: string) => void;
  
  // Node actions
  addNode: (type: NodeType, x: number, y: number, name?: string) => string;
  updateNode: (id: string, updates: Partial<SchematicNode>) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  selectNode: (id: string | null) => void;
  
  // Connection actions
  addConnection: (sourceId: string, targetId: string) => boolean;
  removeConnection: (id: string) => void;
  canConnect: (sourceId: string, targetId: string) => boolean;
  
  // Cascade update actions
  markNodeComplete: (id: string) => void;
  markNodeOutdated: (id: string) => void;
  propagateUpdate: (nodeId: string) => void;
  
  // Drag actions
  startDrag: (type: NodeType) => void;
  updateDragPosition: (x: number, y: number) => void;
  endDrag: () => void;
  
  // Utility
  getNodesByType: (type: NodeType) => SchematicNode[];
  getConnectedNodes: (nodeId: string, direction: 'upstream' | 'downstream') => SchematicNode[];
  getNodeStatus: (id: string) => 'pending' | 'in-progress' | 'complete' | 'outdated';
  
  // Reset
  resetSchematic: () => void;
  
  // Auto-save timestamp
  lastSaved: number | null;
  setLastSaved: (timestamp: number) => void;
}

const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substring(7)}`;

export const useSchematicStore = create<SchematicState>()(
  persist(
    (set, get) => ({
      // Initial state
      projectId: null,
      projectName: 'Untitled Project',
      nodes: [],
      connections: [],
      selectedNodeId: null,
      draggingNodeType: null,
      dragPosition: null,
      lastSaved: null,

      setProject: (projectId, name) => {
        const current = get().projectId;
        if (current !== projectId) {
          // Load saved state for this project or reset
          set({
            projectId,
            projectName: name || 'Untitled Project',
            selectedNodeId: null,
          });
        }
      },

      setProjectName: (name) => set({ projectName: name }),

      addNode: (type, x, y, name) => {
        const id = generateId();
        const defaultNames: Record<NodeType, string> = {
          'engineering-data': 'Engineering Data',
          'geometry': 'Geometry',
          'mesh': 'Mesh',
          'setup': 'Setup',
          'results': 'Results',
        };
        
        // For engineering-data, only allow one instance
        if (type === 'engineering-data') {
          const existing = get().nodes.find(n => n.type === 'engineering-data');
          if (existing) {
            return existing.id;
          }
        }
        
        // Count existing nodes of this type for naming
        const existingCount = get().nodes.filter(n => n.type === type).length;
        const nodeName = name || (existingCount > 0 
          ? `${defaultNames[type]} ${existingCount + 1}` 
          : defaultNames[type]);
        
        const newNode: SchematicNode = {
          id,
          type,
          name: nodeName,
          x,
          y,
          status: 'pending',
          lastUpdated: Date.now(),
        };
        
        set((state) => ({
          nodes: [...state.nodes, newNode],
        }));
        
        return id;
      },

      updateNode: (id, updates) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, ...updates, lastUpdated: Date.now() } : node
        ),
      })),

      removeNode: (id) => set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        connections: state.connections.filter(
          (conn) => conn.sourceId !== id && conn.targetId !== id
        ),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      })),

      moveNode: (id, x, y) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, x, y } : node
        ),
      })),

      selectNode: (id) => set({ selectedNodeId: id }),

      addConnection: (sourceId, targetId) => {
        const { canConnect, connections } = get();
        
        if (!canConnect(sourceId, targetId)) {
          return false;
        }
        
        // Check if connection already exists
        const exists = connections.some(
          (c) => c.sourceId === sourceId && c.targetId === targetId
        );
        if (exists) return false;
        
        const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        set((state) => ({
          connections: [
            ...state.connections,
            { id: connectionId, sourceId, targetId },
          ],
        }));
        
        return true;
      },

      removeConnection: (id) => set((state) => ({
        connections: state.connections.filter((conn) => conn.id !== id),
      })),

      canConnect: (sourceId, targetId) => {
        const { nodes } = get();
        const sourceNode = nodes.find((n) => n.id === sourceId);
        const targetNode = nodes.find((n) => n.id === targetId);
        
        if (!sourceNode || !targetNode) return false;
        if (sourceId === targetId) return false;
        
        // Check if this is a valid connection type
        const validTargets = VALID_CONNECTIONS[sourceNode.type];
        return validTargets.includes(targetNode.type);
      },

      markNodeComplete: (id) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id 
              ? { ...node, status: 'complete', lastUpdated: Date.now() } 
              : node
          ),
        }));
      },

      markNodeOutdated: (id) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, status: 'outdated' } : node
          ),
        }));
      },

      propagateUpdate: (nodeId) => {
        // When a node is updated, mark all downstream nodes as outdated
        const { connections, nodes, markNodeOutdated, propagateUpdate } = get();
        
        const downstreamConnections = connections.filter((c) => c.sourceId === nodeId);
        
        for (const conn of downstreamConnections) {
          const targetNode = nodes.find((n) => n.id === conn.targetId);
          if (targetNode && targetNode.status === 'complete') {
            markNodeOutdated(conn.targetId);
            // Recursively propagate to downstream nodes
            propagateUpdate(conn.targetId);
          }
        }
      },

      startDrag: (type) => set({ draggingNodeType: type }),

      updateDragPosition: (x, y) => set({ dragPosition: { x, y } }),

      endDrag: () => set({ draggingNodeType: null, dragPosition: null }),

      getNodesByType: (type) => {
        return get().nodes.filter((n) => n.type === type);
      },

      getConnectedNodes: (nodeId, direction) => {
        const { connections, nodes } = get();
        
        if (direction === 'upstream') {
          const upstreamIds = connections
            .filter((c) => c.targetId === nodeId)
            .map((c) => c.sourceId);
          return nodes.filter((n) => upstreamIds.includes(n.id));
        } else {
          const downstreamIds = connections
            .filter((c) => c.sourceId === nodeId)
            .map((c) => c.targetId);
          return nodes.filter((n) => downstreamIds.includes(n.id));
        }
      },

      getNodeStatus: (id) => {
        const node = get().nodes.find((n) => n.id === id);
        return node?.status || 'pending';
      },

      resetSchematic: () => set({
        nodes: [],
        connections: [],
        selectedNodeId: null,
        draggingNodeType: null,
        dragPosition: null,
      }),

      setLastSaved: (timestamp) => set({ lastSaved: timestamp }),
    }),
    {
      name: 'feai-schematic-storage',
      partialize: (state) => ({
        // Persist per-project data
        nodes: state.nodes,
        connections: state.connections,
        projectName: state.projectName,
      }),
    }
  )
);
