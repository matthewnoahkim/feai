/**
 * API Documentation Page
 * Complete reference for all API endpoints
 * Dark-first modern developer tool theme
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'
import { Book, ChevronDown, ChevronRight, Copy, Check, ArrowLeft } from 'lucide-react'

interface Endpoint {
  method: string
  path: string
  description: string
  auth: boolean
  requestBody?: any
  queryParams?: { name: string; type: string; description: string; required?: boolean }[]
  responseExample?: any
}

interface ApiSection {
  title: string
  description: string
  endpoints: Endpoint[]
}

export function ApiDocsPage() {
  const navigate = useNavigate()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const copyToClipboard = (text: string, endpointId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpointId)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const apiSections: ApiSection[] = [
    {
      title: 'Health & Info',
      description: 'Server health and API information endpoints',
      endpoints: [
        {
          method: 'GET',
          path: '/api/health',
          description: 'Health check endpoint to verify server status and get version information',
          auth: false,
          responseExample: {
            success: true,
            data: {
              status: 'healthy',
              version: '1.0.0',
              timestamp: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        {
          method: 'GET',
          path: '/api',
          description: 'API information and quick reference',
          auth: false,
          responseExample: {
            success: true,
            data: {
              name: 'feai API',
              version: '1.0.0',
              description: 'RESTful API for web-based CAD operations'
            }
          }
        }
      ]
    },
    {
      title: 'Authentication',
      description: 'Google OAuth 2.0 authentication endpoints with JWT tokens',
      endpoints: [
        {
          method: 'GET',
          path: '/auth/google',
          description: 'Initiate Google OAuth flow. Redirects to Google consent screen.',
          auth: false,
          responseExample: 'Redirects to Google OAuth consent page'
        },
        {
          method: 'GET',
          path: '/auth/google/callback',
          description: 'OAuth callback handler. Exchanges authorization code for tokens and creates user session.',
          auth: false,
          queryParams: [
            { name: 'code', type: 'string', description: 'Authorization code from Google', required: true },
            { name: 'state', type: 'string', description: 'CSRF protection state token', required: true }
          ],
          responseExample: 'Redirects to /auth/callback with token and user info in query params'
        },
        {
          method: 'GET',
          path: '/auth/me',
          description: 'Get current authenticated user profile',
          auth: true,
          responseExample: {
            success: true,
            user: {
              userId: 'user_123',
              googleId: 'google_456',
              email: 'user@example.com',
              name: 'John Doe',
              picture: 'https://...',
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        {
          method: 'POST',
          path: '/auth/logout',
          description: 'Sign out current user. Revokes tokens and destroys session.',
          auth: true,
          responseExample: {
            success: true,
            message: 'Signed out successfully'
          }
        },
        {
          method: 'POST',
          path: '/auth/refresh',
          description: 'Manually refresh access token (usually done automatically)',
          auth: true,
          responseExample: {
            success: true,
            message: 'Token refreshed successfully'
          }
        }
      ]
    },
    {
      title: 'Projects',
      description: 'Manage user CAD projects (requires authentication)',
      endpoints: [
        {
          method: 'GET',
          path: '/api/projects',
          description: 'List all projects for the authenticated user',
          auth: true,
          responseExample: [
            {
              id: 'proj_123',
              name: 'My Project',
              description: 'Project description',
              thumbnail: 'data:image/png;base64,...',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z'
            }
          ]
        },
        {
          method: 'GET',
          path: '/api/projects/:id',
          description: 'Get a specific project by ID',
          auth: true,
          responseExample: {
            id: 'proj_123',
            name: 'My Project',
            description: 'Project description',
            data: { /* CAD project data */ },
            thumbnail: 'data:image/png;base64,...',
            userId: 'user_123',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/projects',
          description: 'Create a new project',
          auth: true,
          requestBody: {
            name: 'New Project',
            description: 'Optional project description'
          },
          responseExample: {
            id: 'proj_123',
            name: 'New Project',
            description: 'Optional project description',
            userId: 'user_123',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'PATCH',
          path: '/api/projects/:id',
          description: 'Update project metadata (name, description, thumbnail)',
          auth: true,
          requestBody: {
            name: 'Updated name',
            description: 'Updated description',
            thumbnail: 'data:image/png;base64,...'
          },
          responseExample: {
            id: 'proj_123',
            name: 'Updated name',
            description: 'Updated description',
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'PUT',
          path: '/api/projects/:id/data',
          description: 'Save complete project CAD data',
          auth: true,
          requestBody: {
            data: { /* Complete CAD project state */ }
          },
          responseExample: {
            success: true,
            updatedAt: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'DELETE',
          path: '/api/projects/:id',
          description: 'Delete a project permanently',
          auth: true,
          responseExample: {
            success: true
          }
        }
      ]
    },
    {
      title: 'Documents',
      description: 'Manage CAD documents (in-memory store)',
      endpoints: [
        {
          method: 'GET',
          path: '/api/documents',
          description: 'List all documents in the in-memory store',
          auth: false,
          responseExample: {
            success: true,
            data: {
              documents: [
                {
                  id: 'doc_123',
                  name: 'Document 1',
                  description: 'Description',
                  created: '2024-01-01T00:00:00.000Z',
                  modified: '2024-01-15T10:30:00.000Z',
                  elementCount: 3
                }
              ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/documents/:id',
          description: 'Get a specific document with all elements',
          auth: false,
          responseExample: {
            success: true,
            data: {
              document: {
                id: 'doc_123',
                name: 'Document 1',
                elements: {
                  partStudios: [],
                  assemblies: [],
                  drawings: []
                }
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/documents',
          description: 'Create a new document',
          auth: false,
          requestBody: {
            name: 'New Document',
            description: 'Optional description'
          },
          responseExample: {
            success: true,
            data: {
              document: {
                id: 'doc_123',
                name: 'New Document',
                created: '2024-01-15T10:30:00.000Z'
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'PUT',
          path: '/api/documents/:id',
          description: 'Update document metadata',
          auth: false,
          requestBody: {
            name: 'Updated name',
            description: 'Updated description'
          },
          responseExample: {
            success: true,
            data: { document: { /* updated document */ } },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'DELETE',
          path: '/api/documents/:id',
          description: 'Delete a document',
          auth: false,
          responseExample: {
            success: true,
            data: { deleted: true },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Part Studios',
      description: 'Manage part studios within documents',
      endpoints: [
        {
          method: 'GET',
          path: '/api/documents/:id/partstudios',
          description: 'List all part studios in a document',
          auth: false,
          responseExample: {
            success: true,
            data: {
              partStudios: [
                { id: 'ps_123', name: 'Part Studio 1', features: [], parts: [] }
              ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/documents/:docId/partstudios/:psId',
          description: 'Get a specific part studio with features and parts',
          auth: false,
          responseExample: {
            success: true,
            data: {
              partStudio: {
                id: 'ps_123',
                name: 'Part Studio 1',
                features: [],
                parts: [],
                sketches: []
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/parts/:docId/:psId',
          description: 'Get parts from a part studio (alternative endpoint)',
          auth: false,
          responseExample: {
            success: true,
            data: {
              parts: [],
              features: []
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Features',
      description: 'Manage CAD features (extrude, revolve, fillet, etc.)',
      endpoints: [
        {
          method: 'GET',
          path: '/api/documents/:docId/partstudios/:psId/features',
          description: 'List all features in a part studio',
          auth: false,
          responseExample: {
            success: true,
            data: {
              features: [
                {
                  id: 'feat_123',
                  type: 'extrude',
                  name: 'Extrude 1',
                  parameters: {}
                }
              ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/documents/:docId/partstudios/:psId/features',
          description: 'Add a new feature to a part studio',
          auth: false,
          requestBody: {
            feature: {
              type: 'extrude',
              name: 'Extrude 1',
              parameters: {
                sketchId: 'sketch_123',
                distance: 10,
                direction: { x: 0, y: 0, z: 1 }
              }
            }
          },
          responseExample: {
            success: true,
            data: {
              feature: {
                id: 'feat_123',
                type: 'extrude',
                name: 'Extrude 1',
                parameters: {}
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'PUT',
          path: '/api/documents/:docId/partstudios/:psId/features/:fId',
          description: 'Update an existing feature',
          auth: false,
          requestBody: {
            name: 'Updated name',
            parameters: { distance: 20 }
          },
          responseExample: {
            success: true,
            data: { feature: { /* updated feature */ } },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'DELETE',
          path: '/api/documents/:docId/partstudios/:psId/features/:fId',
          description: 'Delete a feature',
          auth: false,
          responseExample: {
            success: true,
            data: { deleted: true },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Sketches',
      description: 'Manage 2D sketches for features',
      endpoints: [
        {
          method: 'POST',
          path: '/api/documents/:docId/partstudios/:psId/sketches',
          description: 'Create a new sketch on a plane',
          auth: false,
          requestBody: {
            name: 'Sketch 1',
            plane: {
              origin: { x: 0, y: 0, z: 0 },
              normal: { x: 0, y: 0, z: 1 },
              xAxis: { x: 1, y: 0, z: 0 }
            }
          },
          responseExample: {
            success: true,
            data: {
              sketch: {
                id: 'sketch_123',
                name: 'Sketch 1',
                plane: {},
                entities: [],
                constraints: []
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/documents/:docId/partstudios/:psId/sketches/:skId',
          description: 'Get a specific sketch with all entities and constraints',
          auth: false,
          responseExample: {
            success: true,
            data: {
              sketch: {
                id: 'sketch_123',
                entities: [],
                constraints: []
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/sketches/:docId/:psId/:skId',
          description: 'Get sketch (alternative endpoint)',
          auth: false,
          responseExample: {
            success: true,
            data: { sketch: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/documents/:docId/partstudios/:psId/sketches/:skId/entities',
          description: 'Add sketch entities (lines, circles, arcs)',
          auth: false,
          requestBody: {
            entities: [
              {
                type: 'line',
                start: { x: 0, y: 0 },
                end: { x: 10, y: 0 }
              }
            ]
          },
          responseExample: {
            success: true,
            data: { entities: [] },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/sketches/:docId/:psId/:skId/entities',
          description: 'Add single sketch entity (alternative endpoint)',
          auth: false,
          requestBody: {
            entity: {
              type: 'circle',
              center: { x: 0, y: 0 },
              radius: 5
            }
          },
          responseExample: {
            success: true,
            data: { entity: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/documents/:docId/partstudios/:psId/sketches/:skId/constraints',
          description: 'Add sketch constraints (coincident, parallel, etc.)',
          auth: false,
          requestBody: {
            constraints: [
              {
                type: 'coincident',
                entities: ['entity_1', 'entity_2']
              }
            ]
          },
          responseExample: {
            success: true,
            data: { constraints: [] },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/sketches/:docId/:psId/:skId/constraints',
          description: 'Add single sketch constraint (alternative endpoint)',
          auth: false,
          requestBody: {
            constraint: {
              type: 'horizontal',
              entity: 'entity_1'
            }
          },
          responseExample: {
            success: true,
            data: { constraint: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Assemblies',
      description: 'Manage assemblies of parts',
      endpoints: [
        {
          method: 'GET',
          path: '/api/assemblies/:docId/:asmId',
          description: 'Get assembly with instances and mates',
          auth: false,
          responseExample: {
            success: true,
            data: {
              assembly: {
                id: 'asm_123',
                name: 'Assembly 1',
                instances: [],
                mates: []
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/assemblies/:docId/:asmId/instances',
          description: 'Add part instance to assembly',
          auth: false,
          requestBody: {
            partId: 'part_123',
            transform: {
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 }
            }
          },
          responseExample: {
            success: true,
            data: { instance: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/assemblies/:docId/:asmId/mates',
          description: 'Add mate constraint between parts',
          auth: false,
          requestBody: {
            type: 'fastened',
            instances: ['inst_1', 'inst_2'],
            features: ['face_1', 'face_2']
          },
          responseExample: {
            success: true,
            data: { mate: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/assemblies/:docId/:asmId/interference',
          description: 'Check for interference between parts',
          auth: false,
          responseExample: {
            success: true,
            data: {
              hasInterference: false,
              interferences: []
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Drawings',
      description: 'Create engineering drawings',
      endpoints: [
        {
          method: 'GET',
          path: '/api/drawings/:docId/:dwgId',
          description: 'Get drawing with sheets and views',
          auth: false,
          responseExample: {
            success: true,
            data: {
              drawing: {
                id: 'dwg_123',
                name: 'Drawing 1',
                sheets: []
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/drawings/:docId/:dwgId/views',
          description: 'Add drawing view to sheet',
          auth: false,
          requestBody: {
            sheetIndex: 0,
            view: {
              type: 'front',
              partStudioId: 'ps_123',
              scale: 1.0
            }
          },
          responseExample: {
            success: true,
            data: { view: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/drawings/:docId/:dwgId/dimensions',
          description: 'Add dimension to drawing',
          auth: false,
          requestBody: {
            type: 'linear',
            entities: ['entity_1', 'entity_2']
          },
          responseExample: {
            success: true,
            data: { dimension: {} },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Export',
      description: 'Export parts and assemblies to various formats',
      endpoints: [
        {
          method: 'GET',
          path: '/api/export/:docId/:elementId',
          description: 'Export part or assembly to STEP, STL, OBJ, or JSON format',
          auth: false,
          queryParams: [
            {
              name: 'format',
              type: 'string',
              description: 'Export format: step, stp, stl, obj, json',
              required: true
            }
          ],
          responseExample: 'Returns file download with appropriate Content-Type and Content-Disposition headers'
        }
      ]
    },
    {
      title: 'Import',
      description: 'Import CAD files into documents',
      endpoints: [
        {
          method: 'POST',
          path: '/api/import/:docId',
          description: 'Import STEP, STL, OBJ, or DXF file into document',
          auth: false,
          requestBody: {
            format: 'step',
            content: 'file content as string',
            filename: 'model.step'
          },
          responseExample: {
            success: true,
            data: {
              imported: true,
              filename: 'model.step',
              format: 'step',
              featuresCreated: 5
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'Analysis',
      description: 'Engineering analysis tools',
      endpoints: [
        {
          method: 'GET',
          path: '/api/analysis/:docId/:elementId/mass-properties',
          description: 'Calculate mass properties (volume, surface area, center of mass, inertia)',
          auth: false,
          responseExample: {
            success: true,
            data: {
              massProperties: {
                volume: 27000,
                surfaceArea: 5400,
                mass: 0.212,
                density: 7850,
                centerOfMass: { x: 0, y: 0, z: 15 },
                momentOfInertia: {
                  ixx: 1125000,
                  iyy: 1125000,
                  izz: 1125000
                },
                boundingBox: {
                  min: { x: -15, y: -15, z: 0 },
                  max: { x: 15, y: 15, z: 30 }
                }
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/analysis/:docId/:elementId/interference',
          description: 'Check for interference in assemblies',
          auth: false,
          responseExample: {
            success: true,
            data: {
              hasInterference: false,
              interferences: []
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/analysis/:docId/:elementId/draft',
          description: 'Perform draft analysis for manufacturing',
          auth: false,
          queryParams: [
            {
              name: 'pullDirection',
              type: 'string',
              description: 'JSON string of pull direction vector {x, y, z}'
            }
          ],
          responseExample: {
            success: true,
            data: {
              draftAnalysis: {
                pullDirection: { x: 0, y: 0, z: 1 },
                requiredDraftAngle: 1,
                faces: [],
                summary: {
                  totalFaces: 6,
                  positiveDraftFaces: 4,
                  negativeDraftFaces: 0
                }
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/analysis/:docId/:elementId/measure',
          description: 'Measure distance between entities',
          auth: false,
          requestBody: {
            from: { type: 'point', coordinates: { x: 0, y: 0, z: 0 } },
            to: { type: 'point', coordinates: { x: 30, y: 0, z: 0 } },
            measureType: 'pointToPoint'
          },
          responseExample: {
            success: true,
            data: {
              measurement: {
                type: 'pointToPoint',
                distance: 30,
                units: 'mm'
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    },
    {
      title: 'FEA (Finite Element Analysis)',
      description: 'Run structural simulations',
      endpoints: [
        {
          method: 'POST',
          path: '/api/fea/mesh',
          description: 'Generate finite element mesh from geometry',
          auth: false,
          requestBody: {
            partStudioId: 'ps_123',
            settings: {
              globalSize: 5,
              elementType: 'C3D4',
              parts: [] // Array of parts with mesh data
            }
          },
          responseExample: {
            success: true,
            data: {
              mesh: {
                nodes: [],
                elements: [],
                nodeSets: [],
                elementSets: [],
                nodeCount: 1234,
                elementCount: 5678,
                quality: {
                  minAspectRatio: 1.0,
                  maxAspectRatio: 2.0,
                  avgAspectRatio: 1.5
                }
              },
              statistics: {
                nodeCount: 1234,
                elementCount: 5678,
                generationTime: 0.5
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/fea/run',
          description: 'Run FEA simulation (async job)',
          auth: false,
          requestBody: {
            setup: {
              name: 'Static Analysis',
              mesh: { /* mesh data from /api/fea/mesh */ },
              materials: [],
              boundaryConditions: [],
              loads: []
            },
            partStudioId: 'ps_123'
          },
          responseExample: {
            success: true,
            data: {
              jobId: 'fea-1234567890-abc',
              status: 'queued',
              message: 'Simulation job created'
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/fea/status/:jobId',
          description: 'Get simulation job status and results',
          auth: false,
          responseExample: {
            success: true,
            data: {
              jobId: 'fea-1234567890-abc',
              status: 'completed',
              progress: 100,
              message: 'Simulation completed successfully',
              results: {
                simulationId: 'sim_123',
                analysisType: 'static',
                solveTime: 2.5,
                staticResults: {
                  displacements: {},
                  vonMisesStress: {},
                  summary: {
                    maxDisplacement: {},
                    maxVonMisesStress: {}
                  }
                }
              }
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'POST',
          path: '/api/fea/cancel/:jobId',
          description: 'Cancel running simulation',
          auth: false,
          responseExample: {
            success: true,
            data: { status: 'cancelled' },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        },
        {
          method: 'GET',
          path: '/api/fea/materials',
          description: 'Get material library for FEA',
          auth: false,
          responseExample: {
            success: true,
            data: {
              materials: [
                {
                  id: 'steel-1018',
                  name: 'Steel 1018 (Mild Steel)',
                  category: 'metal',
                  properties: {
                    youngsModulus: 205e9,
                    poissonsRatio: 0.29,
                    density: 7870,
                    yieldStrength: 370e6
                  }
                }
              ]
            },
            timestamp: '2024-01-15T10:30:00.000Z'
          }
        }
      ]
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--public-bg)' }}>
        {/* Navigation */}
        <nav 
          className="flex items-center justify-between px-8 py-6"
          style={{ 
            borderBottom: '1px solid var(--public-border)',
            background: 'var(--public-bg)'
          }}
        >
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity var(--public-transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: 'var(--public-accent)' }}
            >
              <span style={{ color: 'var(--public-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--public-text-primary)' }}>FeAI</span>
          </button>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: 'var(--public-text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--public-transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-secondary)'}
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </div>
        </nav>

      {/* Main Content */}
      <main className="flex-1 px-8 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Book size={32} style={{ color: 'var(--public-accent)' }} />
              <h1 
                style={{ 
                  fontSize: '2.25rem', 
                  fontWeight: 700, 
                  color: 'var(--public-text-primary)',
                  letterSpacing: '-0.01em'
                }}
              >
                API Documentation
              </h1>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--public-text-secondary)', marginBottom: '1.5rem' }}>
              Complete reference for the FeAI REST API. All endpoints return JSON unless otherwise specified.
            </p>
            
            {/* Base URL */}
            <div 
              className="p-4 font-mono text-sm"
              style={{ 
                background: 'var(--public-surface)',
                border: '1px solid var(--public-border)',
                borderRadius: 'var(--public-radius-md)'
              }}
            >
              <div style={{ color: 'var(--public-text-secondary)', marginBottom: '0.25rem' }}>Base URL:</div>
              <div className="flex items-center justify-between" style={{ color: 'var(--public-text-primary)' }}>
                <span>{window.location.origin}</span>
                <button
                  onClick={() => copyToClipboard(window.location.origin, 'base-url')}
                  className="p-1 rounded"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background var(--public-transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-bg-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {copiedEndpoint === 'base-url' ? (
                    <Check size={16} style={{ color: '#22c55e' }} />
                  ) : (
                    <Copy size={16} style={{ color: 'var(--public-text-secondary)' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Authentication Note */}
            <div 
              className="mt-4 p-4"
              style={{ 
                border: '1px solid var(--public-border)',
                borderRadius: 'var(--public-radius-md)',
                background: 'var(--public-surface)'
              }}
            >
              <div className="font-sans text-sm" style={{ color: 'var(--public-text-primary)' }}>
                <strong>🔐 Authentication:</strong> Endpoints marked with 🔒 require authentication. 
                Include the JWT token in the Authorization header: <code 
                  style={{ 
                    background: 'var(--public-bg-elevated)',
                    border: '1px solid var(--public-border)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--public-radius-sm)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--public-font-mono)'
                  }}
                >
                  Authorization: Bearer YOUR_TOKEN
                </code>
              </div>
            </div>
          </div>

          {/* API Sections */}
          {apiSections.map((section, sectionIdx) => (
            <div 
              key={sectionIdx} 
              className="mb-8"
              style={{ 
                border: '1px solid var(--public-border)',
                borderRadius: 'var(--public-radius-md)',
                overflow: 'hidden'
              }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-6 py-4 transition-colors"
                style={{
                  background: 'var(--public-surface)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--public-transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-bg-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--public-surface)'}
              >
                <div className="text-left">
                  <h2 
                    style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 600, 
                      color: 'var(--public-text-primary)', 
                      marginBottom: '0.25rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {section.title}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--public-text-secondary)' }}>
                    {section.description}
                  </p>
                </div>
                {expandedSections[section.title] ? (
                  <ChevronDown size={24} style={{ color: 'var(--public-text-primary)' }} />
                ) : (
                  <ChevronRight size={24} style={{ color: 'var(--public-text-primary)' }} />
                )}
              </button>

              {/* Endpoints */}
              {expandedSections[section.title] && (
                <div style={{ borderTop: '1px solid var(--public-border)' }}>
                  {section.endpoints.map((endpoint, endpointIdx) => {
                    const endpointId = `${section.title}-${endpointIdx}`
                    const fullUrl = `${window.location.origin}${endpoint.path}`

                    return (
                      <div 
                        key={endpointIdx} 
                        className="p-6"
                        style={{ 
                          borderTop: endpointIdx > 0 ? '1px solid var(--public-border)' : 'none',
                          background: 'var(--public-bg)'
                        }}
                      >
                        {/* Method and Path */}
                        <div className="flex items-start gap-3 mb-3">
                          <span 
                            className="px-3 py-1 text-xs font-mono font-semibold"
                            style={{
                              borderRadius: 'var(--public-radius-sm)',
                              ...(endpoint.method === 'GET' ? { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' } :
                                  endpoint.method === 'POST' ? { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' } :
                                  endpoint.method === 'PUT' ? { background: 'rgba(234, 179, 8, 0.2)', color: '#facc15' } :
                                  endpoint.method === 'PATCH' ? { background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' } :
                                  endpoint.method === 'DELETE' ? { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } :
                                  { background: 'var(--public-surface)', color: 'var(--public-text-secondary)' })
                            }}
                          >
                            {endpoint.method}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <code 
                                className="font-mono text-sm px-3 py-1 flex-1"
                                style={{ 
                                  color: 'var(--public-text-primary)',
                                  background: 'var(--public-surface)',
                                  borderRadius: 'var(--public-radius-sm)',
                                  fontFamily: 'var(--public-font-mono)'
                                }}
                              >
                                {endpoint.path}
                              </code>
                              <button
                                onClick={() => copyToClipboard(fullUrl, endpointId)}
                                className="ml-2 p-1 rounded"
                                title="Copy full URL"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'background var(--public-transition-fast)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--public-bg-elevated)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                {copiedEndpoint === endpointId ? (
                                  <Check size={16} style={{ color: '#22c55e' }} />
                                ) : (
                                  <Copy size={16} style={{ color: 'var(--public-text-secondary)' }} />
                                )}
                              </button>
                            </div>
                            {endpoint.auth && (
                              <span style={{ 
                                display: 'inline-block', 
                                marginTop: '0.5rem', 
                                fontSize: '0.75rem', 
                                color: 'var(--public-accent)' 
                              }}>
                                🔒 Requires authentication
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '0.875rem', color: 'var(--public-text-secondary)', marginBottom: '1rem' }}>
                          {endpoint.description}
                        </p>

                        {/* Query Parameters */}
                        {endpoint.queryParams && (
                          <div className="mb-4">
                            <h4 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 600, 
                              color: 'var(--public-text-primary)', 
                              marginBottom: '0.5rem' 
                            }}>
                              Query Parameters:
                            </h4>
                            <div 
                              className="p-3 space-y-2"
                              style={{ 
                                background: 'var(--public-surface)',
                                border: '1px solid var(--public-border)',
                                borderRadius: 'var(--public-radius-md)'
                              }}
                            >
                              {endpoint.queryParams.map((param, paramIdx) => (
                                <div key={paramIdx} style={{ fontFamily: 'var(--public-font-mono)', fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--public-accent)' }}>{param.name}</span>
                                  <span style={{ color: 'var(--public-text-tertiary)' }}> ({param.type})</span>
                                  {param.required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*required</span>}
                                  <span style={{ color: 'var(--public-text-secondary)', marginLeft: '0.5rem' }}>- {param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {endpoint.requestBody && (
                          <div className="mb-4">
                            <h4 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 600, 
                              color: 'var(--public-text-primary)', 
                              marginBottom: '0.5rem' 
                            }}>
                              Request Body:
                            </h4>
                            <pre 
                              className="p-4 text-xs overflow-x-auto font-mono"
                              style={{ 
                                background: 'var(--public-surface)',
                                border: '1px solid var(--public-border)',
                                borderRadius: 'var(--public-radius-md)',
                                color: 'var(--public-text-primary)',
                                fontFamily: 'var(--public-font-mono)'
                              }}
                            >
                              {JSON.stringify(endpoint.requestBody, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Response Example */}
                        {endpoint.responseExample && (
                          <div>
                            <h4 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 600, 
                              color: 'var(--public-text-primary)', 
                              marginBottom: '0.5rem' 
                            }}>
                              Response Example:
                            </h4>
                            {typeof endpoint.responseExample === 'string' ? (
                              <div 
                                className="p-3 font-sans text-sm"
                                style={{ 
                                  background: 'var(--public-surface)',
                                  border: '1px solid var(--public-border)',
                                  borderRadius: 'var(--public-radius-md)',
                                  color: 'var(--public-text-secondary)'
                                }}
                              >
                                {endpoint.responseExample}
                              </div>
                            ) : (
                              <pre 
                                className="p-4 text-xs overflow-x-auto font-mono"
                                style={{ 
                                  background: 'var(--public-surface)',
                                  border: '1px solid var(--public-border)',
                                  borderRadius: 'var(--public-radius-md)',
                                  color: 'var(--public-text-primary)',
                                  fontFamily: 'var(--public-font-mono)'
                                }}
                              >
                                {JSON.stringify(endpoint.responseExample, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      </div>
    </PublicLayout>
  )
}

