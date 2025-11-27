// ============================================================================
// Sketch Entity Operations
// ============================================================================

import { 
  Sketch, SketchEntity, SketchPoint, SketchLine, SketchCircle, 
  SketchArc, SketchRectangle, SketchPolygon, Plane, Vector2 
} from '@webcad/shared';
import { Vec2 } from '../math/vector';
import { generateId } from '../geometry/brep';

// ============================================================================
// Sketch Builder
// ============================================================================

export class SketchBuilder {
  private entities: Record<string, SketchEntity> = {};
  private constraints: Record<string, any> = {};
  private plane: Plane;

  constructor(plane: Plane) {
    this.plane = plane;
  }

  /**
   * Add a point to the sketch
   */
  addPoint(x: number, y: number, isConstruction = false): string {
    const id = generateId('pt');
    const point: SketchPoint = {
      id,
      type: 'point',
      x,
      y,
      isConstruction,
      isFixed: false
    };
    this.entities[id] = point;
    return id;
  }

  /**
   * Add a line between two points
   */
  addLine(x1: number, y1: number, x2: number, y2: number, isConstruction = false): {
    lineId: string;
    startPointId: string;
    endPointId: string;
  } {
    const startPointId = this.addPoint(x1, y1, isConstruction);
    const endPointId = this.addPoint(x2, y2, isConstruction);
    
    const lineId = generateId('line');
    const line: SketchLine = {
      id: lineId,
      type: 'line',
      startPoint: startPointId,
      endPoint: endPointId,
      isConstruction,
      isFixed: false
    };
    this.entities[lineId] = line;
    
    return { lineId, startPointId, endPointId };
  }

  /**
   * Add a line between existing points
   */
  addLineFromPoints(startPointId: string, endPointId: string, isConstruction = false): string {
    const lineId = generateId('line');
    const line: SketchLine = {
      id: lineId,
      type: 'line',
      startPoint: startPointId,
      endPoint: endPointId,
      isConstruction,
      isFixed: false
    };
    this.entities[lineId] = line;
    return lineId;
  }

  /**
   * Add a circle
   */
  addCircle(centerX: number, centerY: number, radius: number, isConstruction = false): {
    circleId: string;
    centerPointId: string;
  } {
    const centerPointId = this.addPoint(centerX, centerY, isConstruction);
    
    const circleId = generateId('circle');
    const circle: SketchCircle = {
      id: circleId,
      type: 'circle',
      centerPoint: centerPointId,
      radius,
      isConstruction,
      isFixed: false
    };
    this.entities[circleId] = circle;
    
    return { circleId, centerPointId };
  }

  /**
   * Add an arc
   */
  addArc(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    isConstruction = false
  ): {
    arcId: string;
    centerPointId: string;
    startPointId: string;
    endPointId: string;
  } {
    const centerPointId = this.addPoint(centerX, centerY, isConstruction);
    
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const startPointId = this.addPoint(startX, startY, isConstruction);
    
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    const endPointId = this.addPoint(endX, endY, isConstruction);
    
    const arcId = generateId('arc');
    const arc: SketchArc = {
      id: arcId,
      type: 'arc',
      centerPoint: centerPointId,
      startPoint: startPointId,
      endPoint: endPointId,
      radius,
      startAngle,
      endAngle,
      clockwise: false,
      isConstruction,
      isFixed: false
    };
    this.entities[arcId] = arc;
    
    return { arcId, centerPointId, startPointId, endPointId };
  }

  /**
   * Add a rectangle
   */
  addRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    isConstruction = false
  ): {
    rectangleId: string;
    cornerIds: [string, string, string, string];
    lineIds: [string, string, string, string];
  } {
    // Create corner points
    const p1 = this.addPoint(x, y, isConstruction);
    const p2 = this.addPoint(x + width, y, isConstruction);
    const p3 = this.addPoint(x + width, y + height, isConstruction);
    const p4 = this.addPoint(x, y + height, isConstruction);
    
    // Create edges
    const l1 = this.addLineFromPoints(p1, p2, isConstruction);
    const l2 = this.addLineFromPoints(p2, p3, isConstruction);
    const l3 = this.addLineFromPoints(p3, p4, isConstruction);
    const l4 = this.addLineFromPoints(p4, p1, isConstruction);
    
    const rectangleId = generateId('rect');
    const rectangle: SketchRectangle = {
      id: rectangleId,
      type: 'rectangle',
      corner1: p1,
      corner2: p3,
      lines: [l1, l2, l3, l4],
      isConstruction,
      isFixed: false
    };
    this.entities[rectangleId] = rectangle;
    
    return {
      rectangleId,
      cornerIds: [p1, p2, p3, p4],
      lineIds: [l1, l2, l3, l4]
    };
  }

  /**
   * Add a regular polygon
   */
  addPolygon(
    centerX: number,
    centerY: number,
    radius: number,
    sides: number,
    rotation = 0,
    isConstruction = false
  ): {
    polygonId: string;
    centerPointId: string;
    vertexIds: string[];
    lineIds: string[];
  } {
    const centerPointId = this.addPoint(centerX, centerY, isConstruction);
    
    const vertexIds: string[] = [];
    const lineIds: string[] = [];
    
    // Create vertices
    for (let i = 0; i < sides; i++) {
      const angle = rotation + (i / sides) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      vertexIds.push(this.addPoint(x, y, isConstruction));
    }
    
    // Create edges
    for (let i = 0; i < sides; i++) {
      const next = (i + 1) % sides;
      lineIds.push(this.addLineFromPoints(vertexIds[i], vertexIds[next], isConstruction));
    }
    
    const polygonId = generateId('polygon');
    const polygon: SketchPolygon = {
      id: polygonId,
      type: 'polygon',
      centerPoint: centerPointId,
      vertices: vertexIds,
      sides,
      inscribed: true,
      isConstruction,
      isFixed: false
    };
    this.entities[polygonId] = polygon;
    
    return { polygonId, centerPointId, vertexIds, lineIds };
  }

  /**
   * Add a coincident constraint
   */
  addCoincident(entity1: string, entity2: string): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'coincident',
      entities: [entity1, entity2],
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add a horizontal constraint
   */
  addHorizontal(entity: string): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'horizontal',
      entities: [entity],
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add a vertical constraint
   */
  addVertical(entity: string): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'vertical',
      entities: [entity],
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add a distance constraint
   */
  addDistance(entity1: string, entity2: string, value: number): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'distance',
      entities: [entity1, entity2],
      value,
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add an angle constraint
   */
  addAngle(line1: string, line2: string, value: number): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'angle',
      entities: [line1, line2],
      value,
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add a radius constraint
   */
  addRadius(circle: string, value: number): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'radius',
      entities: [circle],
      value,
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add a parallel constraint
   */
  addParallel(line1: string, line2: string): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'parallel',
      entities: [line1, line2],
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add a perpendicular constraint
   */
  addPerpendicular(line1: string, line2: string): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'perpendicular',
      entities: [line1, line2],
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Add an equal constraint
   */
  addEqual(entity1: string, entity2: string): string {
    const id = generateId('cnst');
    this.constraints[id] = {
      id,
      type: 'equal',
      entities: [entity1, entity2],
      isReference: false,
      priority: 1
    };
    return id;
  }

  /**
   * Build the sketch
   */
  build(): Sketch {
    return {
      id: generateId('sketch'),
      name: 'Sketch',
      plane: this.plane,
      entities: this.entities,
      constraints: this.constraints,
      regions: [],
      status: 'under-constrained',
      degreesOfFreedom: this.calculateDOF(),
      parameters: {},
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
  }

  /**
   * Calculate degrees of freedom (simplified)
   */
  private calculateDOF(): number {
    let pointCount = 0;
    for (const entity of Object.values(this.entities)) {
      if (entity.type === 'point') pointCount++;
    }
    // Each point has 2 DOF, each constraint removes ~1 DOF
    return pointCount * 2 - Object.keys(this.constraints).length;
  }
}

// ============================================================================
// Sketch Utilities
// ============================================================================

export class SketchUtils {
  /**
   * Get all points from a sketch
   */
  static getPoints(sketch: Sketch): SketchPoint[] {
    return Object.values(sketch.entities).filter(
      (e): e is SketchPoint => e.type === 'point'
    );
  }

  /**
   * Get all lines from a sketch
   */
  static getLines(sketch: Sketch): SketchLine[] {
    return Object.values(sketch.entities).filter(
      (e): e is SketchLine => e.type === 'line'
    );
  }

  /**
   * Get all circles from a sketch
   */
  static getCircles(sketch: Sketch): SketchCircle[] {
    return Object.values(sketch.entities).filter(
      (e): e is SketchCircle => e.type === 'circle'
    );
  }

  /**
   * Get point coordinates
   */
  static getPointCoords(sketch: Sketch, pointId: string): Vector2 | null {
    const point = sketch.entities[pointId] as SketchPoint;
    if (!point || point.type !== 'point') return null;
    return { x: point.x, y: point.y };
  }

  /**
   * Get line endpoints
   */
  static getLineEndpoints(sketch: Sketch, lineId: string): { start: Vector2; end: Vector2 } | null {
    const line = sketch.entities[lineId] as SketchLine;
    if (!line || line.type !== 'line') return null;
    
    const start = this.getPointCoords(sketch, line.startPoint);
    const end = this.getPointCoords(sketch, line.endPoint);
    
    if (!start || !end) return null;
    return { start, end };
  }

  /**
   * Calculate line length
   */
  static getLineLength(sketch: Sketch, lineId: string): number | null {
    const endpoints = this.getLineEndpoints(sketch, lineId);
    if (!endpoints) return null;
    
    const dx = endpoints.end.x - endpoints.start.x;
    const dy = endpoints.end.y - endpoints.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Find entities connected to a point
   */
  static findConnectedEntities(sketch: Sketch, pointId: string): string[] {
    const connected: string[] = [];
    
    for (const entity of Object.values(sketch.entities)) {
      if (entity.type === 'line') {
        const line = entity as SketchLine;
        if (line.startPoint === pointId || line.endPoint === pointId) {
          connected.push(entity.id);
        }
      } else if (entity.type === 'arc') {
        const arc = entity as SketchArc;
        if (arc.centerPoint === pointId || arc.startPoint === pointId || arc.endPoint === pointId) {
          connected.push(entity.id);
        }
      } else if (entity.type === 'circle') {
        const circle = entity as SketchCircle;
        if (circle.centerPoint === pointId) {
          connected.push(entity.id);
        }
      }
    }
    
    return connected;
  }

  /**
   * Clone a sketch
   */
  static clone(sketch: Sketch): Sketch {
    return JSON.parse(JSON.stringify(sketch));
  }

  /**
   * Offset all points in sketch
   */
  static offset(sketch: Sketch, dx: number, dy: number): Sketch {
    const result = this.clone(sketch);
    
    for (const entity of Object.values(result.entities)) {
      if (entity.type === 'point') {
        (entity as SketchPoint).x += dx;
        (entity as SketchPoint).y += dy;
      }
    }
    
    return result;
  }

  /**
   * Scale sketch around origin
   */
  static scale(sketch: Sketch, factor: number, origin?: Vector2): Sketch {
    const result = this.clone(sketch);
    const ox = origin?.x || 0;
    const oy = origin?.y || 0;
    
    for (const entity of Object.values(result.entities)) {
      if (entity.type === 'point') {
        const point = entity as SketchPoint;
        point.x = ox + (point.x - ox) * factor;
        point.y = oy + (point.y - oy) * factor;
      } else if (entity.type === 'circle') {
        (entity as SketchCircle).radius *= factor;
      } else if (entity.type === 'arc') {
        (entity as SketchArc).radius *= factor;
      }
    }
    
    return result;
  }

  /**
   * Mirror sketch about a line
   */
  static mirror(sketch: Sketch, lineStart: Vector2, lineEnd: Vector2): Sketch {
    const result = this.clone(sketch);
    
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return result;
    
    const nx = dx / len;
    const ny = dy / len;
    
    for (const entity of Object.values(result.entities)) {
      if (entity.type === 'point') {
        const point = entity as SketchPoint;
        // Vector from line start to point
        const vx = point.x - lineStart.x;
        const vy = point.y - lineStart.y;
        // Project onto line
        const proj = vx * nx + vy * ny;
        // Find closest point on line
        const cx = lineStart.x + proj * nx;
        const cy = lineStart.y + proj * ny;
        // Mirror
        point.x = 2 * cx - point.x;
        point.y = 2 * cy - point.y;
      }
    }
    
    return result;
  }
}

