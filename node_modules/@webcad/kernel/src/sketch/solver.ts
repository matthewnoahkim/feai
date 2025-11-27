// ============================================================================
// 2D Constraint Solver
// ============================================================================

import { 
  Vector2, Sketch, SketchEntity, Constraint, SolverResult, 
  SketchPoint, SketchLine, SketchCircle, SketchArc 
} from '@webcad/shared';
import { Vec2 } from '../math/vector';

// ============================================================================
// Solver State
// ============================================================================

interface SolverState {
  points: Map<string, { x: number; y: number; fixed: boolean }>;
  constraints: Constraint[];
  degreesOfFreedom: number;
}

// ============================================================================
// Constraint Equations
// ============================================================================

type ConstraintEquation = {
  residual: () => number;
  gradient: (pointId: string, axis: 'x' | 'y') => number;
  affectedPoints: string[];
};

// ============================================================================
// Sketch Constraint Solver
// ============================================================================

export class SketchSolver {
  private state: SolverState;
  private equations: ConstraintEquation[] = [];
  private tolerance = 1e-6;
  private maxIterations = 100;

  constructor() {
    this.state = {
      points: new Map(),
      constraints: [],
      degreesOfFreedom: 0
    };
  }

  /**
   * Initialize solver with sketch data
   */
  initialize(sketch: Sketch): void {
    this.state.points.clear();
    this.state.constraints = [];
    this.equations = [];

    // Extract all points from entities
    for (const entity of Object.values(sketch.entities)) {
      this.extractPoints(entity);
    }

    // Add constraints
    for (const constraint of Object.values(sketch.constraints)) {
      this.addConstraint(constraint, sketch);
    }

    this.calculateDegreesOfFreedom();
  }

  /**
   * Extract points from a sketch entity
   */
  private extractPoints(entity: SketchEntity): void {
    switch (entity.type) {
      case 'point':
        const point = entity as SketchPoint;
        this.state.points.set(point.id, {
          x: point.x,
          y: point.y,
          fixed: point.isFixed
        });
        break;
        
      // Lines, circles, etc. reference point IDs
      // The actual point data comes from SketchPoint entities
    }
  }

  /**
   * Add a constraint equation
   */
  private addConstraint(constraint: Constraint, sketch: Sketch): void {
    this.state.constraints.push(constraint);

    switch (constraint.type) {
      case 'coincident':
        this.addCoincidentConstraint(constraint.entities as [string, string], sketch);
        break;
      case 'horizontal':
        this.addHorizontalConstraint(constraint.entities, sketch);
        break;
      case 'vertical':
        this.addVerticalConstraint(constraint.entities, sketch);
        break;
      case 'distance':
        this.addDistanceConstraint(
          constraint.entities as [string, string],
          (constraint as any).value,
          sketch
        );
        break;
      case 'angle':
        this.addAngleConstraint(
          constraint.entities as [string, string],
          (constraint as any).value,
          sketch
        );
        break;
      case 'radius':
        this.addRadiusConstraint(constraint.entities[0], (constraint as any).value, sketch);
        break;
      case 'parallel':
        this.addParallelConstraint(constraint.entities as [string, string], sketch);
        break;
      case 'perpendicular':
        this.addPerpendicularConstraint(constraint.entities as [string, string], sketch);
        break;
      case 'tangent':
        this.addTangentConstraint(constraint.entities as [string, string], sketch);
        break;
      case 'equal':
        this.addEqualConstraint(constraint.entities as [string, string], sketch);
        break;
      // Add more constraint types as needed
    }
  }

  /**
   * Coincident constraint: Two points at the same location
   */
  private addCoincidentConstraint(entities: [string, string], sketch: Sketch): void {
    const [id1, id2] = entities;
    const pt1 = this.getPointPosition(id1, sketch);
    const pt2 = this.getPointPosition(id2, sketch);
    
    if (!pt1 || !pt2) return;

    // X coincident
    this.equations.push({
      residual: () => {
        const p1 = this.state.points.get(pt1.pointId);
        const p2 = this.state.points.get(pt2.pointId);
        return (p1?.x || 0) - (p2?.x || 0);
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        if (axis !== 'x') return 0;
        if (pointId === pt1.pointId) return 1;
        if (pointId === pt2.pointId) return -1;
        return 0;
      },
      affectedPoints: [pt1.pointId, pt2.pointId]
    });

    // Y coincident
    this.equations.push({
      residual: () => {
        const p1 = this.state.points.get(pt1.pointId);
        const p2 = this.state.points.get(pt2.pointId);
        return (p1?.y || 0) - (p2?.y || 0);
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        if (axis !== 'y') return 0;
        if (pointId === pt1.pointId) return 1;
        if (pointId === pt2.pointId) return -1;
        return 0;
      },
      affectedPoints: [pt1.pointId, pt2.pointId]
    });
  }

  /**
   * Horizontal constraint: Line or two points have same Y
   */
  private addHorizontalConstraint(entities: string[], sketch: Sketch): void {
    let pt1Id: string, pt2Id: string;

    if (entities.length === 1) {
      // Line entity
      const line = sketch.entities[entities[0]] as SketchLine;
      if (!line || line.type !== 'line') return;
      pt1Id = line.startPoint;
      pt2Id = line.endPoint;
    } else {
      pt1Id = entities[0];
      pt2Id = entities[1];
    }

    this.equations.push({
      residual: () => {
        const p1 = this.state.points.get(pt1Id);
        const p2 = this.state.points.get(pt2Id);
        return (p1?.y || 0) - (p2?.y || 0);
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        if (axis !== 'y') return 0;
        if (pointId === pt1Id) return 1;
        if (pointId === pt2Id) return -1;
        return 0;
      },
      affectedPoints: [pt1Id, pt2Id]
    });
  }

  /**
   * Vertical constraint: Line or two points have same X
   */
  private addVerticalConstraint(entities: string[], sketch: Sketch): void {
    let pt1Id: string, pt2Id: string;

    if (entities.length === 1) {
      const line = sketch.entities[entities[0]] as SketchLine;
      if (!line || line.type !== 'line') return;
      pt1Id = line.startPoint;
      pt2Id = line.endPoint;
    } else {
      pt1Id = entities[0];
      pt2Id = entities[1];
    }

    this.equations.push({
      residual: () => {
        const p1 = this.state.points.get(pt1Id);
        const p2 = this.state.points.get(pt2Id);
        return (p1?.x || 0) - (p2?.x || 0);
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        if (axis !== 'x') return 0;
        if (pointId === pt1Id) return 1;
        if (pointId === pt2Id) return -1;
        return 0;
      },
      affectedPoints: [pt1Id, pt2Id]
    });
  }

  /**
   * Distance constraint: Fixed distance between two points
   */
  private addDistanceConstraint(
    entities: [string, string],
    targetDistance: number,
    sketch: Sketch
  ): void {
    const pt1 = this.getPointPosition(entities[0], sketch);
    const pt2 = this.getPointPosition(entities[1], sketch);
    
    if (!pt1 || !pt2) return;
    const pt1Id = pt1.pointId;
    const pt2Id = pt2.pointId;

    this.equations.push({
      residual: () => {
        const p1 = this.state.points.get(pt1Id);
        const p2 = this.state.points.get(pt2Id);
        if (!p1 || !p2) return 0;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy) - targetDistance;
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        const p1 = this.state.points.get(pt1Id);
        const p2 = this.state.points.get(pt2Id);
        if (!p1 || !p2) return 0;
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1e-10) return 0;

        if (pointId === pt1Id) {
          return axis === 'x' ? dx / dist : dy / dist;
        }
        if (pointId === pt2Id) {
          return axis === 'x' ? -dx / dist : -dy / dist;
        }
        return 0;
      },
      affectedPoints: [pt1Id, pt2Id]
    });
  }

  /**
   * Angle constraint: Angle between two lines
   */
  private addAngleConstraint(
    entities: [string, string],
    targetAngle: number,
    sketch: Sketch
  ): void {
    const line1 = sketch.entities[entities[0]] as SketchLine;
    const line2 = sketch.entities[entities[1]] as SketchLine;
    
    if (!line1 || !line2 || line1.type !== 'line' || line2.type !== 'line') return;

    // Get point IDs
    const l1Start = line1.startPoint;
    const l1End = line1.endPoint;
    const l2Start = line2.startPoint;
    const l2End = line2.endPoint;

    this.equations.push({
      residual: () => {
        const p1s = this.state.points.get(l1Start);
        const p1e = this.state.points.get(l1End);
        const p2s = this.state.points.get(l2Start);
        const p2e = this.state.points.get(l2End);
        
        if (!p1s || !p1e || !p2s || !p2e) return 0;

        const v1 = new Vec2(p1e.x - p1s.x, p1e.y - p1s.y);
        const v2 = new Vec2(p2e.x - p2s.x, p2e.y - p2s.y);
        
        const dot = v1.dot(v2);
        const cross = v1.cross(v2);
        const actualAngle = Math.atan2(cross, dot);
        
        return actualAngle - targetAngle;
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        // Numerical gradient for complex constraints
        return this.numericalGradient(pointId, axis);
      },
      affectedPoints: [l1Start, l1End, l2Start, l2End]
    });
  }

  /**
   * Radius constraint: Circle or arc radius
   */
  private addRadiusConstraint(entityId: string, targetRadius: number, sketch: Sketch): void {
    const entity = sketch.entities[entityId];
    if (!entity) return;

    if (entity.type === 'circle') {
      const circle = entity as SketchCircle;
      // For simplicity, treat radius as a property rather than a constraint
      // A full implementation would modify the circle's representation
    }
  }

  /**
   * Parallel constraint: Two lines parallel
   */
  private addParallelConstraint(entities: [string, string], sketch: Sketch): void {
    const line1 = sketch.entities[entities[0]] as SketchLine;
    const line2 = sketch.entities[entities[1]] as SketchLine;
    
    if (!line1 || !line2 || line1.type !== 'line' || line2.type !== 'line') return;

    const l1Start = line1.startPoint;
    const l1End = line1.endPoint;
    const l2Start = line2.startPoint;
    const l2End = line2.endPoint;

    // Cross product of direction vectors = 0
    this.equations.push({
      residual: () => {
        const p1s = this.state.points.get(l1Start);
        const p1e = this.state.points.get(l1End);
        const p2s = this.state.points.get(l2Start);
        const p2e = this.state.points.get(l2End);
        
        if (!p1s || !p1e || !p2s || !p2e) return 0;

        const v1 = new Vec2(p1e.x - p1s.x, p1e.y - p1s.y);
        const v2 = new Vec2(p2e.x - p2s.x, p2e.y - p2s.y);
        
        // Normalize to avoid scale issues
        return v1.normalize().cross(v2.normalize());
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        return this.numericalGradient(pointId, axis);
      },
      affectedPoints: [l1Start, l1End, l2Start, l2End]
    });
  }

  /**
   * Perpendicular constraint: Two lines perpendicular
   */
  private addPerpendicularConstraint(entities: [string, string], sketch: Sketch): void {
    const line1 = sketch.entities[entities[0]] as SketchLine;
    const line2 = sketch.entities[entities[1]] as SketchLine;
    
    if (!line1 || !line2 || line1.type !== 'line' || line2.type !== 'line') return;

    const l1Start = line1.startPoint;
    const l1End = line1.endPoint;
    const l2Start = line2.startPoint;
    const l2End = line2.endPoint;

    // Dot product of direction vectors = 0
    this.equations.push({
      residual: () => {
        const p1s = this.state.points.get(l1Start);
        const p1e = this.state.points.get(l1End);
        const p2s = this.state.points.get(l2Start);
        const p2e = this.state.points.get(l2End);
        
        if (!p1s || !p1e || !p2s || !p2e) return 0;

        const v1 = new Vec2(p1e.x - p1s.x, p1e.y - p1s.y);
        const v2 = new Vec2(p2e.x - p2s.x, p2e.y - p2s.y);
        
        return v1.normalize().dot(v2.normalize());
      },
      gradient: (pointId: string, axis: 'x' | 'y') => {
        return this.numericalGradient(pointId, axis);
      },
      affectedPoints: [l1Start, l1End, l2Start, l2End]
    });
  }

  /**
   * Tangent constraint (simplified for line-circle)
   */
  private addTangentConstraint(entities: [string, string], sketch: Sketch): void {
    // Simplified - full implementation would handle various entity combinations
  }

  /**
   * Equal constraint: Two lines same length or two circles same radius
   */
  private addEqualConstraint(entities: [string, string], sketch: Sketch): void {
    const entity1 = sketch.entities[entities[0]];
    const entity2 = sketch.entities[entities[1]];
    
    if (!entity1 || !entity2) return;

    if (entity1.type === 'line' && entity2.type === 'line') {
      const line1 = entity1 as SketchLine;
      const line2 = entity2 as SketchLine;

      this.equations.push({
        residual: () => {
          const p1s = this.state.points.get(line1.startPoint);
          const p1e = this.state.points.get(line1.endPoint);
          const p2s = this.state.points.get(line2.startPoint);
          const p2e = this.state.points.get(line2.endPoint);
          
          if (!p1s || !p1e || !p2s || !p2e) return 0;

          const len1 = Math.sqrt((p1e.x - p1s.x) ** 2 + (p1e.y - p1s.y) ** 2);
          const len2 = Math.sqrt((p2e.x - p2s.x) ** 2 + (p2e.y - p2s.y) ** 2);
          
          return len1 - len2;
        },
        gradient: (pointId: string, axis: 'x' | 'y') => {
          return this.numericalGradient(pointId, axis);
        },
        affectedPoints: [line1.startPoint, line1.endPoint, line2.startPoint, line2.endPoint]
      });
    }
  }

  /**
   * Get point position from entity (handles both point entities and references)
   */
  private getPointPosition(id: string, sketch: Sketch): { pointId: string } | null {
    const entity = sketch.entities[id];
    if (!entity) return null;
    
    if (entity.type === 'point') {
      return { pointId: id };
    }
    
    // Could also handle endpoints of lines, center of circles, etc.
    return null;
  }

  /**
   * Numerical gradient calculation for complex constraints
   */
  private numericalGradient(pointId: string, axis: 'x' | 'y'): number {
    const point = this.state.points.get(pointId);
    if (!point || point.fixed) return 0;

    const h = 1e-8;
    const original = axis === 'x' ? point.x : point.y;
    
    // Compute residual at original + h
    if (axis === 'x') point.x = original + h;
    else point.y = original + h;
    
    const rPlus = this.equations.reduce((sum, eq) => sum + eq.residual() ** 2, 0);
    
    // Compute residual at original - h
    if (axis === 'x') point.x = original - h;
    else point.y = original - h;
    
    const rMinus = this.equations.reduce((sum, eq) => sum + eq.residual() ** 2, 0);
    
    // Restore original
    if (axis === 'x') point.x = original;
    else point.y = original;
    
    return (rPlus - rMinus) / (2 * h);
  }

  /**
   * Calculate degrees of freedom
   */
  private calculateDegreesOfFreedom(): void {
    let freePoints = 0;
    for (const point of this.state.points.values()) {
      if (!point.fixed) {
        freePoints++;
      }
    }
    
    // Each free point contributes 2 DOF (x, y)
    // Each constraint equation removes 1 DOF
    this.state.degreesOfFreedom = freePoints * 2 - this.equations.length;
  }

  /**
   * Solve the constraint system using Newton-Raphson iteration
   */
  solve(): SolverResult {
    const startTime = performance.now();
    let iterations = 0;
    let converged = false;

    while (iterations < this.maxIterations) {
      // Calculate total residual
      let totalResidual = 0;
      for (const eq of this.equations) {
        totalResidual += eq.residual() ** 2;
      }
      totalResidual = Math.sqrt(totalResidual);

      if (totalResidual < this.tolerance) {
        converged = true;
        break;
      }

      // Gradient descent step
      this.gradientDescentStep(0.1);
      iterations++;
    }

    // Build result
    const positions: Record<string, Vector2> = {};
    for (const [id, point] of this.state.points) {
      positions[id] = { x: point.x, y: point.y };
    }

    return {
      success: converged,
      status: converged 
        ? (this.state.degreesOfFreedom === 0 ? 'fully-constrained' : 'under-constrained')
        : 'over-constrained',
      degreesOfFreedom: Math.max(0, this.state.degreesOfFreedom),
      positions,
      errors: converged ? [] : [{
        constraintId: 'system',
        message: 'Failed to converge',
        residual: this.equations.reduce((sum, eq) => sum + Math.abs(eq.residual()), 0)
      }],
      iterations,
      time: performance.now() - startTime
    };
  }

  /**
   * Perform a single gradient descent step
   */
  private gradientDescentStep(stepSize: number): void {
    const gradients = new Map<string, { dx: number; dy: number }>();

    // Initialize gradients
    for (const [id, point] of this.state.points) {
      if (!point.fixed) {
        gradients.set(id, { dx: 0, dy: 0 });
      }
    }

    // Accumulate gradients from all equations
    for (const eq of this.equations) {
      const residual = eq.residual();
      
      for (const pointId of eq.affectedPoints) {
        const grad = gradients.get(pointId);
        if (grad) {
          grad.dx += 2 * residual * eq.gradient(pointId, 'x');
          grad.dy += 2 * residual * eq.gradient(pointId, 'y');
        }
      }
    }

    // Apply gradients
    for (const [id, grad] of gradients) {
      const point = this.state.points.get(id);
      if (point && !point.fixed) {
        point.x -= stepSize * grad.dx;
        point.y -= stepSize * grad.dy;
      }
    }
  }

  /**
   * Drag a point to a new position and re-solve
   */
  dragPoint(pointId: string, newPosition: Vector2): SolverResult {
    const point = this.state.points.get(pointId);
    if (point) {
      point.x = newPosition.x;
      point.y = newPosition.y;
    }
    return this.solve();
  }
}

