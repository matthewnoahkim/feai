/**
 * DXF File Format Import/Export
 * AutoCAD DXF format for 2D drawings
 */

import { Vector3 } from '../math/vector'

export interface DXFEntity {
  type: string
  layer: string
  color?: number
  lineType?: string
}

export interface DXFLine extends DXFEntity {
  type: 'LINE'
  start: { x: number; y: number; z?: number }
  end: { x: number; y: number; z?: number }
}

export interface DXFCircle extends DXFEntity {
  type: 'CIRCLE'
  center: { x: number; y: number; z?: number }
  radius: number
}

export interface DXFArc extends DXFEntity {
  type: 'ARC'
  center: { x: number; y: number; z?: number }
  radius: number
  startAngle: number
  endAngle: number
}

export interface DXFPolyline extends DXFEntity {
  type: 'LWPOLYLINE' | 'POLYLINE'
  vertices: Array<{ x: number; y: number; z?: number; bulge?: number }>
  closed: boolean
}

export interface DXFText extends DXFEntity {
  type: 'TEXT' | 'MTEXT'
  position: { x: number; y: number; z?: number }
  height: number
  text: string
  rotation?: number
}

export interface DXFDimension extends DXFEntity {
  type: 'DIMENSION'
  definitionPoint: { x: number; y: number }
  textMidpoint: { x: number; y: number }
  dimensionType: number
  text?: string
}

export type DXFEntityType = DXFLine | DXFCircle | DXFArc | DXFPolyline | DXFText | DXFDimension

export interface DXFFile {
  entities: DXFEntityType[]
  layers: Map<string, { color: number; lineType: string }>
  blocks: Map<string, DXFEntityType[]>
}

/**
 * Parse DXF file content (simplified parser)
 */
export function parseDXF(content: string): DXFFile {
  const lines = content.split('\n').map(l => l.trim())
  const entities: DXFEntityType[] = []
  const layers = new Map<string, { color: number; lineType: string }>()
  const blocks = new Map<string, DXFEntityType[]>()
  
  let i = 0
  let currentSection = ''
  
  while (i < lines.length) {
    const code = parseInt(lines[i])
    const value = lines[i + 1]
    i += 2
    
    if (code === 0 && value === 'SECTION') {
      // Read section name
      if (parseInt(lines[i]) === 2) {
        currentSection = lines[i + 1]
        i += 2
      }
    } else if (code === 0 && value === 'ENDSEC') {
      currentSection = ''
    } else if (currentSection === 'ENTITIES' && code === 0) {
      const entity = parseEntity(value, lines, i)
      if (entity.entity) {
        entities.push(entity.entity)
      }
      i = entity.nextIndex
    }
  }
  
  return { entities, layers, blocks }
}

function parseEntity(type: string, lines: string[], startIndex: number): { entity: DXFEntityType | null; nextIndex: number } {
  let i = startIndex
  const data: Record<number, string> = {}
  
  // Read until next entity or section end
  while (i < lines.length) {
    const code = parseInt(lines[i])
    const value = lines[i + 1]
    
    if (code === 0) break
    
    data[code] = value
    i += 2
  }
  
  const layer = data[8] || '0'
  const color = data[62] ? parseInt(data[62]) : undefined
  
  switch (type) {
    case 'LINE':
      return {
        entity: {
          type: 'LINE',
          layer,
          color,
          start: { x: parseFloat(data[10]) || 0, y: parseFloat(data[20]) || 0, z: parseFloat(data[30]) || 0 },
          end: { x: parseFloat(data[11]) || 0, y: parseFloat(data[21]) || 0, z: parseFloat(data[31]) || 0 }
        },
        nextIndex: i
      }
      
    case 'CIRCLE':
      return {
        entity: {
          type: 'CIRCLE',
          layer,
          color,
          center: { x: parseFloat(data[10]) || 0, y: parseFloat(data[20]) || 0, z: parseFloat(data[30]) || 0 },
          radius: parseFloat(data[40]) || 0
        },
        nextIndex: i
      }
      
    case 'ARC':
      return {
        entity: {
          type: 'ARC',
          layer,
          color,
          center: { x: parseFloat(data[10]) || 0, y: parseFloat(data[20]) || 0, z: parseFloat(data[30]) || 0 },
          radius: parseFloat(data[40]) || 0,
          startAngle: parseFloat(data[50]) || 0,
          endAngle: parseFloat(data[51]) || 0
        },
        nextIndex: i
      }
      
    default:
      return { entity: null, nextIndex: i }
  }
}

/**
 * Export to DXF format
 */
export function exportDXF(entities: DXFEntityType[], version: string = 'AC1015'): string {
  const lines: string[] = []
  
  // Header section
  lines.push('0', 'SECTION', '2', 'HEADER')
  lines.push('9', '$ACADVER', '1', version)
  lines.push('0', 'ENDSEC')
  
  // Tables section (layers)
  lines.push('0', 'SECTION', '2', 'TABLES')
  lines.push('0', 'TABLE', '2', 'LAYER')
  lines.push('0', 'LAYER', '2', '0', '70', '0', '62', '7', '6', 'CONTINUOUS')
  lines.push('0', 'ENDTAB')
  lines.push('0', 'ENDSEC')
  
  // Entities section
  lines.push('0', 'SECTION', '2', 'ENTITIES')
  
  for (const entity of entities) {
    lines.push(...entityToDXF(entity))
  }
  
  lines.push('0', 'ENDSEC')
  lines.push('0', 'EOF')
  
  return lines.join('\n')
}

function entityToDXF(entity: DXFEntityType): string[] {
  const lines: string[] = ['0', entity.type]
  lines.push('8', entity.layer)
  if (entity.color !== undefined) lines.push('62', entity.color.toString())
  
  switch (entity.type) {
    case 'LINE':
      lines.push('10', entity.start.x.toString())
      lines.push('20', entity.start.y.toString())
      lines.push('30', (entity.start.z || 0).toString())
      lines.push('11', entity.end.x.toString())
      lines.push('21', entity.end.y.toString())
      lines.push('31', (entity.end.z || 0).toString())
      break
      
    case 'CIRCLE':
      lines.push('10', entity.center.x.toString())
      lines.push('20', entity.center.y.toString())
      lines.push('30', (entity.center.z || 0).toString())
      lines.push('40', entity.radius.toString())
      break
      
    case 'ARC':
      lines.push('10', entity.center.x.toString())
      lines.push('20', entity.center.y.toString())
      lines.push('30', (entity.center.z || 0).toString())
      lines.push('40', entity.radius.toString())
      lines.push('50', entity.startAngle.toString())
      lines.push('51', entity.endAngle.toString())
      break
  }
  
  return lines
}

