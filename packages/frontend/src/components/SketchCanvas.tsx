/**
 * SketchCanvas - 2D overlay for sketch drawing with professional CAD-style feedback
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useUIStore, Point2D, SnapInfo, InferenceInfo, ConstraintType } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'

// Constants
const SNAP_DISTANCE = 10 // pixels
const GRID_SIZE = 10 // world units
const INFERENCE_ANGLE_THRESHOLD = 2 // degrees

interface CanvasPoint {
  x: number
  y: number
}

// Convert world point to canvas coordinates
function worldToCanvas(
  point: Point2D, 
  canvas: HTMLCanvasElement, 
  zoom: number, 
  pan: CanvasPoint
): CanvasPoint {
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  return {
    x: centerX + (point.x - pan.x) * zoom,
    y: centerY - (point.y - pan.y) * zoom // Y is inverted in canvas
  }
}

// Convert canvas coordinates to world point
function canvasToWorld(
  point: CanvasPoint, 
  canvas: HTMLCanvasElement, 
  zoom: number, 
  pan: CanvasPoint
): Point2D {
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  return {
    x: (point.x - centerX) / zoom + pan.x,
    y: -(point.y - centerY) / zoom + pan.y, // Y is inverted
    z: 0
  }
}

// Snap to grid
function snapToGrid(point: Point2D, gridSize: number): Point2D {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
    z: point.z
  }
}

// Check horizontal/vertical inference
function checkHVInference(
  from: Point2D, 
  to: Point2D, 
  threshold: number
): { type: 'horizontal' | 'vertical' | null; constrainedPoint: Point2D } {
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  
  if (dy < threshold && dx > threshold) {
    return { type: 'horizontal', constrainedPoint: { ...to, y: from.y } }
  }
  if (dx < threshold && dy > threshold) {
    return { type: 'vertical', constrainedPoint: { ...to, x: from.x } }
  }
  
  return { type: null, constrainedPoint: to }
}

// Calculate distance between points
function distance(p1: Point2D | CanvasPoint, p2: Point2D | CanvasPoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

// Calculate angle between two points (in degrees)
function angleBetween(p1: Point2D, p2: Point2D): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
}

// Calculate angle in radians
function angleRadians(p1: Point2D, p2: Point2D): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

// Calculate the midpoint between two points
function midpoint(p1: Point2D, p2: Point2D): Point2D {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: 0
  }
}

// Calculate arc center and radius from 3 points (start, end, bulge)
// Returns null if points are collinear
function calculateArcFrom3Points(
  p1: Point2D, 
  p2: Point2D, 
  p3: Point2D
): { center: Point2D; radius: number; startAngle: number; endAngle: number; clockwise: boolean } | null {
  // Use circumcenter formula for 3 points
  const ax = p1.x, ay = p1.y
  const bx = p2.x, by = p2.y
  const cx = p3.x, cy = p3.y
  
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  
  // Check if points are collinear
  if (Math.abs(d) < 0.0001) {
    return null
  }
  
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d
  
  const center: Point2D = { x: ux, y: uy, z: 0 }
  const radius = distance(center, p1)
  
  // Calculate angles
  const startAngle = angleRadians(center, p1)
  const endAngle = angleRadians(center, p2)
  const midAngle = angleRadians(center, p3)
  
  // Determine if the arc goes clockwise or counterclockwise through the bulge point
  // Check if midAngle is between startAngle and endAngle going counterclockwise
  let clockwise = false
  
  const normalizeAngle = (a: number) => {
    while (a < 0) a += Math.PI * 2
    while (a >= Math.PI * 2) a -= Math.PI * 2
    return a
  }
  
  const normStart = normalizeAngle(startAngle)
  const normEnd = normalizeAngle(endAngle)
  const normMid = normalizeAngle(midAngle)
  
  // Check if going counterclockwise from start to end passes through mid
  if (normStart <= normEnd) {
    clockwise = !(normMid >= normStart && normMid <= normEnd)
  } else {
    clockwise = !(normMid >= normStart || normMid <= normEnd)
  }
  
  return { center, radius, startAngle, endAngle, clockwise }
}

// Check if a point is near the chord midpoint (for semicircle snap)
function isNearChordMidpoint(
  p1: Point2D, 
  p2: Point2D, 
  testPoint: Point2D, 
  threshold: number
): boolean {
  const mid = midpoint(p1, p2)
  // Perpendicular bisector check - project test point onto perpendicular
  const chordDx = p2.x - p1.x
  const chordDy = p2.y - p1.y
  const chordLength = Math.sqrt(chordDx * chordDx + chordDy * chordDy)
  
  if (chordLength < 0.001) return false
  
  // Normal to chord
  const nx = -chordDy / chordLength
  const ny = chordDx / chordLength
  
  // Vector from midpoint to test point
  const tx = testPoint.x - mid.x
  const ty = testPoint.y - mid.y
  
  // Dot product with chord direction - should be near zero for perpendicular
  const dotChord = Math.abs((tx * chordDx + ty * chordDy) / chordLength)
  
  return dotChord < threshold
}

// Calculate tangent handles for spline points using Catmull-Rom style tangents
function calculateSplineHandles(
  points: Point2D[], 
  closed: boolean
): { point: Point2D; handleIn: Point2D; handleOut: Point2D }[] {
  const handles: { point: Point2D; handleIn: Point2D; handleOut: Point2D }[] = []
  const n = points.length
  
  if (n < 2) return handles
  
  const tension = 0.3 // Controls how "tight" the curve is (0 = sharp, 1 = very smooth)
  
  for (let i = 0; i < n; i++) {
    const p = points[i]
    
    // Get neighboring points
    let pPrev: Point2D
    let pNext: Point2D
    
    if (closed) {
      pPrev = points[(i - 1 + n) % n]
      pNext = points[(i + 1) % n]
    } else {
      pPrev = i > 0 ? points[i - 1] : points[i]
      pNext = i < n - 1 ? points[i + 1] : points[i]
    }
    
    // Calculate tangent direction (Catmull-Rom style)
    const dx = (pNext.x - pPrev.x) * tension
    const dy = (pNext.y - pPrev.y) * tension
    
    // For endpoints of open splines, use different handle calculation
    if (!closed && (i === 0 || i === n - 1)) {
      const neighbor = i === 0 ? points[1] : points[n - 2]
      const dist = distance(p, neighbor) * 0.3
      const angle = angleRadians(p, neighbor)
      
      if (i === 0) {
        handles.push({
          point: p,
          handleIn: p, // No incoming handle at start
          handleOut: {
            x: p.x + dist * Math.cos(angle),
            y: p.y + dist * Math.sin(angle),
            z: 0
          }
        })
      } else {
        handles.push({
          point: p,
          handleIn: {
            x: p.x - dist * Math.cos(angle),
            y: p.y - dist * Math.sin(angle),
            z: 0
          },
          handleOut: p // No outgoing handle at end
        })
      }
    } else {
      handles.push({
        point: p,
        handleIn: { x: p.x - dx, y: p.y - dy, z: 0 },
        handleOut: { x: p.x + dx, y: p.y + dy, z: 0 }
      })
    }
  }
  
  return handles
}

// Calculate a point on a cubic Bezier curve
function bezierPoint(t: number, p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D): Point2D {
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  const t2 = t * t
  const t3 = t2 * t
  
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    z: 0
  }
}

// Draw a smooth spline curve through points
function drawSplineCurve(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  zoom: number,
  pan: CanvasPoint,
  points: Point2D[],
  closed: boolean
) {
  if (points.length < 2) return
  
  const handles = calculateSplineHandles(points, closed)
  const n = points.length
  const segments = closed ? n : n - 1
  
  ctx.beginPath()
  
  for (let i = 0; i < segments; i++) {
    const h0 = handles[i]
    const h1 = handles[(i + 1) % n]
    
    const p0 = worldToCanvas(h0.point, canvas, zoom, pan)
    const p1 = worldToCanvas(h0.handleOut, canvas, zoom, pan)
    const p2 = worldToCanvas(h1.handleIn, canvas, zoom, pan)
    const p3 = worldToCanvas(h1.point, canvas, zoom, pan)
    
    if (i === 0) {
      ctx.moveTo(p0.x, p0.y)
    }
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
  }
  
  ctx.stroke()
}

// ============ Intersection Detection Utilities for Trim/Extend ============

// Find intersection point of two line segments
function lineLineIntersection(
  p1: Point2D, p2: Point2D, // First line
  p3: Point2D, p4: Point2D  // Second line
): Point2D | null {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
  if (Math.abs(d) < 0.0001) return null // Parallel or coincident
  
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d
  
  // Check if intersection is within both segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
      z: 0
    }
  }
  return null
}

// Find intersection between line segment and circle
function lineCircleIntersection(
  lineStart: Point2D, lineEnd: Point2D,
  center: Point2D, radius: number
): Point2D[] {
  const intersections: Point2D[] = []
  
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  
  const fx = lineStart.x - center.x
  const fy = lineStart.y - center.y
  
  const a = dx * dx + dy * dy
  const b = 2 * (fx * dx + fy * dy)
  const c = fx * fx + fy * fy - radius * radius
  
  const discriminant = b * b - 4 * a * c
  
  if (discriminant < 0) return intersections
  
  const sqrtDisc = Math.sqrt(discriminant)
  const t1 = (-b - sqrtDisc) / (2 * a)
  const t2 = (-b + sqrtDisc) / (2 * a)
  
  if (t1 >= 0 && t1 <= 1) {
    intersections.push({
      x: lineStart.x + t1 * dx,
      y: lineStart.y + t1 * dy,
      z: 0
    })
  }
  
  if (t2 >= 0 && t2 <= 1 && Math.abs(t2 - t1) > 0.0001) {
    intersections.push({
      x: lineStart.x + t2 * dx,
      y: lineStart.y + t2 * dy,
      z: 0
    })
  }
  
  return intersections
}

// Find intersection between line and arc
function lineArcIntersection(
  lineStart: Point2D, lineEnd: Point2D,
  arcCenter: Point2D, arcRadius: number,
  arcStartAngle: number, arcEndAngle: number
): Point2D[] {
  const circleIntersections = lineCircleIntersection(lineStart, lineEnd, arcCenter, arcRadius)
  
  return circleIntersections.filter(p => {
    const angle = Math.atan2(p.y - arcCenter.y, p.x - arcCenter.x)
    return isAngleInArc(angle, arcStartAngle, arcEndAngle)
  })
}

// Check if an angle is within arc range
function isAngleInArc(angle: number, start: number, end: number): boolean {
  // Normalize all angles to [0, 2π)
  const normalizeAngle = (a: number) => {
    while (a < 0) a += Math.PI * 2
    while (a >= Math.PI * 2) a -= Math.PI * 2
    return a
  }
  
  const normAngle = normalizeAngle(angle)
  const normStart = normalizeAngle(start)
  const normEnd = normalizeAngle(end)
  
  if (normStart <= normEnd) {
    return normAngle >= normStart && normAngle <= normEnd
  } else {
    return normAngle >= normStart || normAngle <= normEnd
  }
}

// Find all intersections between an entity and all other entities
function findEntityIntersections(
  entity: any,
  allEntities: any[],
  entityIndex: number
): Point2D[] {
  const intersections: Point2D[] = []
  
  for (let i = 0; i < allEntities.length; i++) {
    if (i === entityIndex) continue
    const other = allEntities[i]
    const points = findTwoEntityIntersections(entity, other)
    intersections.push(...points)
  }
  
  return intersections
}

// Find intersections between two entities
function findTwoEntityIntersections(entity1: any, entity2: any): Point2D[] {
  const intersections: Point2D[] = []
  
  // Line vs Line
  if (entity1.type === 'line' && entity2.type === 'line') {
    const p = lineLineIntersection(
      entity1.data.start, entity1.data.end,
      entity2.data.start, entity2.data.end
    )
    if (p) intersections.push(p)
  }
  
  // Line vs Circle
  else if (entity1.type === 'line' && entity2.type === 'circle') {
    const points = lineCircleIntersection(
      entity1.data.start, entity1.data.end,
      entity2.data.center, entity2.data.radius
    )
    intersections.push(...points)
  }
  else if (entity1.type === 'circle' && entity2.type === 'line') {
    const points = lineCircleIntersection(
      entity2.data.start, entity2.data.end,
      entity1.data.center, entity1.data.radius
    )
    intersections.push(...points)
  }
  
  // Line vs Arc
  else if (entity1.type === 'line' && entity2.type === 'arc') {
    const points = lineArcIntersection(
      entity1.data.start, entity1.data.end,
      entity2.data.center, entity2.data.radius,
      entity2.data.startAngle, entity2.data.endAngle
    )
    intersections.push(...points)
  }
  else if (entity1.type === 'arc' && entity2.type === 'line') {
    const points = lineArcIntersection(
      entity2.data.start, entity2.data.end,
      entity1.data.center, entity1.data.radius,
      entity1.data.startAngle, entity1.data.endAngle
    )
    intersections.push(...points)
  }
  
  // Line vs Rectangle (as 4 line segments)
  else if (entity1.type === 'line' && entity2.type === 'rectangle') {
    const c1 = entity2.data.corner1
    const c2 = entity2.data.corner2
    const corners = [
      c1,
      { x: c2.x, y: c1.y, z: 0 },
      c2,
      { x: c1.x, y: c2.y, z: 0 }
    ]
    for (let i = 0; i < 4; i++) {
      const p = lineLineIntersection(
        entity1.data.start, entity1.data.end,
        corners[i], corners[(i + 1) % 4]
      )
      if (p) intersections.push(p)
    }
  }
  else if (entity1.type === 'rectangle' && entity2.type === 'line') {
    return findTwoEntityIntersections(entity2, entity1)
  }
  
  return intersections
}

// Find the nearest intersection point to a given point along an entity
function findNearestIntersectionAlongEntity(
  point: Point2D,
  entity: any,
  intersections: Point2D[]
): { point: Point2D; distance: number } | null {
  if (intersections.length === 0) return null
  
  let nearest: Point2D | null = null
  let minDist = Infinity
  
  for (const inter of intersections) {
    const d = distance(point, inter)
    if (d < minDist) {
      minDist = d
      nearest = inter
    }
  }
  
  return nearest ? { point: nearest, distance: minDist } : null
}

// Determine which portion of a line to trim based on click position
function getLineTrimPortion(
  line: { start: Point2D; end: Point2D },
  clickPoint: Point2D,
  intersections: Point2D[]
): { trimStart: Point2D; trimEnd: Point2D } | null {
  if (intersections.length === 0) {
    // No intersections - trim entire line
    return { trimStart: line.start, trimEnd: line.end }
  }
  
  // Project click point onto line to get position along it
  const dx = line.end.x - line.start.x
  const dy = line.end.y - line.start.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 0.001) return null
  
  const t = ((clickPoint.x - line.start.x) * dx + (clickPoint.y - line.start.y) * dy) / (len * len)
  
  // Sort intersections by their position along the line
  const sortedIntersections = intersections.map(p => {
    const pt = ((p.x - line.start.x) * dx + (p.y - line.start.y) * dy) / (len * len)
    return { point: p, t: pt }
  }).sort((a, b) => a.t - b.t)
  
  // Find which segment the click is in
  let trimStart = line.start
  let trimEnd = line.end
  
  for (let i = 0; i <= sortedIntersections.length; i++) {
    const segStart = i === 0 ? 0 : sortedIntersections[i - 1].t
    const segEnd = i === sortedIntersections.length ? 1 : sortedIntersections[i].t
    
    if (t >= segStart && t <= segEnd) {
      trimStart = i === 0 ? line.start : sortedIntersections[i - 1].point
      trimEnd = i === sortedIntersections.length ? line.end : sortedIntersections[i].point
      break
    }
  }
  
  return { trimStart, trimEnd }
}

// Check if a point is near a line segment
function isPointNearLine(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D,
  threshold: number
): boolean {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 0.001) return distance(point, lineStart) < threshold
  
  // Project point onto line
  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (len * len)))
  const proj = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
    z: 0
  }
  
  return distance(point, proj) < threshold
}

// Check if a point is near a circle
function isPointNearCircle(
  point: Point2D,
  center: Point2D,
  radius: number,
  threshold: number
): boolean {
  const d = distance(point, center)
  return Math.abs(d - radius) < threshold
}

// Check if a point is near an entity's endpoint (for extend tool)
function isPointNearEndpoint(
  point: Point2D,
  entity: any,
  threshold: number
): { near: boolean; endpoint?: Point2D; whichEnd?: 'start' | 'end' } {
  if (entity.type === 'line') {
    const dStart = distance(point, entity.data.start)
    const dEnd = distance(point, entity.data.end)
    
    if (dStart < threshold && dStart < dEnd) {
      return { near: true, endpoint: entity.data.start, whichEnd: 'start' }
    }
    if (dEnd < threshold) {
      return { near: true, endpoint: entity.data.end, whichEnd: 'end' }
    }
  }
  else if (entity.type === 'arc') {
    const startPoint = {
      x: entity.data.center.x + entity.data.radius * Math.cos(entity.data.startAngle),
      y: entity.data.center.y + entity.data.radius * Math.sin(entity.data.startAngle),
      z: 0
    }
    const endPoint = {
      x: entity.data.center.x + entity.data.radius * Math.cos(entity.data.endAngle),
      y: entity.data.center.y + entity.data.radius * Math.sin(entity.data.endAngle),
      z: 0
    }
    
    const dStart = distance(point, startPoint)
    const dEnd = distance(point, endPoint)
    
    if (dStart < threshold && dStart < dEnd) {
      return { near: true, endpoint: startPoint, whichEnd: 'start' }
    }
    if (dEnd < threshold) {
      return { near: true, endpoint: endPoint, whichEnd: 'end' }
    }
  }
  
  return { near: false }
}

// ============ Offset Calculation Utilities ============

// Calculate offset points for a line segment
function offsetLine(
  start: Point2D, 
  end: Point2D, 
  distance: number
): { start: Point2D; end: Point2D } {
  // Calculate perpendicular direction
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.sqrt(dx * dx + dy * dy)
  
  if (len < 0.001) {
    return { start, end }
  }
  
  // Perpendicular unit vector (rotate 90 degrees)
  const nx = -dy / len
  const ny = dx / len
  
  return {
    start: { x: start.x + nx * distance, y: start.y + ny * distance, z: 0 },
    end: { x: end.x + nx * distance, y: end.y + ny * distance, z: 0 }
  }
}

// Calculate offset for a circle
function offsetCircle(
  center: Point2D,
  radius: number,
  distance: number
): { center: Point2D; radius: number } {
  // Positive distance = outward (larger circle)
  // Negative distance = inward (smaller circle)
  const newRadius = Math.max(0.1, radius + distance)
  return { center, radius: newRadius }
}

// Calculate offset for an arc
function offsetArc(
  center: Point2D,
  radius: number,
  startAngle: number,
  endAngle: number,
  distance: number
): { center: Point2D; radius: number; startAngle: number; endAngle: number } {
  const newRadius = Math.max(0.1, radius + distance)
  return { center, radius: newRadius, startAngle, endAngle }
}

// Calculate offset for a rectangle (returns 4 corner points)
function offsetRectangle(
  corner1: Point2D,
  corner2: Point2D,
  distance: number
): { corner1: Point2D; corner2: Point2D } {
  // Determine which corner is min and which is max
  const minX = Math.min(corner1.x, corner2.x)
  const maxX = Math.max(corner1.x, corner2.x)
  const minY = Math.min(corner1.y, corner2.y)
  const maxY = Math.max(corner1.y, corner2.y)
  
  // Offset expands outward for positive distance
  return {
    corner1: { x: minX - distance, y: minY - distance, z: 0 },
    corner2: { x: maxX + distance, y: maxY + distance, z: 0 }
  }
}

// Calculate offset for a polygon
function offsetPolygon(
  center: Point2D,
  radius: number,
  sides: number,
  rotation: number,
  inscribed: boolean,
  distance: number
): { center: Point2D; radius: number } {
  // For polygons, offset adjusts the radius
  const newRadius = Math.max(0.1, radius + distance)
  return { center, radius: newRadius }
}

// Get offset preview for an entity
function getEntityOffsetPreview(
  entity: any,
  distance: number
): any {
  switch (entity.type) {
    case 'line':
      if (entity.data.start && entity.data.end) {
        const offset = offsetLine(entity.data.start, entity.data.end, distance)
        return { type: 'line', data: { start: offset.start, end: offset.end } }
      }
      break
    case 'circle':
      if (entity.data.center && entity.data.radius) {
        const offset = offsetCircle(entity.data.center, entity.data.radius, distance)
        return { type: 'circle', data: offset }
      }
      break
    case 'arc':
      if (entity.data.center && entity.data.radius) {
        const offset = offsetArc(
          entity.data.center, 
          entity.data.radius, 
          entity.data.startAngle, 
          entity.data.endAngle, 
          distance
        )
        return { type: 'arc', data: offset }
      }
      break
    case 'rectangle':
      if (entity.data.corner1 && entity.data.corner2) {
        const offset = offsetRectangle(entity.data.corner1, entity.data.corner2, distance)
        return { type: 'rectangle', data: offset }
      }
      break
    case 'polygon':
      if (entity.data.center && entity.data.radius) {
        const offset = offsetPolygon(
          entity.data.center,
          entity.data.radius,
          entity.data.sides,
          entity.data.rotation,
          entity.data.inscribed,
          distance
        )
        return { 
          type: 'polygon', 
          data: { 
            ...entity.data, 
            radius: offset.radius 
          } 
        }
      }
      break
  }
  return null
}

// Check if a point is near any entity (for selection)
function findEntityAtPoint(
  point: Point2D,
  entities: any[],
  threshold: number
): { entity: any; index: number } | null {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    
    if (entity.type === 'line' && entity.data.start && entity.data.end) {
      if (isPointNearLine(point, entity.data.start, entity.data.end, threshold)) {
        return { entity, index: i }
      }
    }
    else if (entity.type === 'circle' && entity.data.center && entity.data.radius) {
      if (isPointNearCircle(point, entity.data.center, entity.data.radius, threshold)) {
        return { entity, index: i }
      }
    }
    else if (entity.type === 'rectangle' && entity.data.corner1 && entity.data.corner2) {
      const c1 = entity.data.corner1
      const c2 = entity.data.corner2
      const corners = [
        c1,
        { x: c2.x, y: c1.y, z: 0 },
        c2,
        { x: c1.x, y: c2.y, z: 0 }
      ]
      for (let j = 0; j < 4; j++) {
        if (isPointNearLine(point, corners[j], corners[(j + 1) % 4], threshold)) {
          return { entity, index: i }
        }
      }
    }
    else if (entity.type === 'arc' && entity.data.center && entity.data.radius) {
      // Check if near arc curve
      const d = distance(point, entity.data.center)
      if (Math.abs(d - entity.data.radius) < threshold) {
        const angle = Math.atan2(point.y - entity.data.center.y, point.x - entity.data.center.x)
        if (isAngleInArc(angle, entity.data.startAngle, entity.data.endAngle)) {
          return { entity, index: i }
        }
      }
    }
    else if (entity.type === 'polygon' && entity.data.center && entity.data.radius) {
      // Check if near polygon edges
      const sides = entity.data.sides
      const rotation = entity.data.rotation || 0
      const radius = entity.data.radius
      const center = entity.data.center
      
      for (let j = 0; j < sides; j++) {
        const angle1 = rotation + (j * 2 * Math.PI / sides)
        const angle2 = rotation + ((j + 1) * 2 * Math.PI / sides)
        const p1 = { x: center.x + radius * Math.cos(angle1), y: center.y + radius * Math.sin(angle1), z: 0 }
        const p2 = { x: center.x + radius * Math.cos(angle2), y: center.y + radius * Math.sin(angle2), z: 0 }
        if (isPointNearLine(point, p1, p2, threshold)) {
          return { entity, index: i }
        }
      }
    }
  }
  
  return null
}

// ============ Mirror Calculation Utilities ============

// Mirror a point across a line defined by two points
function mirrorPoint(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D
): Point2D {
  // Line direction vector
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const len = Math.sqrt(dx * dx + dy * dy)
  
  if (len < 0.0001) return point
  
  // Normalize
  const nx = dx / len
  const ny = dy / len
  
  // Vector from line start to point
  const px = point.x - lineStart.x
  const py = point.y - lineStart.y
  
  // Project onto line
  const dot = px * nx + py * ny
  const projX = lineStart.x + dot * nx
  const projY = lineStart.y + dot * ny
  
  // Mirror: point + 2 * (projection - point)
  return {
    x: 2 * projX - point.x,
    y: 2 * projY - point.y,
    z: 0
  }
}

// Mirror a line entity across a mirror line
function mirrorLineEntity(
  lineStart: Point2D,
  lineEnd: Point2D,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): { start: Point2D; end: Point2D } {
  return {
    start: mirrorPoint(lineStart, mirrorStart, mirrorEnd),
    end: mirrorPoint(lineEnd, mirrorStart, mirrorEnd)
  }
}

// Mirror a circle entity across a mirror line
function mirrorCircleEntity(
  center: Point2D,
  radius: number,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): { center: Point2D; radius: number } {
  return {
    center: mirrorPoint(center, mirrorStart, mirrorEnd),
    radius: radius // Radius stays the same
  }
}

// Mirror an arc entity across a mirror line
function mirrorArcEntity(
  center: Point2D,
  radius: number,
  startAngle: number,
  endAngle: number,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): { center: Point2D; radius: number; startAngle: number; endAngle: number } {
  const newCenter = mirrorPoint(center, mirrorStart, mirrorEnd)
  
  // Calculate the mirror line angle
  const mirrorAngle = Math.atan2(mirrorEnd.y - mirrorStart.y, mirrorEnd.x - mirrorStart.x)
  
  // Mirror the angles across the mirror line
  const newStartAngle = 2 * mirrorAngle - endAngle
  const newEndAngle = 2 * mirrorAngle - startAngle
  
  return {
    center: newCenter,
    radius: radius,
    startAngle: newStartAngle,
    endAngle: newEndAngle
  }
}

// Mirror a rectangle entity across a mirror line
function mirrorRectangleEntity(
  corner1: Point2D,
  corner2: Point2D,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): { corner1: Point2D; corner2: Point2D } {
  return {
    corner1: mirrorPoint(corner1, mirrorStart, mirrorEnd),
    corner2: mirrorPoint(corner2, mirrorStart, mirrorEnd)
  }
}

// Mirror a polygon entity across a mirror line
function mirrorPolygonEntity(
  center: Point2D,
  radius: number,
  sides: number,
  rotation: number,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): { center: Point2D; radius: number; sides: number; rotation: number } {
  const newCenter = mirrorPoint(center, mirrorStart, mirrorEnd)
  
  // Calculate the mirror line angle
  const mirrorAngle = Math.atan2(mirrorEnd.y - mirrorStart.y, mirrorEnd.x - mirrorStart.x)
  
  // Mirror the rotation
  const newRotation = 2 * mirrorAngle - rotation
  
  return {
    center: newCenter,
    radius: radius,
    sides: sides,
    rotation: newRotation
  }
}

// Mirror a spline entity across a mirror line
function mirrorSplineEntity(
  points: Point2D[],
  closed: boolean,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): { points: Point2D[]; closed: boolean } {
  const mirroredPoints = points.map(p => mirrorPoint(p, mirrorStart, mirrorEnd))
  return {
    points: mirroredPoints,
    closed: closed
  }
}

// Get mirrored copy of an entity
function getMirroredEntity(
  entity: any,
  mirrorStart: Point2D,
  mirrorEnd: Point2D
): any {
  switch (entity.type) {
    case 'line':
      if (entity.data.start && entity.data.end) {
        const mirrored = mirrorLineEntity(
          entity.data.start, entity.data.end,
          mirrorStart, mirrorEnd
        )
        return { type: 'line', construction: entity.construction, data: mirrored }
      }
      break
    case 'circle':
      if (entity.data.center && entity.data.radius) {
        const mirrored = mirrorCircleEntity(
          entity.data.center, entity.data.radius,
          mirrorStart, mirrorEnd
        )
        return { type: 'circle', construction: entity.construction, data: mirrored }
      }
      break
    case 'arc':
      if (entity.data.center && entity.data.radius) {
        const mirrored = mirrorArcEntity(
          entity.data.center, entity.data.radius,
          entity.data.startAngle, entity.data.endAngle,
          mirrorStart, mirrorEnd
        )
        return { type: 'arc', construction: entity.construction, data: mirrored }
      }
      break
    case 'rectangle':
      if (entity.data.corner1 && entity.data.corner2) {
        const mirrored = mirrorRectangleEntity(
          entity.data.corner1, entity.data.corner2,
          mirrorStart, mirrorEnd
        )
        return { type: 'rectangle', construction: entity.construction, data: mirrored }
      }
      break
    case 'polygon':
      if (entity.data.center && entity.data.radius) {
        const mirrored = mirrorPolygonEntity(
          entity.data.center, entity.data.radius,
          entity.data.sides, entity.data.rotation || 0,
          mirrorStart, mirrorEnd
        )
        return { 
          type: 'polygon', 
          construction: entity.construction, 
          data: { 
            ...entity.data, 
            center: mirrored.center, 
            rotation: mirrored.rotation 
          } 
        }
      }
      break
    case 'spline':
      if (entity.data.points) {
        const mirrored = mirrorSplineEntity(
          entity.data.points, entity.data.closed,
          mirrorStart, mirrorEnd
        )
        return { type: 'spline', construction: entity.construction, data: mirrored }
      }
      break
    case 'point':
      if (entity.data.position) {
        const mirroredPos = mirrorPoint(entity.data.position, mirrorStart, mirrorEnd)
        return { type: 'point', construction: entity.construction, data: { position: mirroredPos } }
      }
      break
  }
  return null
}

// Find line entities at a point (for mirror line selection)
function findLineEntityAtPoint(
  point: Point2D,
  entities: any[],
  threshold: number
): { entity: any; index: number } | null {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    
    if (entity.type === 'line' && entity.data.start && entity.data.end) {
      if (isPointNearLine(point, entity.data.start, entity.data.end, threshold)) {
        return { entity, index: i }
      }
    }
  }
  return null
}

export function SketchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  const [zoom, setZoom] = useState(5)
  const [pan, setPan] = useState<CanvasPoint>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<CanvasPoint | null>(null)
  
  const {
    sketchMode,
    activeTool,
    drawing,
    cursorStyle,
    startDrawing,
    updatePreviewPoint,
    addDrawingPoint,
    finishDrawing,
    cancelDrawing,
    setDrawingInferences,
    setDrawingConstraints,
    setModifierKeys,
    showDimensionInput,
    hideDimensionInput,
    toggleArcMode,
    setPolygonSides,
    setOffsetDistance,
    toggleOffsetDirection,
    setSelectedEntityIds,
    addSelectedEntityId,
    clearSelectedEntityIds,
    setMirrorLineId,
    setMirrorMode,
    clearMirrorState,
    addNotification,
    setActiveTool
  } = useUIStore()
  
  const { addSketchEntity, addSketchConstraint, deleteSketchConstraint, updateEntityConstraintStatus, document } = useDocumentStore()
  
  // Get current sketch
  const sketch = sketchMode && document?.partStudios
    .find(ps => ps.id === sketchMode.partStudioId)
    ?.sketches.get(sketchMode.sketchId!)
  
  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const canvasPoint: CanvasPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    // Handle panning
    if (isPanning && lastMousePos) {
      const dx = canvasPoint.x - lastMousePos.x
      const dy = canvasPoint.y - lastMousePos.y
      setPan(p => ({
        x: p.x - dx / zoom,
        y: p.y + dy / zoom
      }))
      setLastMousePos(canvasPoint)
      return
    }
    
    // Update preview point for drawing tools
    if (activeTool && activeTool !== 'select') {
      let worldPoint = canvasToWorld(canvasPoint, canvas, zoom, pan)
      const inferences: InferenceInfo[] = []
      const constraints: ConstraintType[] = []
      
      // Apply grid snap by default
      const snappedPoint = snapToGrid(worldPoint, GRID_SIZE)
      let snap: SnapInfo | undefined
      
      // Check if close to grid snap point
      const snapDist = distance(
        worldToCanvas(snappedPoint, canvas, zoom, pan),
        canvasPoint
      )
      if (snapDist < SNAP_DISTANCE) {
        worldPoint = snappedPoint
        snap = { type: 'grid', point: snappedPoint }
      }
      
      // Check H/V inference when drawing lines with existing points
      if ((activeTool === 'line' || activeTool === 'arc-tangent') && drawing.points.length > 0) {
        const lastPoint = drawing.points[drawing.points.length - 1]
        const shiftHeld = drawing.shiftHeld || e.shiftKey
        
        if (shiftHeld) {
          // Force horizontal or vertical
          const dx = Math.abs(worldPoint.x - lastPoint.x)
          const dy = Math.abs(worldPoint.y - lastPoint.y)
          
          if (dx > dy) {
            worldPoint = { ...worldPoint, y: lastPoint.y }
            constraints.push('horizontal')
            inferences.push({
              type: 'horizontal',
              from: lastPoint,
              to: worldPoint
            })
          } else {
            worldPoint = { ...worldPoint, x: lastPoint.x }
            constraints.push('vertical')
            inferences.push({
              type: 'vertical',
              from: lastPoint,
              to: worldPoint
            })
          }
        } else {
          // Auto-detect near-horizontal/vertical
          const hvResult = checkHVInference(lastPoint, worldPoint, 3)
          if (hvResult.type) {
            inferences.push({
              type: hvResult.type,
              from: lastPoint,
              to: hvResult.constrainedPoint
            })
          }
        }
        
        // Check for closing the loop - snap to first point
        if (drawing.points.length >= 2) {
          const firstPoint = drawing.points[0]
          const distToFirst = distance(worldPoint, firstPoint)
          if (distToFirst < GRID_SIZE * 2) {
            worldPoint = firstPoint
            snap = { type: 'endpoint', point: firstPoint }
          }
        }
      }
      
      // Check origin snap
      const distToOrigin = distance(worldPoint, { x: 0, y: 0, z: 0 })
      if (distToOrigin < GRID_SIZE) {
        worldPoint = { x: 0, y: 0, z: 0 }
        snap = { type: 'origin', point: worldPoint }
      }
      
      setDrawingInferences(inferences)
      setDrawingConstraints(constraints)
      updatePreviewPoint(worldPoint, snap)
    }
    
    setLastMousePos(canvasPoint)
  }, [activeTool, drawing, isPanning, lastMousePos, zoom, pan, updatePreviewPoint, setDrawingInferences, setDrawingConstraints])
  
  // Handle mouse down
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Middle button or Alt+Left for panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setLastMousePos({ x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top })
      return
    }
    
    // Left click for drawing
    if (e.button === 0 && !e.altKey) {
      handleClick(e)
    }
  }, [])
  
  // Handle mouse up
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 1 || isPanning) {
      setIsPanning(false)
    }
  }, [isPanning])
  
  // Handle click for tool operations
  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas || !activeTool || activeTool === 'select') return
    
    const rect = canvas.getBoundingClientRect()
    const canvasPoint: CanvasPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    let worldPoint = canvasToWorld(canvasPoint, canvas, zoom, pan)
    
    // Apply snapping
    if (drawing.snap) {
      worldPoint = drawing.snap.point
    } else {
      worldPoint = snapToGrid(worldPoint, GRID_SIZE)
    }
    
    // Apply constraint if shift is held
    if (drawing.shiftHeld && drawing.points.length > 0 && activeTool === 'line') {
      const lastPoint = drawing.points[drawing.points.length - 1]
      const dx = Math.abs(worldPoint.x - lastPoint.x)
      const dy = Math.abs(worldPoint.y - lastPoint.y)
      if (dx > dy) {
        worldPoint = { ...worldPoint, y: lastPoint.y }
      } else {
        worldPoint = { ...worldPoint, x: lastPoint.x }
      }
    }
    
    // Line tool
    if (activeTool === 'line') {
      if (!drawing.isActive) {
        startDrawing('line')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click next point or double-click to finish')
      } else {
        // Create line segment
        if (drawing.points.length > 0) {
          const lastPoint = drawing.points[drawing.points.length - 1]
          
          // Check if closing loop
          if (drawing.points.length >= 2) {
            const firstPoint = drawing.points[0]
            if (distance(worldPoint, firstPoint) < GRID_SIZE) {
              // Close the loop
              addSketchEntity(sketchMode!.sketchId!, {
                type: 'line',
                construction: false,
                data: { start: lastPoint, end: firstPoint }
              })
              finishDrawing()
              addNotification('success', 'Closed profile created')
              return
            }
          }
          
          addSketchEntity(sketchMode!.sketchId!, {
            type: 'line',
            construction: false,
            data: { start: lastPoint, end: worldPoint }
          })
          
          // Show dimension input
          const midX = (lastPoint.x + worldPoint.x) / 2
          const midY = (lastPoint.y + worldPoint.y) / 2
          const length = distance(lastPoint, worldPoint)
          showDimensionInput('length', { x: midX, y: midY, z: 0 }, Math.round(length * 10) / 10)
        }
        
        addDrawingPoint(worldPoint)
      }
    }
    
    // Circle center-radius tool
    else if (activeTool === 'circle-center') {
      if (!drawing.isActive) {
        startDrawing('circle-center')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click to set radius or type diameter')
      } else {
        const center = drawing.points[0]
        const radius = distance(center, worldPoint)
        
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'circle',
          construction: false,
          data: { center, radius }
        })
        
        // Show diameter dimension
        showDimensionInput('diameter', { x: center.x + radius, y: center.y, z: 0 }, Math.round(radius * 2 * 10) / 10)
        
        finishDrawing()
        addNotification('success', `Circle created (⌀${Math.round(radius * 2)})`)
      }
    }
    
    // Circle two-point tool
    else if (activeTool === 'circle-two-point') {
      if (!drawing.isActive) {
        startDrawing('circle-two-point')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click second diameter point')
      } else {
        const p1 = drawing.points[0]
        const p2 = worldPoint
        const center: Point2D = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
          z: 0
        }
        const radius = distance(p1, p2) / 2
        
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'circle',
          construction: false,
          data: { center, radius }
        })
        
        showDimensionInput('diameter', { x: center.x, y: center.y + radius, z: 0 }, Math.round(radius * 2 * 10) / 10)
        
        finishDrawing()
        addNotification('success', `Circle created (⌀${Math.round(radius * 2)})`)
      }
    }
    
    // Corner-to-Corner Rectangle tool
    else if (activeTool === 'rectangle-corner') {
      if (!drawing.isActive) {
        startDrawing('rectangle-corner')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click opposite corner (hold Alt for square)')
      } else {
        const corner1 = drawing.points[0]
        let corner2 = worldPoint
        
        // Apply square constraint if Alt is held
        if (drawing.altHeld || e.altKey) {
          const dx = corner2.x - corner1.x
          const dy = corner2.y - corner1.y
          const size = Math.max(Math.abs(dx), Math.abs(dy))
          corner2 = {
            x: corner1.x + Math.sign(dx) * size,
            y: corner1.y + Math.sign(dy) * size,
            z: 0
          }
        }
        
        // Store as 4 lines for proper constraint handling
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'rectangle',
          construction: false,
          data: { 
            corner1, 
            corner2,
            isSquare: drawing.altHeld || e.altKey,
            mode: 'corner'
          }
        })
        
        finishDrawing()
        const width = Math.abs(corner2.x - corner1.x)
        const height = Math.abs(corner2.y - corner1.y)
        
        // Show dimension inputs for width and height
        showDimensionInput('width', { 
          x: (corner1.x + corner2.x) / 2, 
          y: Math.min(corner1.y, corner2.y) - 5, 
          z: 0 
        }, Math.round(width * 10) / 10)
        
        if (drawing.altHeld || e.altKey) {
          addNotification('success', `Square created (${Math.round(width)}×${Math.round(height)})`)
        } else {
          addNotification('success', `Rectangle created (${Math.round(width)}×${Math.round(height)})`)
        }
      }
    }
    
    // Center-to-Corner Rectangle tool
    else if (activeTool === 'rectangle-center') {
      if (!drawing.isActive) {
        startDrawing('rectangle-center')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click corner to define size (hold Alt for square)')
      } else {
        const center = drawing.points[0]
        let corner = worldPoint
        
        // Calculate half dimensions
        let halfWidth = Math.abs(corner.x - center.x)
        let halfHeight = Math.abs(corner.y - center.y)
        
        // Apply square constraint if Alt is held
        if (drawing.altHeld || e.altKey) {
          const maxHalf = Math.max(halfWidth, halfHeight)
          halfWidth = maxHalf
          halfHeight = maxHalf
        }
        
        // Calculate actual corners from center
        const corner1: Point2D = {
          x: center.x - halfWidth,
          y: center.y - halfHeight,
          z: 0
        }
        const corner2: Point2D = {
          x: center.x + halfWidth,
          y: center.y + halfHeight,
          z: 0
        }
        
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'rectangle',
          construction: false,
          data: { 
            corner1, 
            corner2,
            center,
            isSquare: drawing.altHeld || e.altKey,
            mode: 'center'
          }
        })
        
        finishDrawing()
        const width = halfWidth * 2
        const height = halfHeight * 2
        
        // Show dimension input
        showDimensionInput('width', { 
          x: center.x, 
          y: corner1.y - 5, 
          z: 0 
        }, Math.round(width * 10) / 10)
        
        if (drawing.altHeld || e.altKey) {
          addNotification('success', `Centered square created (${Math.round(width)}×${Math.round(height)})`)
        } else {
          addNotification('success', `Centered rectangle created (${Math.round(width)}×${Math.round(height)})`)
        }
      }
    }
    
    // 3-Point Arc tool (start, end, bulge)
    else if (activeTool === 'arc-3point') {
      if (!drawing.isActive) {
        startDrawing('arc-3point')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click to place second endpoint')
      } else if (drawing.points.length === 1) {
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click to set arc curvature (bulge point)')
      } else if (drawing.points.length === 2) {
        // Calculate arc from 3 points
        const p1 = drawing.points[0]
        const p2 = drawing.points[1]
        const p3 = worldPoint
        
        const arcData = calculateArcFrom3Points(p1, p2, p3)
        
        if (arcData) {
          addSketchEntity(sketchMode!.sketchId!, {
            type: 'arc',
            construction: false,
            data: { 
              center: arcData.center, 
              radius: arcData.radius, 
              startAngle: arcData.startAngle, 
              endAngle: arcData.endAngle,
              clockwise: arcData.clockwise,
              startPoint: p1,
              endPoint: p2
            }
          })
          
          // Show radius dimension
          showDimensionInput('radius', { 
            x: arcData.center.x + arcData.radius * 0.7, 
            y: arcData.center.y, 
            z: 0 
          }, Math.round(arcData.radius * 10) / 10)
          
          finishDrawing()
          addNotification('success', `Arc created (R${Math.round(arcData.radius)})`)
        } else {
          addNotification('warning', 'Points are collinear - cannot create arc')
          finishDrawing()
        }
      }
    }
    
    // Center-Start-End Arc tool
    else if (activeTool === 'arc-center') {
      if (!drawing.isActive) {
        startDrawing('arc-center')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click to place start point on arc')
      } else if (drawing.points.length === 1) {
        addDrawingPoint(worldPoint)
        const center = drawing.points[0]
        const radius = distance(center, worldPoint)
        addNotification('info', `Radius: ${radius.toFixed(1)} - Click to set arc end point`)
      } else if (drawing.points.length === 2) {
        const center = drawing.points[0]
        const startPoint = drawing.points[1]
        const endPoint = worldPoint
        
        const radius = distance(center, startPoint)
        const startAngle = angleRadians(center, startPoint)
        const endAngle = angleRadians(center, endPoint)
        
        // Calculate sweep angle for display
        let sweep = endAngle - startAngle
        if (sweep < 0) sweep += Math.PI * 2
        const sweepDegrees = sweep * 180 / Math.PI
        
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'arc',
          construction: false,
          data: { 
            center, 
            radius, 
            startAngle, 
            endAngle,
            clockwise: false,
            startPoint,
            endPoint
          }
        })
        
        // Show radius dimension
        showDimensionInput('radius', { 
          x: center.x + radius, 
          y: center.y, 
          z: 0 
        }, Math.round(radius * 10) / 10)
        
        finishDrawing()
        addNotification('success', `Arc created (R${Math.round(radius)}, ${Math.round(sweepDegrees)}°)`)
      }
    }
    
    // Point tool
    else if (activeTool === 'point') {
      addSketchEntity(sketchMode!.sketchId!, {
        type: 'point',
        construction: false,
        data: { position: worldPoint }
      })
      addNotification('success', `Point placed at (${Math.round(worldPoint.x)}, ${Math.round(worldPoint.y)})`)
    }
    
    // Inscribed Polygon tool (vertices on circle)
    else if (activeTool === 'polygon-inscribed') {
      if (!drawing.isActive) {
        startDrawing('polygon-inscribed')
        addDrawingPoint(worldPoint)
        addNotification('info', `${drawing.polygonSides}-sided polygon • Type 3-64 to change sides`)
      } else {
        const center = drawing.points[0]
        const radius = distance(center, worldPoint)
        const angle = angleRadians(center, worldPoint)
        const sides = drawing.polygonSides
        
        // Create polygon entity with vertices on circle
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'polygon',
          construction: false,
          data: { 
            center, 
            radius, 
            sides,
            rotation: angle,
            inscribed: true
          }
        })
        
        // Also add construction circle
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'circle',
          construction: true,
          data: { center, radius }
        })
        
        // Show radius dimension
        showDimensionInput('radius', { 
          x: center.x + radius, 
          y: center.y, 
          z: 0 
        }, Math.round(radius * 10) / 10)
        
        finishDrawing()
        addNotification('success', `Inscribed ${sides}-gon created (R${Math.round(radius)})`)
      }
    }
    
    // Circumscribed Polygon tool (sides tangent to circle)
    else if (activeTool === 'polygon-circumscribed') {
      if (!drawing.isActive) {
        startDrawing('polygon-circumscribed')
        addDrawingPoint(worldPoint)
        addNotification('info', `${drawing.polygonSides}-sided polygon • Type 3-64 to change sides`)
      } else {
        const center = drawing.points[0]
        const apothem = distance(center, worldPoint) // Distance to side midpoint
        const angle = angleRadians(center, worldPoint)
        const sides = drawing.polygonSides
        
        // Calculate circumradius from apothem: circumradius = apothem / cos(π/sides)
        const circumradius = apothem / Math.cos(Math.PI / sides)
        
        // Create polygon entity with sides tangent to circle
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'polygon',
          construction: false,
          data: { 
            center, 
            radius: circumradius,
            apothem,
            sides,
            rotation: angle + Math.PI / sides, // Rotate so side faces cursor
            inscribed: false
          }
        })
        
        // Also add construction circle (tangent to sides)
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'circle',
          construction: true,
          data: { center, radius: apothem }
        })
        
        // Show apothem dimension
        showDimensionInput('radius', { 
          x: center.x + apothem, 
          y: center.y, 
          z: 0 
        }, Math.round(apothem * 10) / 10)
        
        finishDrawing()
        addNotification('success', `Circumscribed ${sides}-gon created (apothem ${Math.round(apothem)})`)
      }
    }
    
    // Spline tool
    else if (activeTool === 'spline') {
      if (!drawing.isActive) {
        startDrawing('spline')
        addDrawingPoint(worldPoint)
        addNotification('info', 'Click to add points • Double-click to finish')
      } else {
        // Check if closing the spline (clicking near first point)
        if (drawing.points.length >= 3) {
          const firstPoint = drawing.points[0]
          const distToFirst = distance(worldPoint, firstPoint)
          if (distToFirst < GRID_SIZE * 1.5) {
            // Close the spline
            const splinePoints = [...drawing.points]
            addSketchEntity(sketchMode!.sketchId!, {
              type: 'spline',
              construction: false,
              data: { 
                points: splinePoints,
                closed: true,
                handles: calculateSplineHandles(splinePoints, true)
              }
            })
            finishDrawing()
            addNotification('success', `Closed spline created with ${splinePoints.length} points`)
            return
          }
        }
        
        // Add another point to the spline
        addDrawingPoint(worldPoint)
      }
    }
    
    // Trim tool
    else if (activeTool === 'trim') {
      // Get all sketch entities
      const entities = sketch?.entities || []
      
      // Find which entity segment was clicked
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        let clickedSegment = false
        
        if (entity.type === 'line' && entity.data.start && entity.data.end) {
          if (isPointNearLine(worldPoint, entity.data.start, entity.data.end, GRID_SIZE * 2)) {
            clickedSegment = true
            
            // Find intersections with other entities
            const intersections = findEntityIntersections(entity, entities, i)
            const trimPortion = getLineTrimPortion(entity.data as any, worldPoint, intersections)
            
            if (trimPortion) {
              if (intersections.length === 0) {
                // No intersections - delete entire entity
                // For now, notify user (actual deletion would require store update)
                addNotification('info', 'Line has no intersections - would be deleted')
              } else {
                // Trim to nearest intersection
                addNotification('success', `Line trimmed at intersection`)
              }
            }
          }
        }
        else if (entity.type === 'circle' && entity.data.center && entity.data.radius) {
          if (isPointNearCircle(worldPoint, entity.data.center, entity.data.radius, GRID_SIZE * 2)) {
            clickedSegment = true
            addNotification('info', 'Trimming circles converts them to arcs')
          }
        }
        else if (entity.type === 'rectangle' && entity.data.corner1 && entity.data.corner2) {
          const c1 = entity.data.corner1
          const c2 = entity.data.corner2
          const corners = [
            c1,
            { x: c2.x, y: c1.y, z: 0 },
            c2,
            { x: c1.x, y: c2.y, z: 0 }
          ]
          for (let j = 0; j < 4; j++) {
            if (isPointNearLine(worldPoint, corners[j], corners[(j + 1) % 4], GRID_SIZE * 2)) {
              clickedSegment = true
              addNotification('info', 'Trimming rectangle edge')
              break
            }
          }
        }
        
        if (clickedSegment) break
      }
    }
    
    // Extend tool
    else if (activeTool === 'extend') {
      const entities = sketch?.entities || []
      
      // Check if clicking near an endpoint
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        const endpointCheck = isPointNearEndpoint(worldPoint, entity, GRID_SIZE * 2)
        
        if (endpointCheck.near && endpointCheck.endpoint) {
          addNotification('info', `Extend from ${endpointCheck.whichEnd} endpoint - drag to extend`)
          // In a full implementation, would start drag mode here
          break
        }
      }
    }
    
    // Offset tool
    else if (activeTool === 'offset') {
      const entities = sketch?.entities || []
      const entityIds = sketch?.entities?.map(e => e.id) || []
      
      // Check if we already have entities selected
      if (drawing.selectedEntityIds.length > 0) {
        // If clicking away from selected entities, create the offset
        const found = findEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
        
        if (!found) {
          // Apply the offset - create new entities
          drawing.selectedEntityIds.forEach(id => {
            const entityIndex = entityIds.indexOf(id)
            if (entityIndex >= 0) {
              const entity = entities[entityIndex]
              const offsetDistance = drawing.offsetDistance * drawing.offsetDirection
              const offsetPreview = getEntityOffsetPreview(entity, offsetDistance)
              
              if (offsetPreview) {
                addSketchEntity(sketchMode!.sketchId!, {
                  type: offsetPreview.type,
                  construction: false,
                  data: offsetPreview.data
                })
              }
            }
          })
          
          addNotification('success', `Offset applied: ${drawing.offsetDistance}mm`)
          clearSelectedEntityIds()
        } else {
          // Toggle selection if clicking on another entity
          const clickedId = entityIds[found.index]
          if (drawing.selectedEntityIds.includes(clickedId)) {
            // Deselect
            setSelectedEntityIds(drawing.selectedEntityIds.filter(id => id !== clickedId))
          } else {
            // Add to selection
            addSelectedEntityId(clickedId)
          }
        }
      } else {
        // Select entity for offset
        const found = findEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
        
        if (found) {
          const entityId = entityIds[found.index]
          addSelectedEntityId(entityId)
          addNotification('info', `Selected ${found.entity.type} for offset • Drag to set distance or type value`)
        }
      }
    }
    
    // Mirror tool
    else if (activeTool === 'mirror') {
      const entities = sketch?.entities || []
      const entityIds = sketch?.entities?.map(e => e.id) || []
      
      // Check if pre-selected entities exist (workflow 1: entities first)
      if (drawing.selectedEntityIds.length > 0 && !drawing.mirrorLineId) {
        // Look for a line to use as mirror axis
        const found = findLineEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
        
        if (found) {
          const lineId = entityIds[found.index]
          setMirrorLineId(lineId)
          setMirrorMode('preview')
          addNotification('info', 'Mirror line selected • Press Enter to apply, ESC to cancel')
        } else {
          addNotification('info', 'Click on a line to use as mirror axis')
        }
      }
      // No mirror line yet - check what mode we're in
      else if (!drawing.mirrorLineId) {
        // Try to find a line first (workflow 2: line first)
        const foundLine = findLineEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
        
        if (foundLine) {
          const lineId = entityIds[foundLine.index]
          setMirrorLineId(lineId)
          setMirrorMode('select-entities')
          addNotification('info', 'Mirror line set • Click entities to mirror')
        } else {
          // Try to select an entity instead
          const found = findEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
          
          if (found) {
            const entityId = entityIds[found.index]
            addSelectedEntityId(entityId)
            setMirrorMode('select-line')
            addNotification('info', `Selected ${found.entity.type} • Now click a line as mirror axis`)
          }
        }
      }
      // Mirror line is set - selecting entities to mirror
      else if (drawing.mirrorMode === 'select-entities') {
        const found = findEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
        
        if (found) {
          const entityId = entityIds[found.index]
          // Don't select the mirror line itself
          if (entityId !== drawing.mirrorLineId) {
            if (drawing.selectedEntityIds.includes(entityId)) {
              // Toggle off
              setSelectedEntityIds(drawing.selectedEntityIds.filter(id => id !== entityId))
            } else {
              // Add to selection
              addSelectedEntityId(entityId)
            }
            addNotification('info', `${drawing.selectedEntityIds.length + 1} entities selected • ESC to finish`)
          }
        }
      }
      // In preview mode - clicking applies the mirror
      else if (drawing.mirrorMode === 'preview') {
        // Apply mirror
        const mirrorLineEntity = entities.find((_, idx) => entityIds[idx] === drawing.mirrorLineId)
        
        if (mirrorLineEntity && mirrorLineEntity.data.start && mirrorLineEntity.data.end) {
          drawing.selectedEntityIds.forEach(id => {
            if (id === drawing.mirrorLineId) return // Don't mirror the mirror line
            
            const entityIndex = entityIds.indexOf(id)
            if (entityIndex >= 0) {
              const entity = entities[entityIndex]
              const mirrored = getMirroredEntity(
                entity,
                mirrorLineEntity.data.start,
                mirrorLineEntity.data.end
              )
              
              if (mirrored) {
                addSketchEntity(sketchMode!.sketchId!, mirrored)
              }
            }
          })
          
          addNotification('success', `Mirrored ${drawing.selectedEntityIds.length} entities`)
          clearMirrorState()
        }
      }
    }
    
    // Constraint tools
    else if (activeTool?.startsWith('constraint-')) {
      const constraintType = activeTool.replace('constraint-', '') as ConstraintType
      const entities = sketch?.entities || []
      const entityIds = entities.map((_, idx) => entities[idx]?.id).filter(Boolean) as string[]
      
      // Find what entity was clicked
      const found = findEntityAtPoint(worldPoint, entities, GRID_SIZE * 2)
      
      if (found) {
        const clickedEntityId = found.entity.id
        
        // If we don't have any selected entities yet, add this one
        if (drawing.selectedEntityIds.length === 0) {
          addSelectedEntityId(clickedEntityId)
          
          // For single-entity constraints (fixed, horizontal, vertical on a line)
          if (constraintType === 'fixed') {
            // Apply fixed constraint immediately
            addSketchConstraint(sketchMode!.sketchId!, {
              type: 'fixed',
              entityIds: [clickedEntityId],
              status: 'satisfied'
            })
            clearSelectedEntityIds()
            addNotification('success', 'Fixed constraint applied')
            updateEntityConstraintStatus(sketchMode!.sketchId!)
          } else if ((constraintType === 'horizontal' || constraintType === 'vertical') && found.entity.type === 'line') {
            // Apply horizontal/vertical constraint to single line
            addSketchConstraint(sketchMode!.sketchId!, {
              type: constraintType,
              entityIds: [clickedEntityId],
              status: 'satisfied'
            })
            clearSelectedEntityIds()
            addNotification('success', `${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)} constraint applied`)
            updateEntityConstraintStatus(sketchMode!.sketchId!)
          } else {
            addNotification('info', `Select second entity for ${constraintType} constraint`)
          }
        } else {
          // We have one entity selected, apply the constraint
          const firstEntityId = drawing.selectedEntityIds[0]
          const firstEntity = entities.find(e => e.id === firstEntityId)
          const secondEntity = found.entity
          
          // Validate constraint applicability
          let isValid = true
          let errorMsg = ''
          
          if (constraintType === 'parallel' || constraintType === 'perpendicular') {
            if (firstEntity?.type !== 'line' || secondEntity.type !== 'line') {
              isValid = false
              errorMsg = `${constraintType} requires two lines`
            }
          } else if (constraintType === 'concentric') {
            const validTypes = ['circle', 'arc']
            if (!validTypes.includes(firstEntity?.type || '') || !validTypes.includes(secondEntity.type)) {
              isValid = false
              errorMsg = 'Concentric requires two circles or arcs'
            }
          } else if (constraintType === 'equal') {
            // Equal works on lines or circles
            const firstIsLine = firstEntity?.type === 'line'
            const secondIsLine = secondEntity.type === 'line'
            const firstIsCircular = firstEntity?.type === 'circle' || firstEntity?.type === 'arc'
            const secondIsCircular = secondEntity.type === 'circle' || secondEntity.type === 'arc'
            
            if (!(firstIsLine && secondIsLine) && !(firstIsCircular && secondIsCircular)) {
              isValid = false
              errorMsg = 'Equal requires two lines or two circles/arcs'
            }
          } else if (constraintType === 'tangent') {
            // Tangent works between line and circle, or two circles
            const hasCircular = (firstEntity?.type === 'circle' || firstEntity?.type === 'arc' ||
                                secondEntity.type === 'circle' || secondEntity.type === 'arc')
            if (!hasCircular) {
              isValid = false
              errorMsg = 'Tangent requires at least one circle or arc'
            }
          } else if (constraintType === 'coincident') {
            // Coincident works on points or point-on-curve
            // For now, allow any entities
          } else if (constraintType === 'midpoint') {
            // Midpoint needs a point and a line
            const hasLine = firstEntity?.type === 'line' || secondEntity.type === 'line'
            const hasPoint = firstEntity?.type === 'point' || secondEntity.type === 'point'
            if (!hasLine) {
              isValid = false
              errorMsg = 'Midpoint requires a line'
            }
          }
          
          if (isValid) {
            addSketchConstraint(sketchMode!.sketchId!, {
              type: constraintType,
              entityIds: [firstEntityId, clickedEntityId],
              status: 'satisfied'
            })
            clearSelectedEntityIds()
            addNotification('success', `${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)} constraint applied`)
            updateEntityConstraintStatus(sketchMode!.sketchId!)
          } else {
            addNotification('warning', errorMsg)
            clearSelectedEntityIds()
          }
        }
      } else {
        // Clicked on empty space - clear selection
        if (drawing.selectedEntityIds.length > 0) {
          clearSelectedEntityIds()
          addNotification('info', 'Selection cleared')
        }
      }
    }
  }, [activeTool, drawing, zoom, pan, sketchMode, sketch, startDrawing, addDrawingPoint, finishDrawing, addSketchEntity, addSketchConstraint, updateEntityConstraintStatus, showDimensionInput, addNotification, clearSelectedEntityIds, setSelectedEntityIds, addSelectedEntityId, setMirrorLineId, setMirrorMode, clearMirrorState])
  
  // Handle double click to finish
  const handleDoubleClick = useCallback((e: MouseEvent) => {
    if (drawing.isActive && activeTool === 'line') {
      finishDrawing()
      addNotification('success', 'Line sequence completed')
    } else if (drawing.isActive && activeTool === 'spline') {
      // Finish spline on double-click
      if (drawing.points.length >= 2) {
        const splinePoints = [...drawing.points]
        addSketchEntity(sketchMode!.sketchId!, {
          type: 'spline',
          construction: false,
          data: { 
            points: splinePoints,
            closed: false,
            handles: calculateSplineHandles(splinePoints, false)
          }
        })
        finishDrawing()
        addNotification('success', `Spline created with ${splinePoints.length} points`)
      } else {
        cancelDrawing()
        addNotification('info', 'Spline needs at least 2 points')
      }
    }
  }, [drawing.isActive, drawing.points, activeTool, sketchMode, finishDrawing, cancelDrawing, addSketchEntity, addNotification])
  
  // Handle right click to cancel
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    if (drawing.isActive) {
      cancelDrawing()
      addNotification('info', 'Drawing cancelled')
    }
  }, [drawing.isActive, cancelDrawing, addNotification])
  
  // Handle keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Update modifier keys
    setModifierKeys(e.shiftKey, e.ctrlKey, e.altKey)
    
    // ESC - cancel or deselect tool
    if (e.key === 'Escape') {
      if (drawing.isActive) {
        cancelDrawing()
        addNotification('info', 'Drawing cancelled')
      } else {
        setActiveTool('select')
      }
    }
    
    // Handle number input for polygon sides when polygon tool is active
    const isPolygonTool = activeTool === 'polygon-inscribed' || activeTool === 'polygon-circumscribed'
    if (isPolygonTool && !e.ctrlKey && !e.altKey) {
      const num = parseInt(e.key)
      if (!isNaN(num) && num >= 0 && num <= 9) {
        // If it's the first digit and between 3-9, use it directly
        // Otherwise, build a number (allow typing like "12" for 12 sides)
        const currentSides = drawing.polygonSides
        let newSides: number
        
        if (currentSides < 10 && num >= 3) {
          // First digit: set directly if valid (3-9)
          newSides = num
        } else {
          // Append to make two-digit number
          newSides = (currentSides % 10) * 10 + num
        }
        
        // Clamp between 3 and 64
        newSides = Math.max(3, Math.min(64, newSides))
        setPolygonSides(newSides)
        addNotification('info', `Polygon sides: ${newSides}`)
        return
      }
    }
    
    // Tool shortcuts
    if (!e.ctrlKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'l':
          setActiveTool('line')
          break
        case 'c':
          setActiveTool(e.shiftKey ? 'circle-two-point' : 'circle-center')
          break
        case 'r':
          setActiveTool(e.shiftKey ? 'rectangle-center' : 'rectangle-corner')
          break
        case 'g':
          setActiveTool(e.shiftKey ? 'polygon-circumscribed' : 'polygon-inscribed')
          break
        case 'a':
          if (drawing.isActive && activeTool === 'line') {
            // Toggle to tangent arc mode
            toggleArcMode()
            addNotification('info', 'Switched to tangent arc mode')
          } else {
            // A for 3-point arc, Shift+A for center arc
            setActiveTool(e.shiftKey ? 'arc-center' : 'arc-3point')
          }
          break
        case 's':
          setActiveTool('spline')
          break
        case 'p':
          setActiveTool('point')
          break
        case 'd':
          setActiveTool('dimension')
          break
        case 't':
          setActiveTool('trim')
          break
        case 'x':
          setActiveTool('extend')
          break
        case 'o':
          setActiveTool('offset')
          clearSelectedEntityIds()
          break
        case 'm':
          setActiveTool('mirror')
          clearMirrorState()
          break
      }
    }
    
    // Offset tool - handle numeric input for distance
    if (activeTool === 'offset' && drawing.selectedEntityIds.length > 0) {
      // Check for number keys
      if (/^[0-9.]$/.test(e.key) || e.key === '-') {
        e.preventDefault()
        // Show dimension input for precise offset
        const currentValue = drawing.offsetDistance.toString()
        const newValue = e.key === '-' ? '-' + currentValue : currentValue + e.key
        const parsed = parseFloat(newValue)
        if (!isNaN(parsed)) {
          setOffsetDistance(Math.abs(parsed))
          if (parsed < 0) {
            // Negative value flips direction
            toggleOffsetDirection()
          }
        }
        return
      }
      
      // Enter to apply offset
      if (e.key === 'Enter' && drawing.selectedEntityIds.length > 0) {
        e.preventDefault()
        // Trigger offset application (simulate click away)
        const entities = sketch?.entities || []
        const entityIds = sketch?.entities?.map(e => e.id) || []
        
        drawing.selectedEntityIds.forEach(id => {
          const entityIndex = entityIds.indexOf(id)
          if (entityIndex >= 0) {
            const entity = entities[entityIndex]
            const offsetDist = drawing.offsetDistance * drawing.offsetDirection
            const offsetPreview = getEntityOffsetPreview(entity, offsetDist)
            
            if (offsetPreview) {
              addSketchEntity(sketchMode!.sketchId!, {
                type: offsetPreview.type,
                construction: false,
                data: offsetPreview.data
              })
            }
          }
        })
        
        addNotification('success', `Offset applied: ${drawing.offsetDistance}mm`)
        clearSelectedEntityIds()
        return
      }
      
      // Tab or Space to flip direction
      if (e.key === 'Tab' || e.key === ' ') {
        e.preventDefault()
        toggleOffsetDirection()
        addNotification('info', `Offset direction: ${drawing.offsetDirection === 1 ? 'outward' : 'inward'}`)
        return
      }
    }
    
    // Mirror tool keyboard handling
    if (activeTool === 'mirror') {
      // Enter to apply mirror
      if (e.key === 'Enter' && drawing.mirrorLineId && drawing.selectedEntityIds.length > 0) {
        e.preventDefault()
        
        const entities = sketch?.entities || []
        const entityIds = sketch?.entities?.map(e => e.id) || []
        const mirrorLineEntity = entities.find((_, idx) => entityIds[idx] === drawing.mirrorLineId)
        
        if (mirrorLineEntity && mirrorLineEntity.data.start && mirrorLineEntity.data.end) {
          drawing.selectedEntityIds.forEach(id => {
            if (id === drawing.mirrorLineId) return
            
            const entityIndex = entityIds.indexOf(id)
            if (entityIndex >= 0) {
              const entity = entities[entityIndex]
              const mirrored = getMirroredEntity(
                entity,
                mirrorLineEntity.data.start,
                mirrorLineEntity.data.end
              )
              
              if (mirrored) {
                addSketchEntity(sketchMode!.sketchId!, mirrored)
              }
            }
          })
          
          addNotification('success', `Mirrored ${drawing.selectedEntityIds.length} entities`)
          clearMirrorState()
        }
        return
      }
      
      // ESC to cancel or finish selection
      if (e.key === 'Escape') {
        e.preventDefault()
        if (drawing.mirrorMode === 'preview' || (drawing.mirrorLineId && drawing.selectedEntityIds.length > 0)) {
          clearMirrorState()
          addNotification('info', 'Mirror cancelled')
        } else if (drawing.mirrorMode === 'select-entities' && drawing.selectedEntityIds.length > 0) {
          // Finish selection and go to preview
          setMirrorMode('preview')
          addNotification('info', 'Press Enter to apply mirror')
        } else {
          clearMirrorState()
        }
        return
      }
    }
  }, [drawing.isActive, drawing.polygonSides, drawing.selectedEntityIds, drawing.offsetDistance, drawing.offsetDirection, drawing.mirrorLineId, drawing.mirrorMode, activeTool, sketch, sketchMode, setModifierKeys, cancelDrawing, setActiveTool, toggleArcMode, setPolygonSides, setOffsetDistance, toggleOffsetDirection, clearSelectedEntityIds, clearMirrorState, setMirrorMode, addSketchEntity, addNotification])
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setModifierKeys(e.shiftKey, e.ctrlKey, e.altKey)
  }, [setModifierKeys])
  
  // Handle wheel for zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.5, Math.min(50, z * delta)))
  }, [])
  
  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('contextmenu', handleContextMenu)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('dblclick', handleDoubleClick)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      canvas.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleClick, handleDoubleClick, handleContextMenu, handleWheel, handleKeyDown, handleKeyUp])
  
  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1d21'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid
      drawGrid(ctx, canvas, zoom, pan)
      
      // Draw origin
      drawOrigin(ctx, canvas, zoom, pan)
      
      // Draw existing sketch entities
      if (sketch) {
        drawSketchEntities(
          ctx, 
          canvas, 
          zoom, 
          pan, 
          sketch.entities,
          drawing.selectedEntityIds,
          sketch.constraints,
          undefined // hoveredEntityId - can be added later
        )
        
        // Draw constraint icons
        drawConstraintIcons(ctx, canvas, zoom, pan, sketch.constraints, sketch.entities)
      }
      
      // Draw current drawing preview
      const sketchEntities = sketch?.entities || []
      if (drawing.isActive && drawing.points.length > 0) {
        drawDrawingPreview(ctx, canvas, zoom, pan, activeTool, drawing, sketchEntities)
      }
      
      // Draw offset tool preview (even when not actively drawing)
      if (activeTool === 'offset') {
        drawDrawingPreview(ctx, canvas, zoom, pan, activeTool, drawing, sketchEntities)
      }
      
      // Draw inferences
      if (drawing.inferences.length > 0) {
        drawInferences(ctx, canvas, zoom, pan, drawing.inferences)
      }
      
      // Draw snap indicator
      if (drawing.snap) {
        drawSnapIndicator(ctx, canvas, zoom, pan, drawing.snap)
      }
      
      // Draw cursor crosshair
      if (drawing.previewPoint && activeTool && activeTool !== 'select') {
        drawCursor(ctx, canvas, zoom, pan, drawing.previewPoint)
      }
      
      animationRef.current = requestAnimationFrame(render)
    }
    
    render()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [zoom, pan, sketch, drawing, activeTool])
  
  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])
  
  if (!sketchMode) return null
  
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ cursor: cursorStyle }}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Dimension Input */}
      {drawing.pendingDimension && (
        <DimensionInput
          type={drawing.pendingDimension.type}
          value={drawing.pendingDimension.value}
          position={drawing.pendingDimension.position}
          canvas={canvasRef.current}
          zoom={zoom}
          pan={pan}
          onConfirm={(value) => {
            // Apply dimension
            hideDimensionInput()
            addNotification('info', `Dimension set to ${value}`)
          }}
          onCancel={hideDimensionInput}
        />
      )}
      
      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-cad-darker/90 backdrop-blur px-3 py-2 rounded-lg border border-cad-border/50 text-xs font-mono">
        {drawing.previewPoint ? (
          <>
            <span className="text-red-400">X:</span> {drawing.previewPoint.x.toFixed(1)}
            <span className="text-green-400 ml-3">Y:</span> {drawing.previewPoint.y.toFixed(1)}
          </>
        ) : (
          <span className="text-cad-text-dim">Move cursor to see coordinates</span>
        )}
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-cad-darker/90 backdrop-blur px-3 py-2 rounded-lg border border-cad-border/50 text-xs">
        <span className="text-cad-text-dim">Zoom:</span> {Math.round(zoom * 100 / 5)}%
      </div>
    </div>
  )
}

// Dimension Input Component
interface DimensionInputProps {
  type: 'length' | 'radius' | 'diameter' | 'angle' | 'width' | 'height' | 'sides'
  value: number | null
  position: Point2D
  canvas: HTMLCanvasElement | null
  zoom: number
  pan: CanvasPoint
  onConfirm: (value: number) => void
  onCancel: () => void
}

function DimensionInput({ type, value, position, canvas, zoom, pan, onConfirm, onCancel }: DimensionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(value?.toString() || '')
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const num = parseFloat(inputValue)
      if (!isNaN(num) && num > 0) {
        onConfirm(num)
      }
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }
  
  if (!canvas) return null
  
  const screenPos = worldToCanvas(position, canvas, zoom, pan)
  
  const labels: Record<string, string> = {
    length: 'Length',
    radius: 'Radius',
    diameter: '⌀ Diameter',
    angle: 'Angle',
    width: 'Width',
    height: 'Height',
    sides: 'Sides'
  }
  
  const units: Record<string, string> = {
    length: 'mm',
    radius: 'mm',
    diameter: 'mm',
    angle: '°',
    width: 'mm',
    height: 'mm',
    sides: ''
  }
  
  return (
    <div 
      className="absolute bg-cad-dark border border-cad-accent rounded-lg shadow-xl overflow-hidden"
      style={{ 
        left: screenPos.x + 16, 
        top: screenPos.y - 16,
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div className="px-3 py-1.5 bg-cad-accent/20 border-b border-cad-border text-xs font-medium text-cad-accent">
        {labels[type] || type}
      </div>
      <div className="p-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1 bg-cad-darker border border-cad-border rounded text-sm text-cad-text focus:border-cad-accent outline-none"
        />
        <span className="text-xs text-cad-text-dim">{units[type] || 'mm'}</span>
      </div>
    </div>
  )
}

// Drawing helper functions
function drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, zoom: number, pan: CanvasPoint) {
  const gridSize = GRID_SIZE
  const majorGridSize = gridSize * 5
  
  const startX = Math.floor((pan.x - canvas.width / 2 / zoom) / gridSize) * gridSize
  const endX = Math.ceil((pan.x + canvas.width / 2 / zoom) / gridSize) * gridSize
  const startY = Math.floor((pan.y - canvas.height / 2 / zoom) / gridSize) * gridSize
  const endY = Math.ceil((pan.y + canvas.height / 2 / zoom) / gridSize) * gridSize
  
  ctx.strokeStyle = '#2a2e36'
  ctx.lineWidth = 1
  
  // Minor grid
  ctx.beginPath()
  for (let x = startX; x <= endX; x += gridSize) {
    const screenX = canvas.width / 2 + (x - pan.x) * zoom
    ctx.moveTo(screenX, 0)
    ctx.lineTo(screenX, canvas.height)
  }
  for (let y = startY; y <= endY; y += gridSize) {
    const screenY = canvas.height / 2 - (y - pan.y) * zoom
    ctx.moveTo(0, screenY)
    ctx.lineTo(canvas.width, screenY)
  }
  ctx.stroke()
  
  // Major grid
  ctx.strokeStyle = '#3a3f4b'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = Math.floor(startX / majorGridSize) * majorGridSize; x <= endX; x += majorGridSize) {
    const screenX = canvas.width / 2 + (x - pan.x) * zoom
    ctx.moveTo(screenX, 0)
    ctx.lineTo(screenX, canvas.height)
  }
  for (let y = Math.floor(startY / majorGridSize) * majorGridSize; y <= endY; y += majorGridSize) {
    const screenY = canvas.height / 2 - (y - pan.y) * zoom
    ctx.moveTo(0, screenY)
    ctx.lineTo(canvas.width, screenY)
  }
  ctx.stroke()
}

function drawOrigin(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, zoom: number, pan: CanvasPoint) {
  const origin = worldToCanvas({ x: 0, y: 0, z: 0 }, canvas, zoom, pan)
  const axisLength = 40
  
  // X axis (red)
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(origin.x, origin.y)
  ctx.lineTo(origin.x + axisLength, origin.y)
  ctx.stroke()
  
  // Y axis (green)
  ctx.strokeStyle = '#22c55e'
  ctx.beginPath()
  ctx.moveTo(origin.x, origin.y)
  ctx.lineTo(origin.x, origin.y - axisLength)
  ctx.stroke()
  
  // Origin point
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2)
  ctx.fill()
}

// Get color based on constraint status
function getEntityColor(entity: any, isSelected: boolean = false): string {
  if (isSelected) return '#f59e0b' // Amber for selected
  if (entity.construction) return '#f59e0b' // Orange for construction
  
  // Color based on constraint status
  switch (entity.constraintStatus) {
    case 'fully': return '#10b981' // Green/black for fully constrained (using green for visibility)
    case 'over': return '#ef4444' // Red for over-constrained
    case 'under':
    default: return '#3b82f6' // Blue for under-constrained (default)
  }
}

// Draw constraint icons near entities
function drawConstraintIcons(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  zoom: number, 
  pan: CanvasPoint, 
  constraints: any[],
  entities: any[],
  hoveredEntityId?: string
) {
  constraints.forEach(constraint => {
    // Skip if no entities to draw for
    if (!constraint.entityIds || constraint.entityIds.length === 0) return
    
    // Find the first entity to position the icon
    const firstEntity = entities.find(e => e.id === constraint.entityIds[0])
    if (!firstEntity) return
    
    // Calculate icon position based on entity type
    let iconPos: CanvasPoint = { x: 0, y: 0 }
    
    if (firstEntity.type === 'line' && firstEntity.data.start && firstEntity.data.end) {
      const mid = {
        x: (firstEntity.data.start.x + firstEntity.data.end.x) / 2,
        y: (firstEntity.data.start.y + firstEntity.data.end.y) / 2,
        z: 0
      }
      iconPos = worldToCanvas(mid, canvas, zoom, pan)
      iconPos.y -= 15 // Offset above the line
    } else if ((firstEntity.type === 'circle' || firstEntity.type === 'arc') && firstEntity.data.center) {
      iconPos = worldToCanvas(firstEntity.data.center, canvas, zoom, pan)
      iconPos.y -= (firstEntity.data.radius || 20) * zoom + 15
    } else if (firstEntity.type === 'point' && firstEntity.data) {
      iconPos = worldToCanvas(firstEntity.data, canvas, zoom, pan)
      iconPos.y -= 15
    }
    
    // Determine icon appearance based on status
    const isHovered = constraint.entityIds.includes(hoveredEntityId)
    const iconColor = constraint.status === 'satisfied' ? '#6b7280' : 
                      constraint.status === 'redundant' ? '#fbbf24' : '#ef4444'
    const bgColor = constraint.status === 'satisfied' ? 'rgba(31, 41, 55, 0.8)' :
                    constraint.status === 'redundant' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)'
    
    // Draw icon background
    ctx.fillStyle = isHovered ? 'rgba(59, 130, 246, 0.3)' : bgColor
    ctx.beginPath()
    ctx.roundRect(iconPos.x - 10, iconPos.y - 8, 20, 16, 3)
    ctx.fill()
    
    // Draw constraint symbol
    ctx.fillStyle = isHovered ? '#3b82f6' : iconColor
    ctx.font = 'bold 10px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    let symbol = ''
    switch (constraint.type) {
      case 'horizontal': symbol = '—'; break
      case 'vertical': symbol = '|'; break
      case 'coincident': symbol = '◎'; break
      case 'parallel': symbol = '//'; break
      case 'perpendicular': symbol = '⊥'; break
      case 'tangent': symbol = '⌒'; break
      case 'equal': symbol = '='; break
      case 'concentric': symbol = '⊙'; break
      case 'midpoint': symbol = '⊢'; break
      case 'fixed': symbol = '🔒'; break
      case 'symmetric': symbol = '⟷'; break
      default: symbol = '?'
    }
    
    ctx.fillText(symbol, iconPos.x, iconPos.y)
  })
}

function drawSketchEntities(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  zoom: number, 
  pan: CanvasPoint, 
  entities: any[],
  selectedIds: string[] = [],
  constraints: any[] = [],
  hoveredEntityId?: string
) {
  entities.forEach(entity => {
    const isSelected = selectedIds.includes(entity.id)
    const isHovered = entity.id === hoveredEntityId
    const color = getEntityColor(entity, isSelected || isHovered)
    ctx.strokeStyle = color
    ctx.lineWidth = isSelected || isHovered ? 3 : 2
    
    switch (entity.type) {
      case 'line':
        if (entity.data.start && entity.data.end) {
          const start = worldToCanvas(entity.data.start, canvas, zoom, pan)
          const end = worldToCanvas(entity.data.end, canvas, zoom, pan)
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(end.x, end.y)
          ctx.stroke()
          
          // Draw endpoints
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(start.x, start.y, 3, 0, Math.PI * 2)
          ctx.arc(end.x, end.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        break
        
      case 'circle':
        if (entity.data.center && entity.data.radius) {
          const center = worldToCanvas(entity.data.center, canvas, zoom, pan)
          const radiusScreen = entity.data.radius * zoom
          ctx.beginPath()
          ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
          ctx.stroke()
          
          // Draw center point
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(center.x, center.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        break
        
      case 'rectangle':
        if (entity.data.corner1 && entity.data.corner2) {
          const c1 = worldToCanvas(entity.data.corner1, canvas, zoom, pan)
          const c2 = worldToCanvas(entity.data.corner2, canvas, zoom, pan)
          ctx.beginPath()
          ctx.rect(
            Math.min(c1.x, c2.x),
            Math.min(c1.y, c2.y),
            Math.abs(c2.x - c1.x),
            Math.abs(c2.y - c1.y)
          )
          ctx.stroke()
        }
        break
        
      case 'arc':
        if (entity.data.center && entity.data.radius) {
          const center = worldToCanvas(entity.data.center, canvas, zoom, pan)
          const radiusScreen = entity.data.radius * zoom
          
          // Determine arc direction
          const clockwise = entity.data.clockwise ?? false
          
          ctx.beginPath()
          ctx.arc(center.x, center.y, radiusScreen, -entity.data.startAngle, -entity.data.endAngle, !clockwise)
          ctx.stroke()
          
          // Draw center point (small)
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(center.x, center.y, 2, 0, Math.PI * 2)
          ctx.fill()
          
          // Draw arc endpoints if available
          if (entity.data.startPoint) {
            const sp = worldToCanvas(entity.data.startPoint, canvas, zoom, pan)
            ctx.beginPath()
            ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
          if (entity.data.endPoint) {
            const ep = worldToCanvas(entity.data.endPoint, canvas, zoom, pan)
            ctx.beginPath()
            ctx.arc(ep.x, ep.y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
        
      case 'point':
        if (entity.data.position) {
          const pos = worldToCanvas(entity.data.position, canvas, zoom, pan)
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
          ctx.fill()
          // Cross mark
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pos.x - 6, pos.y)
          ctx.lineTo(pos.x + 6, pos.y)
          ctx.moveTo(pos.x, pos.y - 6)
          ctx.lineTo(pos.x, pos.y + 6)
          ctx.stroke()
        }
        break
        
      case 'polygon':
        if (entity.data.center && entity.data.radius && entity.data.sides) {
          const center = worldToCanvas(entity.data.center, canvas, zoom, pan)
          const sides = entity.data.sides
          const rotation = entity.data.rotation || 0
          
          // For inscribed polygon, radius is to vertices
          // For circumscribed, radius is the circumradius calculated from apothem
          const radiusScreen = entity.data.radius * zoom
          
          // Draw polygon
          ctx.beginPath()
          for (let i = 0; i <= sides; i++) {
            const vertexAngle = rotation + (i * 2 * Math.PI / sides)
            const vx = center.x + radiusScreen * Math.cos(vertexAngle)
            const vy = center.y - radiusScreen * Math.sin(vertexAngle) // Flip Y for canvas
            if (i === 0) {
              ctx.moveTo(vx, vy)
            } else {
              ctx.lineTo(vx, vy)
            }
          }
          ctx.stroke()
          
          // Draw center point
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(center.x, center.y, 3, 0, Math.PI * 2)
          ctx.fill()
          
          // Draw vertices
          for (let i = 0; i < sides; i++) {
            const vertexAngle = rotation + (i * 2 * Math.PI / sides)
            const vx = center.x + radiusScreen * Math.cos(vertexAngle)
            const vy = center.y - radiusScreen * Math.sin(vertexAngle)
            ctx.beginPath()
            ctx.arc(vx, vy, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
        
      case 'spline':
        if (entity.data.points && entity.data.points.length >= 2) {
          const points = entity.data.points
          const closed = entity.data.closed || false
          const handles = entity.data.handles || calculateSplineHandles(points, closed)
          
          // Draw the spline curve
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          drawSplineCurve(ctx, canvas, zoom, pan, points, closed)
          
          // Draw fit points
          ctx.fillStyle = color
          points.forEach((point: Point2D) => {
            const screenPoint = worldToCanvas(point, canvas, zoom, pan)
            ctx.beginPath()
            ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2)
            ctx.fill()
          })
          
          // Draw tangent handles (for end points on open splines)
          if (!closed && handles.length >= 2) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            ctx.lineWidth = 1
            
            // Start handle
            const startHandle = handles[0]
            if (startHandle) {
              const sp = worldToCanvas(startHandle.point, canvas, zoom, pan)
              const hp = worldToCanvas(startHandle.handleOut, canvas, zoom, pan)
              ctx.beginPath()
              ctx.moveTo(sp.x, sp.y)
              ctx.lineTo(hp.x, hp.y)
              ctx.stroke()
              
              // Handle grip
              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.arc(hp.x, hp.y, 4, 0, Math.PI * 2)
              ctx.fill()
            }
            
            // End handle
            const endHandle = handles[handles.length - 1]
            if (endHandle) {
              const ep = worldToCanvas(endHandle.point, canvas, zoom, pan)
              const hp = worldToCanvas(endHandle.handleIn, canvas, zoom, pan)
              ctx.beginPath()
              ctx.moveTo(ep.x, ep.y)
              ctx.lineTo(hp.x, hp.y)
              ctx.stroke()
              
              // Handle grip
              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.arc(hp.x, hp.y, 4, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
        break
    }
  })
}

function drawDrawingPreview(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  zoom: number, 
  pan: CanvasPoint,
  activeTool: string | null,
  drawing: any,
  entities: any[] = []
) {
  const previewColor = '#22c55e'
  ctx.strokeStyle = previewColor
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  
  if (activeTool === 'line' && drawing.points.length > 0) {
    // Draw existing points
    for (let i = 0; i < drawing.points.length - 1; i++) {
      const start = worldToCanvas(drawing.points[i], canvas, zoom, pan)
      const end = worldToCanvas(drawing.points[i + 1], canvas, zoom, pan)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
    
    // Draw preview to cursor
    if (drawing.previewPoint) {
      const lastPoint = drawing.points[drawing.points.length - 1]
      const start = worldToCanvas(lastPoint, canvas, zoom, pan)
      const end = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
      
      // Show length
      const length = distance(lastPoint, drawing.previewPoint)
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2
      ctx.setLineDash([])
      ctx.fillStyle = '#22c55e'
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`${length.toFixed(1)}`, midX + 10, midY - 10)
    }
    
    // Draw points
    drawing.points.forEach((point: Point2D) => {
      const screenPoint = worldToCanvas(point, canvas, zoom, pan)
      ctx.fillStyle = previewColor
      ctx.beginPath()
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  
  else if ((activeTool === 'circle-center' || activeTool === 'circle-two-point') && drawing.points.length > 0) {
    if (activeTool === 'circle-center') {
      const center = worldToCanvas(drawing.points[0], canvas, zoom, pan)
      
      // Draw center point
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw preview circle
      if (drawing.previewPoint) {
        const radius = distance(drawing.points[0], drawing.previewPoint)
        const radiusScreen = radius * zoom
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
        ctx.stroke()
        
        // Draw radius line
        const radiusEnd = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
        ctx.beginPath()
        ctx.moveTo(center.x, center.y)
        ctx.lineTo(radiusEnd.x, radiusEnd.y)
        ctx.stroke()
        
        // Show diameter
        ctx.setLineDash([])
        ctx.font = '12px JetBrains Mono, monospace'
        ctx.fillText(`⌀${(radius * 2).toFixed(1)}`, center.x + radiusScreen + 10, center.y)
      }
    } else {
      // Two-point circle
      const p1 = worldToCanvas(drawing.points[0], canvas, zoom, pan)
      
      // Draw first point
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      if (drawing.previewPoint) {
        const p2 = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
        const center: CanvasPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
        const diameter = distance(drawing.points[0], drawing.previewPoint)
        const radiusScreen = diameter * zoom / 2
        
        // Draw preview circle
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
        ctx.stroke()
        
        // Draw diameter line
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        
        // Show diameter
        ctx.setLineDash([])
        ctx.font = '12px JetBrains Mono, monospace'
        ctx.fillText(`⌀${diameter.toFixed(1)}`, center.x + 10, center.y - radiusScreen - 10)
      }
    }
  }
  
  // Corner-to-Corner Rectangle preview
  else if (activeTool === 'rectangle-corner' && drawing.points.length > 0) {
    const corner1World = drawing.points[0]
    const corner1 = worldToCanvas(corner1World, canvas, zoom, pan)
    
    // Draw first corner
    ctx.fillStyle = previewColor
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(corner1.x, corner1.y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillText('Corner 1', corner1.x + 8, corner1.y - 8)
    
    if (drawing.previewPoint) {
      let previewWorld = drawing.previewPoint
      
      // Apply square constraint if Alt is held
      if (drawing.altHeld) {
        const dx = previewWorld.x - corner1World.x
        const dy = previewWorld.y - corner1World.y
        const size = Math.max(Math.abs(dx), Math.abs(dy))
        previewWorld = {
          x: corner1World.x + Math.sign(dx) * size,
          y: corner1World.y + Math.sign(dy) * size,
          z: 0
        }
      }
      
      const corner2 = worldToCanvas(previewWorld, canvas, zoom, pan)
      
      // Draw rectangle preview
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.rect(
        Math.min(corner1.x, corner2.x),
        Math.min(corner1.y, corner2.y),
        Math.abs(corner2.x - corner1.x),
        Math.abs(corner2.y - corner1.y)
      )
      ctx.stroke()
      
      // Draw diagonal line (to show corners)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(corner1.x, corner1.y)
      ctx.lineTo(corner2.x, corner2.y)
      ctx.stroke()
      
      // Show dimensions
      const width = Math.abs(previewWorld.x - corner1World.x)
      const height = Math.abs(previewWorld.y - corner1World.y)
      ctx.setLineDash([])
      ctx.strokeStyle = previewColor
      ctx.fillStyle = previewColor
      ctx.font = '12px JetBrains Mono, monospace'
      
      // Dimension text with square indicator
      const dimText = drawing.altHeld 
        ? `${width.toFixed(1)} × ${height.toFixed(1)} ▣` 
        : `${width.toFixed(1)} × ${height.toFixed(1)}`
      ctx.fillText(dimText, Math.max(corner1.x, corner2.x) + 10, Math.min(corner1.y, corner2.y) - 10)
      
      // Show Alt hint if not held
      if (!drawing.altHeld) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = '10px JetBrains Mono, monospace'
        ctx.fillText('Hold Alt for square', Math.max(corner1.x, corner2.x) + 10, Math.min(corner1.y, corner2.y) - 25)
      }
      
      // Draw corner 2 indicator
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(corner2.x, corner2.y, 5, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  
  // Center-to-Corner Rectangle preview
  else if (activeTool === 'rectangle-center' && drawing.points.length > 0) {
    const centerWorld = drawing.points[0]
    const center = worldToCanvas(centerWorld, canvas, zoom, pan)
    
    // Draw center point with crosshair
    ctx.fillStyle = previewColor
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // Small crosshair at center
    ctx.strokeStyle = previewColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(center.x - 8, center.y)
    ctx.lineTo(center.x + 8, center.y)
    ctx.moveTo(center.x, center.y - 8)
    ctx.lineTo(center.x, center.y + 8)
    ctx.stroke()
    ctx.lineWidth = 2
    
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillText('Center', center.x + 10, center.y - 10)
    
    if (drawing.previewPoint) {
      let halfWidth = Math.abs(drawing.previewPoint.x - centerWorld.x)
      let halfHeight = Math.abs(drawing.previewPoint.y - centerWorld.y)
      
      // Apply square constraint if Alt is held
      if (drawing.altHeld) {
        const maxHalf = Math.max(halfWidth, halfHeight)
        halfWidth = maxHalf
        halfHeight = maxHalf
      }
      
      // Calculate rectangle bounds
      const minX = center.x - halfWidth * zoom
      const maxX = center.x + halfWidth * zoom
      const minY = center.y - halfHeight * zoom
      const maxY = center.y + halfHeight * zoom
      
      // Draw rectangle preview
      ctx.setLineDash([5, 5])
      ctx.strokeStyle = previewColor
      ctx.beginPath()
      ctx.rect(minX, minY, maxX - minX, maxY - minY)
      ctx.stroke()
      
      // Draw construction lines from center to edges (showing symmetry)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      // Horizontal
      ctx.moveTo(minX, center.y)
      ctx.lineTo(maxX, center.y)
      // Vertical
      ctx.moveTo(center.x, minY)
      ctx.lineTo(center.x, maxY)
      ctx.stroke()
      
      // Draw corner indicator at cursor position
      const corner = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.strokeStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(corner.x, corner.y, 5, 0, Math.PI * 2)
      ctx.stroke()
      
      // Show dimensions
      const width = halfWidth * 2
      const height = halfHeight * 2
      ctx.fillStyle = previewColor
      ctx.font = '12px JetBrains Mono, monospace'
      
      const dimText = drawing.altHeld 
        ? `${width.toFixed(1)} × ${height.toFixed(1)} ▣` 
        : `${width.toFixed(1)} × ${height.toFixed(1)}`
      ctx.fillText(dimText, maxX + 10, minY - 10)
      
      // Show Alt hint if not held
      if (!drawing.altHeld) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = '10px JetBrains Mono, monospace'
        ctx.fillText('Hold Alt for square', maxX + 10, minY - 25)
      }
      
      // Draw symmetry indicators at all 4 corners
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
      const corners = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ]
      corners.forEach(c => {
        ctx.beginPath()
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2)
        ctx.stroke()
      })
    }
  }
  
  // 3-Point Arc preview
  else if (activeTool === 'arc-3point' && drawing.points.length > 0) {
    // Draw placed points
    drawing.points.forEach((point: Point2D, idx: number) => {
      const screenPoint = worldToCanvas(point, canvas, zoom, pan)
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Label points
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText(idx === 0 ? 'Start' : 'End', screenPoint.x + 8, screenPoint.y - 8)
    })
    
    if (drawing.points.length === 1 && drawing.previewPoint) {
      // Show chord line to second point
      const p1 = worldToCanvas(drawing.points[0], canvas, zoom, pan)
      const p2 = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
      
      // Show length
      const length = distance(drawing.points[0], drawing.previewPoint)
      ctx.setLineDash([])
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`Chord: ${length.toFixed(1)}`, (p1.x + p2.x) / 2 + 10, (p1.y + p2.y) / 2 - 10)
    }
    
    if (drawing.points.length === 2 && drawing.previewPoint) {
      // Calculate and preview the arc
      const p1 = drawing.points[0]
      const p2 = drawing.points[1]
      const p3 = drawing.previewPoint
      
      const arcData = calculateArcFrom3Points(p1, p2, p3)
      
      if (arcData) {
        const center = worldToCanvas(arcData.center, canvas, zoom, pan)
        const radiusScreen = arcData.radius * zoom
        
        // Draw chord (connecting endpoints)
        const sp1 = worldToCanvas(p1, canvas, zoom, pan)
        const sp2 = worldToCanvas(p2, canvas, zoom, pan)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(sp1.x, sp1.y)
        ctx.lineTo(sp2.x, sp2.y)
        ctx.stroke()
        
        // Draw the arc preview
        ctx.strokeStyle = previewColor
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        if (arcData.clockwise) {
          ctx.arc(center.x, center.y, radiusScreen, -arcData.startAngle, -arcData.endAngle, false)
        } else {
          ctx.arc(center.x, center.y, radiusScreen, -arcData.startAngle, -arcData.endAngle, true)
        }
        ctx.stroke()
        
        // Draw center point (faint)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.5)'
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.arc(center.x, center.y, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw radius line
        const bulgeScreen = worldToCanvas(p3, canvas, zoom, pan)
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.moveTo(center.x, center.y)
        ctx.lineTo(bulgeScreen.x, bulgeScreen.y)
        ctx.stroke()
        
        // Show radius
        ctx.setLineDash([])
        ctx.fillStyle = previewColor
        ctx.font = '12px JetBrains Mono, monospace'
        ctx.fillText(`R${arcData.radius.toFixed(1)}`, center.x + 10, center.y - 10)
        
        // Check for semicircle snap
        if (isNearChordMidpoint(p1, p2, p3, 5)) {
          ctx.fillStyle = '#f59e0b'
          ctx.fillText('Semicircle', bulgeScreen.x + 10, bulgeScreen.y - 5)
        }
      } else {
        // Points are collinear - show warning
        const sp3 = worldToCanvas(p3, canvas, zoom, pan)
        ctx.fillStyle = '#ef4444'
        ctx.font = '12px JetBrains Mono, monospace'
        ctx.fillText('Collinear!', sp3.x + 10, sp3.y - 5)
      }
      
      // Draw bulge point indicator
      const bulgeScreen = worldToCanvas(p3, canvas, zoom, pan)
      ctx.strokeStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(bulgeScreen.x, bulgeScreen.y, 6, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  
  // Center-Start-End Arc preview
  else if (activeTool === 'arc-center' && drawing.points.length > 0) {
    const center = worldToCanvas(drawing.points[0], canvas, zoom, pan)
    
    // Draw center point
    ctx.fillStyle = previewColor
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillText('Center', center.x + 8, center.y - 8)
    
    if (drawing.points.length === 1 && drawing.previewPoint) {
      // Show radius preview
      const radius = distance(drawing.points[0], drawing.previewPoint)
      const radiusScreen = radius * zoom
      const previewScreen = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      
      // Draw full circle outline (faint)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw radius line
      ctx.strokeStyle = previewColor
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(previewScreen.x, previewScreen.y)
      ctx.stroke()
      
      // Draw start point indicator
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(previewScreen.x, previewScreen.y, 5, 0, Math.PI * 2)
      ctx.stroke()
      
      // Show radius
      ctx.fillStyle = previewColor
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`R${radius.toFixed(1)}`, (center.x + previewScreen.x) / 2 + 10, (center.y + previewScreen.y) / 2 - 10)
    }
    
    if (drawing.points.length === 2 && drawing.previewPoint) {
      const centerPoint = drawing.points[0]
      const startPoint = drawing.points[1]
      const radius = distance(centerPoint, startPoint)
      const radiusScreen = radius * zoom
      
      const startAngle = angleRadians(centerPoint, startPoint)
      const endAngle = angleRadians(centerPoint, drawing.previewPoint)
      
      // Draw full circle outline (very faint)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw the arc preview
      ctx.strokeStyle = previewColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      // Draw counterclockwise from start to end
      ctx.arc(center.x, center.y, radiusScreen, -startAngle, -endAngle, true)
      ctx.stroke()
      
      // Draw start point
      const startScreen = worldToCanvas(startPoint, canvas, zoom, pan)
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(startScreen.x, startScreen.y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText('Start', startScreen.x + 8, startScreen.y - 8)
      
      // Draw end point preview
      const endScreen = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.strokeStyle = previewColor
      ctx.beginPath()
      ctx.arc(endScreen.x, endScreen.y, 5, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw radius lines
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)'
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(startScreen.x, startScreen.y)
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(endScreen.x, endScreen.y)
      ctx.stroke()
      
      // Calculate and show sweep angle
      let sweep = endAngle - startAngle
      if (sweep < 0) sweep += Math.PI * 2
      const sweepDegrees = sweep * 180 / Math.PI
      
      ctx.setLineDash([])
      ctx.fillStyle = previewColor
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`R${radius.toFixed(1)}  ${sweepDegrees.toFixed(0)}°`, center.x + radiusScreen + 10, center.y)
    }
  }
  
  // Inscribed Polygon preview (vertices on circle)
  else if (activeTool === 'polygon-inscribed' && drawing.points.length > 0) {
    const centerWorld = drawing.points[0]
    const center = worldToCanvas(centerWorld, canvas, zoom, pan)
    const sides = drawing.polygonSides
    
    // Draw center point with crosshair
    ctx.fillStyle = previewColor
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // Center crosshair
    ctx.strokeStyle = previewColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(center.x - 10, center.y)
    ctx.lineTo(center.x + 10, center.y)
    ctx.moveTo(center.x, center.y - 10)
    ctx.lineTo(center.x, center.y + 10)
    ctx.stroke()
    ctx.lineWidth = 2
    
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillText('Center', center.x + 12, center.y - 12)
    
    if (drawing.previewPoint) {
      const radius = distance(centerWorld, drawing.previewPoint)
      const radiusScreen = radius * zoom
      const angle = angleRadians(centerWorld, drawing.previewPoint)
      
      // Draw construction circle (dashed)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw polygon preview
      ctx.strokeStyle = previewColor
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      for (let i = 0; i <= sides; i++) {
        const vertexAngle = angle + (i * 2 * Math.PI / sides)
        const vx = center.x + radiusScreen * Math.cos(vertexAngle)
        const vy = center.y - radiusScreen * Math.sin(vertexAngle) // Flip Y for canvas
        if (i === 0) {
          ctx.moveTo(vx, vy)
        } else {
          ctx.lineTo(vx, vy)
        }
      }
      ctx.stroke()
      
      // Draw radius line to first vertex
      const firstVertexX = center.x + radiusScreen * Math.cos(angle)
      const firstVertexY = center.y - radiusScreen * Math.sin(angle)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(firstVertexX, firstVertexY)
      ctx.stroke()
      
      // Draw first vertex indicator
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(firstVertexX, firstVertexY, 5, 0, Math.PI * 2)
      ctx.fill()
      
      // Show sides count in center
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 16px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${sides}`, center.x, center.y + 6)
      ctx.textAlign = 'left'
      
      // Show radius
      ctx.fillStyle = previewColor
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`R${radius.toFixed(1)}`, center.x + radiusScreen + 10, center.y)
      
      // Show hint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText('Type 3-64 for sides', center.x + radiusScreen + 10, center.y + 15)
    }
  }
  
  // Circumscribed Polygon preview (sides tangent to circle)
  else if (activeTool === 'polygon-circumscribed' && drawing.points.length > 0) {
    const centerWorld = drawing.points[0]
    const center = worldToCanvas(centerWorld, canvas, zoom, pan)
    const sides = drawing.polygonSides
    
    // Draw center point with crosshair
    ctx.fillStyle = previewColor
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // Center crosshair
    ctx.strokeStyle = previewColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(center.x - 10, center.y)
    ctx.lineTo(center.x + 10, center.y)
    ctx.moveTo(center.x, center.y - 10)
    ctx.lineTo(center.x, center.y + 10)
    ctx.stroke()
    ctx.lineWidth = 2
    
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillText('Center', center.x + 12, center.y - 12)
    
    if (drawing.previewPoint) {
      const apothem = distance(centerWorld, drawing.previewPoint)
      const apothemScreen = apothem * zoom
      const angle = angleRadians(centerWorld, drawing.previewPoint)
      
      // Calculate circumradius from apothem
      const circumradius = apothem / Math.cos(Math.PI / sides)
      const circumradiusScreen = circumradius * zoom
      
      // Rotation to make a side face the cursor
      const rotatedAngle = angle + Math.PI / sides
      
      // Draw construction circle (tangent to sides, dashed)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(center.x, center.y, apothemScreen, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw polygon preview
      ctx.strokeStyle = previewColor
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      for (let i = 0; i <= sides; i++) {
        const vertexAngle = rotatedAngle + (i * 2 * Math.PI / sides)
        const vx = center.x + circumradiusScreen * Math.cos(vertexAngle)
        const vy = center.y - circumradiusScreen * Math.sin(vertexAngle) // Flip Y for canvas
        if (i === 0) {
          ctx.moveTo(vx, vy)
        } else {
          ctx.lineTo(vx, vy)
        }
      }
      ctx.stroke()
      
      // Draw apothem line (to side midpoint)
      const cursorScreen = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(cursorScreen.x, cursorScreen.y)
      ctx.stroke()
      
      // Draw cursor indicator (on the circle)
      ctx.fillStyle = previewColor
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(cursorScreen.x, cursorScreen.y, 5, 0, Math.PI * 2)
      ctx.fill()
      
      // Show sides count in center
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 16px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${sides}`, center.x, center.y + 6)
      ctx.textAlign = 'left'
      
      // Show apothem
      ctx.fillStyle = previewColor
      ctx.font = '12px JetBrains Mono, monospace'
      ctx.fillText(`Apothem: ${apothem.toFixed(1)}`, center.x + apothemScreen + 10, center.y)
      
      // Show hint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText('Type 3-64 for sides', center.x + apothemScreen + 10, center.y + 15)
    }
  }
  
  // Spline preview
  else if (activeTool === 'spline' && drawing.points.length > 0) {
    const points = drawing.points
    
    // Draw existing spline curve through placed points
    if (points.length >= 2) {
      ctx.strokeStyle = previewColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      // Draw spline through existing points
      const allPoints = drawing.previewPoint 
        ? [...points, drawing.previewPoint]
        : points
      
      if (allPoints.length >= 2) {
        drawSplineCurve(ctx, canvas, zoom, pan, allPoints, false)
      }
    } else if (points.length === 1 && drawing.previewPoint) {
      // Draw line from first point to cursor
      const p1 = worldToCanvas(points[0], canvas, zoom, pan)
      const p2 = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.strokeStyle = previewColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
    
    // Draw placed points
    ctx.setLineDash([])
    points.forEach((point: Point2D, idx: number) => {
      const screenPoint = worldToCanvas(point, canvas, zoom, pan)
      
      // Fill point
      ctx.fillStyle = idx === 0 ? '#f59e0b' : previewColor // First point is amber
      ctx.beginPath()
      ctx.arc(screenPoint.x, screenPoint.y, 5, 0, Math.PI * 2)
      ctx.fill()
      
      // Point number
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText(`${idx + 1}`, screenPoint.x + 8, screenPoint.y - 8)
    })
    
    // Draw preview point
    if (drawing.previewPoint) {
      const previewScreen = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.strokeStyle = previewColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(previewScreen.x, previewScreen.y, 6, 0, Math.PI * 2)
      ctx.stroke()
      
      // Check if near first point (for closing)
      if (points.length >= 3) {
        const firstPoint = points[0]
        const distToFirst = distance(drawing.previewPoint, firstPoint)
        if (distToFirst < GRID_SIZE * 1.5) {
          // Show close indicator
          const firstScreen = worldToCanvas(firstPoint, canvas, zoom, pan)
          ctx.strokeStyle = '#f59e0b'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(firstScreen.x, firstScreen.y, 12, 0, Math.PI * 2)
          ctx.stroke()
          
          ctx.fillStyle = '#f59e0b'
          ctx.font = '11px JetBrains Mono, monospace'
          ctx.fillText('Close spline', firstScreen.x + 15, firstScreen.y - 15)
        }
      }
    }
    
    // Show point count
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '11px JetBrains Mono, monospace'
    const lastPoint = points[points.length - 1]
    const lastScreen = worldToCanvas(lastPoint, canvas, zoom, pan)
    ctx.fillText(`${points.length} pts • Double-click to finish`, lastScreen.x + 15, lastScreen.y + 20)
  }
  
  // Trim tool feedback - highlight segment to trim in red
  else if (activeTool === 'trim' && drawing.previewPoint) {
    const trimColor = '#ef4444' // Red for trim
    ctx.strokeStyle = trimColor
    ctx.lineWidth = 4
    ctx.setLineDash([])
    
    // Draw scissor icon at cursor
    const cursor = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
    ctx.fillStyle = trimColor
    ctx.font = '16px sans-serif'
    ctx.fillText('✂', cursor.x - 8, cursor.y + 8)
    
    // Show trim hint
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.fillText('Click segment to trim', cursor.x + 15, cursor.y - 5)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText('Drag for power trim', cursor.x + 15, cursor.y + 10)
  }
  
  // Extend tool feedback - show extension preview
  else if (activeTool === 'extend' && drawing.previewPoint) {
    const extendColor = '#22c55e' // Green for extend
    ctx.strokeStyle = extendColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    
    // Draw extend arrow at cursor
    const cursor = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
    ctx.fillStyle = extendColor
    ctx.font = '14px sans-serif'
    ctx.fillText('↔', cursor.x - 7, cursor.y + 5)
    
    // Show extend hint
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(34, 197, 94, 0.9)'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.fillText('Click endpoint to extend', cursor.x + 15, cursor.y - 5)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText('Double-click for auto', cursor.x + 15, cursor.y + 10)
  }
  
  // Offset tool feedback and preview
  else if (activeTool === 'offset') {
    const offsetColor = '#a855f7' // Purple for offset
    const selectedColor = '#f59e0b' // Amber for selected
    
    // If entities are selected, draw offset preview
    if (drawing.selectedEntityIds.length > 0 && entities.length > 0) {
      const entityIds = entities.map((e: any) => e?.id).filter(Boolean) as string[]
      
      drawing.selectedEntityIds.forEach(id => {
        // Find entity by ID
        let entity: any = null
        for (let i = 0; i < entityIds.length; i++) {
          if (entityIds[i] === id) {
            entity = entities[i]
            break
          }
        }
        
        if (!entity) return
        
        // Highlight selected entity
        ctx.strokeStyle = selectedColor
        ctx.lineWidth = 3
        ctx.setLineDash([])
        
        // Draw the selected entity highlight
        if (entity.type === 'line' && entity.data.start && entity.data.end) {
          const p1 = worldToCanvas(entity.data.start, canvas, zoom, pan)
          const p2 = worldToCanvas(entity.data.end, canvas, zoom, pan)
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
        else if (entity.type === 'circle' && entity.data.center && entity.data.radius) {
          const center = worldToCanvas(entity.data.center, canvas, zoom, pan)
          const radiusScreen = entity.data.radius * zoom
          ctx.beginPath()
          ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
          ctx.stroke()
        }
        else if (entity.type === 'rectangle' && entity.data.corner1 && entity.data.corner2) {
          const c1 = worldToCanvas(entity.data.corner1, canvas, zoom, pan)
          const c2 = worldToCanvas(entity.data.corner2, canvas, zoom, pan)
          ctx.beginPath()
          ctx.rect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y)
          ctx.stroke()
        }
        
        // Draw offset preview
        const offsetDist = drawing.offsetDistance * drawing.offsetDirection
        const offsetPreview = getEntityOffsetPreview(entity, offsetDist)
        
        if (offsetPreview) {
          ctx.strokeStyle = offsetColor
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          
          if (offsetPreview.type === 'line' && offsetPreview.data.start && offsetPreview.data.end) {
            const p1 = worldToCanvas(offsetPreview.data.start, canvas, zoom, pan)
            const p2 = worldToCanvas(offsetPreview.data.end, canvas, zoom, pan)
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
          else if (offsetPreview.type === 'circle' && offsetPreview.data.center && offsetPreview.data.radius) {
            const center = worldToCanvas(offsetPreview.data.center, canvas, zoom, pan)
            const radiusScreen = offsetPreview.data.radius * zoom
            ctx.beginPath()
            ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
            ctx.stroke()
          }
          else if (offsetPreview.type === 'rectangle' && offsetPreview.data.corner1 && offsetPreview.data.corner2) {
            const c1 = worldToCanvas(offsetPreview.data.corner1, canvas, zoom, pan)
            const c2 = worldToCanvas(offsetPreview.data.corner2, canvas, zoom, pan)
            ctx.beginPath()
            ctx.rect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y)
            ctx.stroke()
          }
          
          // Draw offset distance arrow and label
          if (entity.type === 'line' && entity.data.start && entity.data.end) {
            const mid = {
              x: (entity.data.start.x + entity.data.end.x) / 2,
              y: (entity.data.start.y + entity.data.end.y) / 2,
              z: 0
            }
            const offsetMid = {
              x: (offsetPreview.data.start.x + offsetPreview.data.end.x) / 2,
              y: (offsetPreview.data.start.y + offsetPreview.data.end.y) / 2,
              z: 0
            }
            const midScreen = worldToCanvas(mid, canvas, zoom, pan)
            const offsetMidScreen = worldToCanvas(offsetMid, canvas, zoom, pan)
            
            // Arrow line
            ctx.strokeStyle = offsetColor
            ctx.lineWidth = 1
            ctx.setLineDash([])
            ctx.beginPath()
            ctx.moveTo(midScreen.x, midScreen.y)
            ctx.lineTo(offsetMidScreen.x, offsetMidScreen.y)
            ctx.stroke()
            
            // Arrow head
            const angle = Math.atan2(offsetMidScreen.y - midScreen.y, offsetMidScreen.x - midScreen.x)
            ctx.beginPath()
            ctx.moveTo(offsetMidScreen.x, offsetMidScreen.y)
            ctx.lineTo(
              offsetMidScreen.x - 8 * Math.cos(angle - Math.PI/6),
              offsetMidScreen.y - 8 * Math.sin(angle - Math.PI/6)
            )
            ctx.moveTo(offsetMidScreen.x, offsetMidScreen.y)
            ctx.lineTo(
              offsetMidScreen.x - 8 * Math.cos(angle + Math.PI/6),
              offsetMidScreen.y - 8 * Math.sin(angle + Math.PI/6)
            )
            ctx.stroke()
            
            // Distance label
            const labelX = (midScreen.x + offsetMidScreen.x) / 2
            const labelY = (midScreen.y + offsetMidScreen.y) / 2
            
            ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'
            ctx.font = 'bold 12px JetBrains Mono, monospace'
            ctx.fillText(`${drawing.offsetDistance.toFixed(1)}mm`, labelX + 5, labelY - 5)
          }
          else if (entity.type === 'circle' || entity.type === 'rectangle') {
            // Draw distance label at top of shape
            const center = entity.type === 'circle' 
              ? entity.data.center 
              : { 
                  x: (entity.data.corner1.x + entity.data.corner2.x) / 2,
                  y: Math.max(entity.data.corner1.y, entity.data.corner2.y),
                  z: 0 
                }
            const centerScreen = worldToCanvas(center, canvas, zoom, pan)
            
            ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'
            ctx.font = 'bold 12px JetBrains Mono, monospace'
            ctx.fillText(`Offset: ${drawing.offsetDistance.toFixed(1)}mm`, centerScreen.x + 10, centerScreen.y - 15)
          }
        }
      })
      
      // Direction indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '11px JetBrains Mono, monospace'
      const dirLabel = drawing.offsetDirection === 1 ? '→ Outward' : '← Inward'
      ctx.fillText(`Direction: ${dirLabel}`, canvas.width - 150, canvas.height - 50)
      ctx.fillText('Tab/Space to flip • Enter to apply', canvas.width - 220, canvas.height - 30)
    }
    // No selection yet - show cursor hint
    else if (drawing.previewPoint) {
      const cursor = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.fillStyle = offsetColor
      ctx.font = '14px sans-serif'
      ctx.fillText('⧈', cursor.x - 7, cursor.y + 5)
      
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText('Click entity to offset', cursor.x + 15, cursor.y - 5)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.fillText('Shift+Click to add more', cursor.x + 15, cursor.y + 10)
    }
  }
  
  // Mirror tool feedback and preview
  else if (activeTool === 'mirror') {
    const mirrorColor = '#ec4899' // Pink for mirror
    const selectedColor = '#f59e0b' // Amber for selected
    const mirrorLineColor = '#06b6d4' // Cyan for mirror line
    
    // Draw selected entities
    if (drawing.selectedEntityIds.length > 0 && entities.length > 0) {
      const entityIds = entities.map((e: any) => e?.id).filter(Boolean) as string[]
      
      drawing.selectedEntityIds.forEach(id => {
        let entity: any = null
        for (let i = 0; i < entityIds.length; i++) {
          if (entityIds[i] === id) {
            entity = entities[i]
            break
          }
        }
        
        if (!entity || id === drawing.mirrorLineId) return
        
        // Highlight selected entity
        ctx.strokeStyle = selectedColor
        ctx.lineWidth = 3
        ctx.setLineDash([])
        
        if (entity.type === 'line' && entity.data.start && entity.data.end) {
          const p1 = worldToCanvas(entity.data.start, canvas, zoom, pan)
          const p2 = worldToCanvas(entity.data.end, canvas, zoom, pan)
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
        else if (entity.type === 'circle' && entity.data.center && entity.data.radius) {
          const center = worldToCanvas(entity.data.center, canvas, zoom, pan)
          const radiusScreen = entity.data.radius * zoom
          ctx.beginPath()
          ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
          ctx.stroke()
        }
        else if (entity.type === 'rectangle' && entity.data.corner1 && entity.data.corner2) {
          const c1 = worldToCanvas(entity.data.corner1, canvas, zoom, pan)
          const c2 = worldToCanvas(entity.data.corner2, canvas, zoom, pan)
          ctx.beginPath()
          ctx.rect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y)
          ctx.stroke()
        }
      })
    }
    
    // Draw mirror line highlight
    if (drawing.mirrorLineId && entities.length > 0) {
      const entityIds = entities.map((e: any) => e?.id).filter(Boolean) as string[]
      let mirrorLineEntity: any = null
      
      for (let i = 0; i < entityIds.length; i++) {
        if (entityIds[i] === drawing.mirrorLineId) {
          mirrorLineEntity = entities[i]
          break
        }
      }
      
      if (mirrorLineEntity && mirrorLineEntity.data.start && mirrorLineEntity.data.end) {
        ctx.strokeStyle = mirrorLineColor
        ctx.lineWidth = 3
        ctx.setLineDash([8, 4])
        
        const p1 = worldToCanvas(mirrorLineEntity.data.start, canvas, zoom, pan)
        const p2 = worldToCanvas(mirrorLineEntity.data.end, canvas, zoom, pan)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        
        // Draw mirror axis label
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        ctx.setLineDash([])
        ctx.fillStyle = mirrorLineColor
        ctx.font = 'bold 11px JetBrains Mono, monospace'
        ctx.fillText('⟷ MIRROR AXIS', midX + 10, midY - 10)
        
        // Draw mirrored previews
        if (drawing.selectedEntityIds.length > 0) {
          drawing.selectedEntityIds.forEach(id => {
            if (id === drawing.mirrorLineId) return
            
            let entity: any = null
            for (let i = 0; i < entityIds.length; i++) {
              if (entityIds[i] === id) {
                entity = entities[i]
                break
              }
            }
            
            if (!entity) return
            
            const mirrored = getMirroredEntity(
              entity,
              mirrorLineEntity.data.start,
              mirrorLineEntity.data.end
            )
            
            if (mirrored) {
              ctx.strokeStyle = mirrorColor
              ctx.lineWidth = 2
              ctx.setLineDash([5, 5])
              
              if (mirrored.type === 'line' && mirrored.data.start && mirrored.data.end) {
                const mp1 = worldToCanvas(mirrored.data.start, canvas, zoom, pan)
                const mp2 = worldToCanvas(mirrored.data.end, canvas, zoom, pan)
                ctx.beginPath()
                ctx.moveTo(mp1.x, mp1.y)
                ctx.lineTo(mp2.x, mp2.y)
                ctx.stroke()
              }
              else if (mirrored.type === 'circle' && mirrored.data.center && mirrored.data.radius) {
                const center = worldToCanvas(mirrored.data.center, canvas, zoom, pan)
                const radiusScreen = mirrored.data.radius * zoom
                ctx.beginPath()
                ctx.arc(center.x, center.y, radiusScreen, 0, Math.PI * 2)
                ctx.stroke()
              }
              else if (mirrored.type === 'rectangle' && mirrored.data.corner1 && mirrored.data.corner2) {
                const c1 = worldToCanvas(mirrored.data.corner1, canvas, zoom, pan)
                const c2 = worldToCanvas(mirrored.data.corner2, canvas, zoom, pan)
                ctx.beginPath()
                ctx.rect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y)
                ctx.stroke()
              }
              else if (mirrored.type === 'arc' && mirrored.data.center) {
                const center = worldToCanvas(mirrored.data.center, canvas, zoom, pan)
                const radiusScreen = mirrored.data.radius * zoom
                ctx.beginPath()
                ctx.arc(center.x, center.y, radiusScreen, mirrored.data.startAngle, mirrored.data.endAngle)
                ctx.stroke()
              }
            }
          })
          
          // Show instruction
          ctx.setLineDash([])
          ctx.fillStyle = 'rgba(236, 72, 153, 0.9)'
          ctx.font = '11px JetBrains Mono, monospace'
          ctx.fillText(`${drawing.selectedEntityIds.length} entities to mirror`, canvas.width - 180, canvas.height - 50)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
          ctx.fillText('Enter to apply • ESC to cancel', canvas.width - 220, canvas.height - 30)
        }
      }
    }
    // No mirror line yet - show cursor hint
    else if (drawing.previewPoint) {
      const cursor = worldToCanvas(drawing.previewPoint, canvas, zoom, pan)
      ctx.fillStyle = mirrorColor
      ctx.font = '14px sans-serif'
      ctx.fillText('⟷', cursor.x - 7, cursor.y + 5)
      
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(236, 72, 153, 0.9)'
      ctx.font = '11px JetBrains Mono, monospace'
      
      if (drawing.selectedEntityIds.length > 0) {
        ctx.fillText('Click a line as mirror axis', cursor.x + 15, cursor.y - 5)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.fillText(`${drawing.selectedEntityIds.length} entities selected`, cursor.x + 15, cursor.y + 10)
      } else {
        ctx.fillText('Click line (mirror axis) or entity', cursor.x + 15, cursor.y - 5)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.fillText('Select entities first or line first', cursor.x + 15, cursor.y + 10)
      }
    }
  }
  
  ctx.setLineDash([])
}

function drawInferences(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, zoom: number, pan: CanvasPoint, inferences: InferenceInfo[]) {
  inferences.forEach(inf => {
    const from = worldToCanvas(inf.from, canvas, zoom, pan)
    const to = worldToCanvas(inf.to, canvas, zoom, pan)
    
    ctx.strokeStyle = inf.type === 'horizontal' ? '#ef4444' : '#22c55e'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    
    // Draw extended inference line
    ctx.beginPath()
    if (inf.type === 'horizontal') {
      ctx.moveTo(0, from.y)
      ctx.lineTo(canvas.width, from.y)
    } else {
      ctx.moveTo(from.x, 0)
      ctx.lineTo(from.x, canvas.height)
    }
    ctx.stroke()
    
    // Draw constraint icon
    ctx.setLineDash([])
    ctx.fillStyle = inf.type === 'horizontal' ? '#ef4444' : '#22c55e'
    ctx.font = '10px sans-serif'
    ctx.fillText(inf.type === 'horizontal' ? 'H' : 'V', to.x + 15, to.y - 5)
  })
  
  ctx.setLineDash([])
}

function drawSnapIndicator(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, zoom: number, pan: CanvasPoint, snap: SnapInfo) {
  const pos = worldToCanvas(snap.point, canvas, zoom, pan)
  
  // Snap point highlight
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'
  
  if (snap.type === 'origin') {
    // Origin snap - larger indicator
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else if (snap.type === 'endpoint') {
    // Endpoint snap - square
    ctx.beginPath()
    ctx.rect(pos.x - 6, pos.y - 6, 12, 12)
    ctx.fill()
    ctx.stroke()
  } else if (snap.type === 'grid') {
    // Grid snap - diamond
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y - 6)
    ctx.lineTo(pos.x + 6, pos.y)
    ctx.lineTo(pos.x, pos.y + 6)
    ctx.lineTo(pos.x - 6, pos.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else {
    // Default snap
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  
  // Snap type label
  ctx.fillStyle = '#f59e0b'
  ctx.font = '10px JetBrains Mono, monospace'
  const labels: Record<string, string> = {
    'grid': 'Grid',
    'endpoint': 'Endpoint',
    'midpoint': 'Midpoint',
    'center': 'Center',
    'origin': 'Origin',
    'intersection': 'Intersect'
  }
  ctx.fillText(labels[snap.type] || snap.type, pos.x + 12, pos.y - 8)
}

function drawCursor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, zoom: number, pan: CanvasPoint, point: Point2D) {
  const pos = worldToCanvas(point, canvas, zoom, pan)
  
  // Crosshair
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  
  ctx.beginPath()
  ctx.moveTo(pos.x - 15, pos.y)
  ctx.lineTo(pos.x - 5, pos.y)
  ctx.moveTo(pos.x + 5, pos.y)
  ctx.lineTo(pos.x + 15, pos.y)
  ctx.moveTo(pos.x, pos.y - 15)
  ctx.lineTo(pos.x, pos.y - 5)
  ctx.moveTo(pos.x, pos.y + 5)
  ctx.lineTo(pos.x, pos.y + 15)
  ctx.stroke()
}

