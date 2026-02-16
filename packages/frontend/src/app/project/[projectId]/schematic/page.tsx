'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Database, 
  Box, 
  Grid3X3, 
  Settings, 
  BarChart3, 
  Check, 
  Circle, 
  Loader2,
  AlertTriangle,
  Pencil,
  X,
  GripVertical
} from 'lucide-react';
import { useSchematicStore, NodeType, SchematicNode, Connection } from '@/store/schematicStore';
import { useProjectStore } from '@/store/projectStore';
import { useWorkflowStore } from '@/store/workflowStore';

// Node dimensions
const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;
const CONNECTION_SPACING = 200; // Horizontal spacing between connected nodes
const SNAP_DISTANCE = 60; // Distance threshold for auto-connection

// Consistent navy blue color for all nodes
const NODE_COLOR = '#1e3a5f';

// Node type configurations
const NODE_CONFIGS: Record<NodeType, {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  order: number; // For determining connection direction
}> = {
  'engineering-data': {
    name: 'Engineering Data',
    icon: Database,
    route: 'engineering-data',
    order: 0,
  },
  'geometry': {
    name: 'Geometry',
    icon: Box,
    route: 'geometry',
    order: 1,
  },
  'mesh': {
    name: 'Mesh',
    icon: Grid3X3,
    route: 'mesh',
    order: 2,
  },
  'setup': {
    name: 'Setup',
    icon: Settings,
    route: 'setup',
    order: 3,
  },
  'results': {
    name: 'Results',
    icon: BarChart3,
    route: 'results',
    order: 4,
  },
};

// Valid connections mapping
const VALID_CONNECTIONS: Record<NodeType, NodeType[]> = {
  'engineering-data': ['geometry'],
  'geometry': ['mesh'],
  'mesh': ['setup'],
  'setup': ['results'],
  'results': [],
};

// Toolbox item component
function ToolboxItem({ 
  type, 
  onDragStart 
}: { 
  type: NodeType; 
  onDragStart: (type: NodeType, e: React.DragEvent) => void;
}) {
  const config = NODE_CONFIGS[type];
  const Icon = config.icon;
  
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('nodeType', type);
        e.dataTransfer.setData('isNew', 'true');
        onDragStart(type, e);
      }}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 cursor-grab hover:border-gray-400 hover:shadow-sm transition-all select-none active:cursor-grabbing"
      style={{ borderLeftColor: NODE_COLOR, borderLeftWidth: 4 }}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <div style={{ color: NODE_COLOR }}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm text-gray-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{config.name}</span>
    </div>
  );
}

// Status indicator component
function StatusIndicator({ status }: { status: SchematicNode['status'] }) {
  switch (status) {
    case 'complete':
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      );
    case 'in-progress':
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        </div>
      );
    case 'outdated':
      return (
        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <Circle className="w-2 h-2 text-gray-300" />
        </div>
      );
  }
}

// Schematic node component
function SchematicNodeComponent({
  node,
  isSelected,
  onSelect,
  onDelete,
  onOpenWorkspace,
  onDragStart,
  connections,
}: {
  node: SchematicNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onOpenWorkspace: () => void;
  onDragStart: (nodeId: string, e: React.DragEvent) => void;
  connections: Connection[];
}) {
  const config = NODE_CONFIGS[node.type];
  const Icon = config.icon;
  
  // Get connected upstream nodes for this node
  const upstreamConnections = connections.filter(c => c.targetId === node.id);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('nodeId', node.id);
        e.dataTransfer.setData('isNew', 'false');
        onDragStart(node.id, e);
      }}
      className={`
        absolute bg-white border-2 shadow-md transition-shadow cursor-move select-none
        ${isSelected ? 'border-blue-500 shadow-lg z-10' : 'border-gray-300 hover:border-gray-400'}
      `}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenWorkspace();
      }}
    >
      {/* Header - drag handle area */}
      <div 
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: NODE_COLOR }}
      >
        <GripVertical className="w-3 h-3 text-white/70" />
        <Icon className="w-4 h-4 text-white" />
        <span className="text-xs font-medium text-white truncate flex-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {node.name}
        </span>
        <StatusIndicator status={node.status} />
      </div>
      
      {/* Rows - similar to ANSYS */}
      <div className="divide-y divide-gray-200">
        {node.type === 'engineering-data' && (
          <NodeRow 
            number={1} 
            label="Engineering Data" 
            status={node.status} 
            onClick={onOpenWorkspace}
          />
        )}
        {node.type === 'geometry' && (
          <NodeRow 
            number={1} 
            label="Geometry" 
            status={node.status} 
            onClick={onOpenWorkspace}
          />
        )}
        {node.type === 'mesh' && (
          <NodeRow 
            number={1} 
            label="Mesh" 
            status={node.status} 
            onClick={onOpenWorkspace}
          />
        )}
        {node.type === 'setup' && (
          <>
            <NodeRow number={1} label="Engineering Data" status={upstreamConnections.length > 0 ? 'linked' : 'pending'} />
            <NodeRow number={2} label="Geometry" status={upstreamConnections.length > 0 ? 'linked' : 'pending'} />
            <NodeRow number={3} label="Model" status={node.status} onClick={onOpenWorkspace} />
            <NodeRow number={4} label="Setup" status={node.status} onClick={onOpenWorkspace} />
            <NodeRow number={5} label="Solution" status={node.status} />
          </>
        )}
        {node.type === 'results' && (
          <NodeRow 
            number={1} 
            label="Results" 
            status={node.status} 
            onClick={onOpenWorkspace}
          />
        )}
      </div>
      
      {/* Delete button when selected */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-20"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}

// Node row component (individual step within a node)
function NodeRow({ 
  number, 
  label, 
  status,
  onClick 
}: { 
  number: number; 
  label: string; 
  status: 'pending' | 'in-progress' | 'complete' | 'outdated' | 'linked';
  onClick?: () => void;
}) {
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <Check className="w-3 h-3 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'outdated':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'linked':
        return <Check className="w-3 h-3 text-green-500" />;
      default:
        return <span className="w-3 h-3 text-gray-400 text-xs">?</span>;
    }
  };
  
  return (
    <div 
      className={`px-3 py-1.5 flex items-center gap-2 text-xs ${onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <span className="w-4 h-4 flex items-center justify-center bg-gray-100 text-gray-600 text-[10px] font-medium">
        {number}
      </span>
      <span className="flex-1 text-gray-700">{label}</span>
      {getStatusIcon()}
    </div>
  );
}

// Connection line SVG component
function ConnectionLines({ 
  connections, 
  nodes 
}: { 
  connections: Connection[]; 
  nodes: SchematicNode[];
}) {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1 }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={NODE_COLOR} />
        </marker>
      </defs>
      {connections.map((conn) => {
        const sourceNode = nodes.find(n => n.id === conn.sourceId);
        const targetNode = nodes.find(n => n.id === conn.targetId);
        
        if (!sourceNode || !targetNode) return null;
        
        // Calculate node heights based on type
        const getNodeHeight = (node: SchematicNode) => {
          if (node.type === 'setup') return 130; // 5 rows
          return NODE_HEIGHT; // 1 row
        };
        
        const sourceHeight = getNodeHeight(sourceNode);
        const targetHeight = getNodeHeight(targetNode);
        
        // Calculate connection points (right side of source, left side of target)
        const sourceX = sourceNode.x + NODE_WIDTH;
        const sourceY = sourceNode.y + sourceHeight / 2;
        const targetX = targetNode.x;
        const targetY = targetNode.y + targetHeight / 2;
        
        // Determine if horizontal or need curve
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        
        let path: string;
        
        if (Math.abs(dy) < 20 && dx > 0) {
          // Nearly horizontal - straight line with small curve
          path = `M ${sourceX} ${sourceY} L ${targetX - 8} ${targetY}`;
        } else {
          // Create a smooth bezier curve
          const midX = sourceX + dx / 2;
          path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX - 8} ${targetY}`;
        }
        
        return (
          <g key={conn.id}>
            {/* Shadow line for better visibility */}
            <path
              d={path}
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
            {/* Main connection line */}
            <path
              d={path}
              stroke={NODE_COLOR}
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}
    </svg>
  );
}

// Drop preview indicator
function DropPreview({ 
  x, 
  y, 
  type,
  willConnect 
}: { 
  x: number; 
  y: number; 
  type: NodeType;
  willConnect: boolean;
}) {
  const config = NODE_CONFIGS[type];
  const Icon = config.icon;
  
  return (
    <div
      className={`absolute pointer-events-none opacity-60 bg-white border-2 border-dashed shadow-md ${willConnect ? 'border-green-500' : 'border-gray-400'}`}
      style={{
        left: x,
        top: y,
        width: NODE_WIDTH,
      }}
    >
      <div 
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: NODE_COLOR, opacity: 0.7 }}
      >
        <Icon className="w-4 h-4 text-white" />
        <span className="text-xs font-medium text-white truncate flex-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {config.name}
        </span>
      </div>
      <div className="px-3 py-2 text-xs text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {willConnect ? 'Will connect' : 'Drop here'}
      </div>
    </div>
  );
}

export default function SchematicPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const projectId = params.projectId as string;
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dragPreview, setDragPreview] = useState<{
    x: number;
    y: number;
    type: NodeType;
    willConnect: boolean;
    nearNode: SchematicNode | null;
  } | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  
  const { 
    setProject,
    projectName,
    setProjectName,
    nodes,
    connections,
    selectedNodeId,
    selectNode,
    addNode,
    removeNode,
    moveNode,
    addConnection,
    canConnect,
    startDrag,
    endDrag,
    setLastSaved,
    updateNode,
  } = useSchematicStore();
  
  const { fetchProject, updateProject } = useProjectStore();
  const stepStatus = useWorkflowStore((s) => s.stepStatus);
  const geometryReady = useWorkflowStore((s) => s.geometryReady);
  const meshData = useWorkflowStore((s) => s.meshData);

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      setProject(projectId);
      fetchProject(projectId).then((project) => {
        if (project) {
          setProjectName(project.name);
          setEditedName(project.name);
        }
        setIsLoading(false);
      });
    }
  }, [projectId, setProject, fetchProject, setProjectName]);

  // Sync schematic node checkmarks from workflow state (geometry ready, mesh complete, etc.)
  useEffect(() => {
    nodes.forEach((node) => {
      const workflowComplete =
        (node.type === 'geometry' && geometryReady) ||
        (node.type === 'mesh' && !!meshData) ||
        (node.type !== 'geometry' && node.type !== 'mesh' && stepStatus[node.type] === 'complete');
      if (workflowComplete && node.status !== 'complete') {
        updateNode(node.id, { status: 'complete' });
      }
    });
  }, [nodes, stepStatus, geometryReady, meshData, updateNode]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Auto-save schematic state
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setLastSaved(Date.now());
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [setLastSaved]);

  // Find nearest node that can connect to the given type
  const findNearestConnectableNode = useCallback((x: number, y: number, type: NodeType, excludeNodeId?: string) => {
    let nearestNode: SchematicNode | null = null;
    let nearestDistance = Infinity;
    
    for (const node of nodes) {
      if (excludeNodeId && node.id === excludeNodeId) continue;
      
      // Check if connection is valid (either direction)
      const canConnectTo = VALID_CONNECTIONS[node.type]?.includes(type);
      const canConnectFrom = VALID_CONNECTIONS[type]?.includes(node.type);
      
      if (!canConnectTo && !canConnectFrom) continue;
      
      // Calculate distance to node center
      const nodeHeight = node.type === 'setup' ? 130 : NODE_HEIGHT;
      const nodeCenterX = node.x + NODE_WIDTH / 2;
      const nodeCenterY = node.y + nodeHeight / 2;
      const distance = Math.sqrt(Math.pow(x - nodeCenterX, 2) + Math.pow(y - nodeCenterY, 2));
      
      if (distance < nearestDistance && distance < SNAP_DISTANCE + NODE_WIDTH) {
        nearestDistance = distance;
        nearestNode = node;
      }
    }
    
    return nearestNode;
  }, [nodes]);

  // Calculate position for connected node
  const calculateConnectedPosition = useCallback((
    nearNode: SchematicNode, 
    newType: NodeType
  ): { x: number; y: number } => {
    const nearConfig = NODE_CONFIGS[nearNode.type];
    const newConfig = NODE_CONFIGS[newType];
    const nodeHeight = nearNode.type === 'setup' ? 130 : NODE_HEIGHT;
    
    // Determine if new node should be to the right or left based on workflow order
    if (newConfig.order > nearConfig.order) {
      // New node comes after - place to the right
      return {
        x: nearNode.x + NODE_WIDTH + CONNECTION_SPACING - NODE_WIDTH,
        y: nearNode.y + (nodeHeight / 2) - (NODE_HEIGHT / 2),
      };
    } else {
      // New node comes before - place to the left
      return {
        x: nearNode.x - CONNECTION_SPACING,
        y: nearNode.y + (nodeHeight / 2) - (NODE_HEIGHT / 2),
      };
    }
  }, []);

  // Handle drag over canvas
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - NODE_WIDTH / 2;
    const y = e.clientY - rect.top - NODE_HEIGHT / 2;
    
    const isNew = e.dataTransfer.types.includes('nodetype');
    const nodeType = isNew 
      ? (e.dataTransfer.getData('nodeType') || 'geometry') as NodeType
      : draggingNodeId 
        ? nodes.find(n => n.id === draggingNodeId)?.type || 'geometry'
        : 'geometry';
    
    const nearNode = findNearestConnectableNode(
      e.clientX - rect.left, 
      e.clientY - rect.top, 
      nodeType,
      draggingNodeId || undefined
    );
    
    if (nearNode) {
      const connectedPos = calculateConnectedPosition(nearNode, nodeType);
      setDragPreview({
        x: connectedPos.x,
        y: connectedPos.y,
        type: nodeType,
        willConnect: true,
        nearNode,
      });
    } else {
      setDragPreview({
        x: Math.max(0, x),
        y: Math.max(0, y),
        type: nodeType,
        willConnect: false,
        nearNode: null,
      });
    }
  }, [canvasRef, draggingNodeId, nodes, findNearestConnectableNode, calculateConnectedPosition]);

  // Handle drop on canvas
  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const isNew = e.dataTransfer.getData('isNew') === 'true';
    const nodeType = e.dataTransfer.getData('nodeType') as NodeType;
    const existingNodeId = e.dataTransfer.getData('nodeId');
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    if (isNew && nodeType) {
      // Creating new node
      let x = e.clientX - rect.left - NODE_WIDTH / 2;
      let y = e.clientY - rect.top - NODE_HEIGHT / 2;
      
      // Check for nearby node to connect to
      const nearNode = findNearestConnectableNode(
        e.clientX - rect.left, 
        e.clientY - rect.top, 
        nodeType
      );
      
      if (nearNode) {
        const connectedPos = calculateConnectedPosition(nearNode, nodeType);
        x = connectedPos.x;
        y = connectedPos.y;
      }
      
      const newNodeId = addNode(nodeType, Math.max(0, x), Math.max(0, y));
      
      // Auto-connect if dropped near a valid node
      if (nearNode && newNodeId) {
        const nearConfig = NODE_CONFIGS[nearNode.type];
        const newConfig = NODE_CONFIGS[nodeType];
        
        if (newConfig.order > nearConfig.order) {
          // New node is downstream
          addConnection(nearNode.id, newNodeId);
        } else {
          // New node is upstream
          addConnection(newNodeId, nearNode.id);
        }
      }
    } else if (existingNodeId) {
      // Moving existing node
      let x = e.clientX - rect.left - NODE_WIDTH / 2;
      let y = e.clientY - rect.top - NODE_HEIGHT / 2;
      
      const movingNode = nodes.find(n => n.id === existingNodeId);
      if (!movingNode) return;
      
      // Check for nearby node to connect to
      const nearNode = findNearestConnectableNode(
        e.clientX - rect.left, 
        e.clientY - rect.top, 
        movingNode.type,
        existingNodeId
      );
      
      if (nearNode) {
        const connectedPos = calculateConnectedPosition(nearNode, movingNode.type);
        x = connectedPos.x;
        y = connectedPos.y;
        
        // Check if already connected
        const alreadyConnected = connections.some(
          c => (c.sourceId === nearNode.id && c.targetId === existingNodeId) ||
               (c.sourceId === existingNodeId && c.targetId === nearNode.id)
        );
        
        if (!alreadyConnected) {
          const nearConfig = NODE_CONFIGS[nearNode.type];
          const movingConfig = NODE_CONFIGS[movingNode.type];
          
          if (movingConfig.order > nearConfig.order) {
            addConnection(nearNode.id, existingNodeId);
          } else {
            addConnection(existingNodeId, nearNode.id);
          }
        }
      }
      
      moveNode(existingNodeId, Math.max(0, x), Math.max(0, y));
    }
    
    setDragPreview(null);
    setDraggingNodeId(null);
    endDrag();
  }, [addNode, moveNode, addConnection, findNearestConnectableNode, calculateConnectedPosition, nodes, connections, endDrag]);

  const handleCanvasDragLeave = useCallback(() => {
    setDragPreview(null);
  }, []);

  const handleCanvasClick = () => {
    selectNode(null);
  };

  const handleOpenWorkspace = (node: SchematicNode) => {
    const config = NODE_CONFIGS[node.type];
    window.open(`/project/${projectId}/${config.route}`, '_blank');
  };

  const handleNodeDragStart = (nodeId: string, e: React.DragEvent) => {
    setDraggingNodeId(nodeId);
    // Create a ghost image
    const ghost = document.createElement('div');
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleToolboxDragStart = (type: NodeType, e: React.DragEvent) => {
    startDrag(type);
    // Create a ghost image
    const ghost = document.createElement('div');
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleSaveProjectName = async () => {
    if (editedName.trim() && editedName !== projectName) {
      await updateProject(projectId, { name: editedName.trim() });
      setProjectName(editedName.trim());
    }
    setIsEditingName(false);
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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <nav className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
              <span className="text-white font-serif font-bold text-sm">F</span>
            </div>
          </Link>
          
          <div className="w-px h-6 bg-gray-300" />
          
          {/* Editable Project Name */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveProjectName();
                    if (e.key === 'Escape') {
                      setEditedName(projectName);
                      setIsEditingName(false);
                    }
                  }}
                  className="px-2 py-1 border border-blue-500 text-lg font-serif focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveProjectName}
                  className="p-1 text-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditedName(projectName);
                    setIsEditingName(false);
                  }}
                  className="p-1 text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="font-serif text-lg text-gray-800">
                  {projectName}
                </h1>
                <button
                  onClick={() => {
                    setEditedName(projectName);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-opacity"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
            <span className="text-xs text-gray-500 font-sans">Project Schematic</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 font-sans">
          {session?.user?.name || session?.user?.email}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbox */}
        <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Toolbox</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Analysis Systems
            </div>
            {(Object.keys(NODE_CONFIGS) as NodeType[]).map((type) => (
              <ToolboxItem
                key={type}
                type={type}
                onDragStart={handleToolboxDragStart}
              />
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
            <p>• Drag items to the schematic</p>
            <p>• Drop near another block to connect</p>
            <p>• Drag blocks to reposition</p>
            <p>• Double-click to open workspace</p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-2 bg-white border-b border-gray-300">
            <h2 className="text-sm font-semibold text-gray-700">Project Schematic</h2>
          </div>
          
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-auto bg-gray-50"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onClick={handleCanvasClick}
          >
            {/* Connection lines */}
            <ConnectionLines connections={connections} nodes={nodes} />
            
            {/* Nodes */}
            {nodes.map((node) => (
              <SchematicNodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={() => selectNode(node.id)}
                onDelete={() => removeNode(node.id)}
                onOpenWorkspace={() => handleOpenWorkspace(node)}
                onDragStart={handleNodeDragStart}
                connections={connections}
              />
            ))}
            
            {/* Drop preview */}
            {dragPreview && (
              <DropPreview 
                x={dragPreview.x} 
                y={dragPreview.y} 
                type={dragPreview.type}
                willConnect={dragPreview.willConnect}
              />
            )}
            
            {/* Empty state */}
            {nodes.length === 0 && !dragPreview && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-sans">Drag components from the toolbox</p>
                  <p className="text-sm font-sans mt-1">to build your analysis workflow</p>
                  <p className="text-sm font-sans mt-4 text-gray-500">
                    Drop near another block to automatically connect them
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
