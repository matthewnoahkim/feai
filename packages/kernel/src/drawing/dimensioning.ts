/**
 * Technical Drawing Dimensioning System
 * Automatic and manual dimension generation for 2D drawings
 */

import { Vector3 } from '../math/vector'

export type DimensionType = 
  | 'linear'
  | 'aligned'
  | 'angular'
  | 'radial'
  | 'diameter'
  | 'arc_length'
  | 'ordinate'
  | 'chain'
  | 'baseline'

export type ToleranceType = 
  | 'none'
  | 'bilateral'
  | 'unilateral_plus'
  | 'unilateral_minus'
  | 'limits'
  | 'fit'

export interface Tolerance {
  type: ToleranceType
  upper?: number
  lower?: number
  fitClass?: string // e.g., "H7/g6"
}

export interface DimensionStyle {
  textHeight: number
  arrowSize: number
  extensionLineGap: number
  extensionLineOffset: number
  lineWeight: number
  precision: number
  units: 'mm' | 'inch'
  showUnits: boolean
  textPosition: 'above' | 'center' | 'outside'
  arrowStyle: 'closed' | 'open' | 'dot' | 'tick' | 'none'
}

export interface Dimension {
  id: string
  type: DimensionType
  value: number
  displayValue: string
  tolerance?: Tolerance
  prefix?: string
  suffix?: string
  
  // Geometry
  points: Array<{ x: number; y: number }>
  textPosition: { x: number; y: number }
  textAngle: number
  
  // Style
  style: DimensionStyle
}

// Default dimension style (ISO standard-like)
const DEFAULT_STYLE: DimensionStyle = {
  textHeight: 3.5,
  arrowSize: 2.5,
  extensionLineGap: 1,
  extensionLineOffset: 10,
  lineWeight: 0.35,
  precision: 2,
  units: 'mm',
  showUnits: false,
  textPosition: 'above',
  arrowStyle: 'closed'
}

/**
 * Format a dimension value with tolerance
 */
function formatDimensionValue(
  value: number,
  tolerance: Tolerance | undefined,
  style: DimensionStyle
): string {
  const formatted = value.toFixed(style.precision)
  const units = style.showUnits ? ` ${style.units}` : ''
  
  if (!tolerance || tolerance.type === 'none') {
    return `${formatted}${units}`
  }
  
  switch (tolerance.type) {
    case 'bilateral':
      return `${formatted} ±${tolerance.upper?.toFixed(style.precision)}${units}`
    
    case 'unilateral_plus':
      return `${formatted} +${tolerance.upper?.toFixed(style.precision)}/-0${units}`
    
    case 'unilateral_minus':
      return `${formatted} +0/-${Math.abs(tolerance.lower || 0).toFixed(style.precision)}${units}`
    
    case 'limits':
      const upper = value + (tolerance.upper || 0)
      const lower = value + (tolerance.lower || 0)
      return `${upper.toFixed(style.precision)}\n${lower.toFixed(style.precision)}${units}`
    
    case 'fit':
      return `${formatted} ${tolerance.fitClass}${units}`
    
    default:
      return `${formatted}${units}`
  }
}

/**
 * Calculate linear dimension between two points
 */
export function createLinearDimension(
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  direction: 'horizontal' | 'vertical' | 'aligned',
  offset: number,
  tolerance?: Tolerance,
  style: Partial<DimensionStyle> = {}
): Dimension {
  const fullStyle = { ...DEFAULT_STYLE, ...style }
  
  let value: number
  let dimPoint1: { x: number; y: number }
  let dimPoint2: { x: number; y: number }
  let textAngle = 0
  
  if (direction === 'horizontal') {
    value = Math.abs(point2.x - point1.x)
    const y = Math.min(point1.y, point2.y) - offset
    dimPoint1 = { x: point1.x, y }
    dimPoint2 = { x: point2.x, y }
    textAngle = 0
  } else if (direction === 'vertical') {
    value = Math.abs(point2.y - point1.y)
    const x = Math.max(point1.x, point2.x) + offset
    dimPoint1 = { x, y: point1.y }
    dimPoint2 = { x, y: point2.y }
    textAngle = 90
  } else {
    // Aligned
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    value = Math.sqrt(dx * dx + dy * dy)
    textAngle = Math.atan2(dy, dx) * 180 / Math.PI
    
    // Offset perpendicular to line
    const perpX = -dy / value * offset
    const perpY = dx / value * offset
    dimPoint1 = { x: point1.x + perpX, y: point1.y + perpY }
    dimPoint2 = { x: point2.x + perpX, y: point2.y + perpY }
  }
  
  const textPosition = {
    x: (dimPoint1.x + dimPoint2.x) / 2,
    y: (dimPoint1.y + dimPoint2.y) / 2
  }
  
  return {
    id: `dim_${Date.now()}`,
    type: direction === 'aligned' ? 'aligned' : 'linear',
    value,
    displayValue: formatDimensionValue(value, tolerance, fullStyle),
    tolerance,
    points: [point1, point2, dimPoint1, dimPoint2],
    textPosition,
    textAngle,
    style: fullStyle
  }
}

/**
 * Calculate angular dimension between two lines
 */
export function createAngularDimension(
  vertex: { x: number; y: number },
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  radius: number,
  tolerance?: Tolerance,
  style: Partial<DimensionStyle> = {}
): Dimension {
  const fullStyle = { ...DEFAULT_STYLE, ...style }
  
  // Calculate angles
  const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x)
  const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x)
  
  let angleDiff = angle2 - angle1
  if (angleDiff < 0) angleDiff += 2 * Math.PI
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff
  
  const valueDegrees = angleDiff * 180 / Math.PI
  
  // Arc points
  const midAngle = angle1 + angleDiff / 2
  const arcPoint1 = {
    x: vertex.x + radius * Math.cos(angle1),
    y: vertex.y + radius * Math.sin(angle1)
  }
  const arcPoint2 = {
    x: vertex.x + radius * Math.cos(angle2),
    y: vertex.y + radius * Math.sin(angle2)
  }
  const textPosition = {
    x: vertex.x + radius * Math.cos(midAngle),
    y: vertex.y + radius * Math.sin(midAngle)
  }
  
  return {
    id: `dim_${Date.now()}`,
    type: 'angular',
    value: valueDegrees,
    displayValue: `${valueDegrees.toFixed(fullStyle.precision)}°`,
    tolerance,
    points: [vertex, arcPoint1, arcPoint2],
    textPosition,
    textAngle: midAngle * 180 / Math.PI + 90,
    style: fullStyle
  }
}

/**
 * Create radial dimension for circles/arcs
 */
export function createRadialDimension(
  center: { x: number; y: number },
  radius: number,
  angle: number, // Direction of dimension line in degrees
  isDiameter: boolean = false,
  tolerance?: Tolerance,
  style: Partial<DimensionStyle> = {}
): Dimension {
  const fullStyle = { ...DEFAULT_STYLE, ...style }
  const radians = angle * Math.PI / 180
  
  const value = isDiameter ? radius * 2 : radius
  const prefix = isDiameter ? 'Ø' : 'R'
  
  const endPoint = {
    x: center.x + radius * Math.cos(radians),
    y: center.y + radius * Math.sin(radians)
  }
  
  const textPosition = {
    x: center.x + radius * 0.7 * Math.cos(radians),
    y: center.y + radius * 0.7 * Math.sin(radians)
  }
  
  return {
    id: `dim_${Date.now()}`,
    type: isDiameter ? 'diameter' : 'radial',
    value,
    displayValue: `${prefix}${formatDimensionValue(value, tolerance, fullStyle)}`,
    tolerance,
    prefix,
    points: isDiameter
      ? [
          { x: center.x - radius * Math.cos(radians), y: center.y - radius * Math.sin(radians) },
          endPoint
        ]
      : [center, endPoint],
    textPosition,
    textAngle: angle,
    style: fullStyle
  }
}

/**
 * Create ordinate dimension (from a datum)
 */
export function createOrdinateDimension(
  datum: { x: number; y: number },
  point: { x: number; y: number },
  direction: 'x' | 'y',
  style: Partial<DimensionStyle> = {}
): Dimension {
  const fullStyle = { ...DEFAULT_STYLE, ...style }
  
  const value = direction === 'x'
    ? point.x - datum.x
    : point.y - datum.y
  
  const leaderEnd = direction === 'x'
    ? { x: point.x, y: point.y - fullStyle.extensionLineOffset }
    : { x: point.x + fullStyle.extensionLineOffset, y: point.y }
  
  return {
    id: `dim_${Date.now()}`,
    type: 'ordinate',
    value: Math.abs(value),
    displayValue: formatDimensionValue(Math.abs(value), undefined, fullStyle),
    points: [point, leaderEnd],
    textPosition: leaderEnd,
    textAngle: 0,
    style: fullStyle
  }
}

/**
 * Create chain dimension (series of dimensions end-to-end)
 */
export function createChainDimension(
  points: Array<{ x: number; y: number }>,
  direction: 'horizontal' | 'vertical',
  offset: number,
  style: Partial<DimensionStyle> = {}
): Dimension[] {
  const dimensions: Dimension[] = []
  
  for (let i = 0; i < points.length - 1; i++) {
    dimensions.push(
      createLinearDimension(
        points[i],
        points[i + 1],
        direction,
        offset,
        undefined,
        style
      )
    )
  }
  
  return dimensions
}

/**
 * Create baseline dimension (series from common baseline)
 */
export function createBaselineDimension(
  baseline: { x: number; y: number },
  points: Array<{ x: number; y: number }>,
  direction: 'horizontal' | 'vertical',
  startOffset: number,
  offsetIncrement: number,
  style: Partial<DimensionStyle> = {}
): Dimension[] {
  const dimensions: Dimension[] = []
  
  // Sort points by distance from baseline
  const sorted = [...points].sort((a, b) => {
    const distA = direction === 'horizontal'
      ? Math.abs(a.x - baseline.x)
      : Math.abs(a.y - baseline.y)
    const distB = direction === 'horizontal'
      ? Math.abs(b.x - baseline.x)
      : Math.abs(b.y - baseline.y)
    return distA - distB
  })
  
  sorted.forEach((point, index) => {
    dimensions.push(
      createLinearDimension(
        baseline,
        point,
        direction,
        startOffset + index * offsetIncrement,
        undefined,
        style
      )
    )
  })
  
  return dimensions
}

/**
 * Hole callout generator
 */
export function createHoleCallout(
  center: { x: number; y: number },
  diameter: number,
  depth: number | 'through',
  quantity: number = 1,
  countersink?: { diameter: number; angle: number },
  counterbore?: { diameter: number; depth: number },
  thread?: { size: string; pitch?: number },
  style: Partial<DimensionStyle> = {}
): string {
  const parts: string[] = []
  
  // Quantity
  if (quantity > 1) {
    parts.push(`${quantity}X`)
  }
  
  // Thread or diameter
  if (thread) {
    parts.push(thread.size)
    if (thread.pitch) {
      parts.push(`x${thread.pitch}`)
    }
  } else {
    parts.push(`Ø${diameter.toFixed(2)}`)
  }
  
  // Depth
  if (depth === 'through') {
    parts.push('THRU')
  } else {
    parts.push(`↧${depth.toFixed(2)}`)
  }
  
  // Counterbore
  if (counterbore) {
    parts.push(`⌴Ø${counterbore.diameter.toFixed(2)} ↧${counterbore.depth.toFixed(2)}`)
  }
  
  // Countersink
  if (countersink) {
    parts.push(`⌵Ø${countersink.diameter.toFixed(2)} x ${countersink.angle}°`)
  }
  
  return parts.join(' ')
}

