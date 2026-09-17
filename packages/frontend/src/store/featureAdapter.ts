/**
 * Feature-type normalization and the catalog of what the modeling engine actually supports.
 *
 * Canonical type strings follow @feai/shared's camelCase FeatureType ('linearPattern', …).
 * Legacy kebab-case names — from older dialogs, saved documents and the chat assistant —
 * are mapped on the way in (addFeature, loadDocumentFromData) so regenerateModel, the
 * feature tree and .feai archives only ever see one spelling.
 */

import type { Feature } from './documentStore'

export const CANONICAL_TYPES: Record<string, string> = {
  'linear-pattern': 'linearPattern',
  'circular-pattern': 'circularPattern',
  'mirror-feature': 'mirror',
  'move-face': 'moveFace',
  'offset-face': 'offsetFace',
  'delete-face': 'deleteFace',
}

export function canonicalType(type: string): string {
  return CANONICAL_TYPES[type] ?? type
}

export function normalizeFeature<T extends Pick<Feature, 'type'>>(feature: T): T {
  const type = canonicalType(feature.type)
  return type === feature.type ? feature : { ...feature, type }
}

export interface FeatureCatalogEntry {
  type: string
  status: 'live' | 'planned'
  summary: string
  /** parameter -> short description; drives the assistant's system prompt */
  params: Record<string, string>
}

/** Single source of truth for what the assistant may create. `planned` entries exist so
 * the assistant can explain they're coming instead of inventing them. */
export const FEATURE_CATALOG: FeatureCatalogEntry[] = [
  {
    type: 'sketch', status: 'live', summary: 'Create an empty sketch on a base plane.',
    params: { planeId: "'top' | 'front' | 'right'" },
  },
  {
    type: 'extrude', status: 'live', summary: 'Extrude a closed sketch profile into a solid (also used for box primitives: omit sketchId and pass width/height/depth1).',
    params: {
      sketchId: 'sketch containing the profile', profileIds: 'entity ids to extrude (omit = first closed profile)',
      depth1: 'distance (mm)', endCondition1: "'blind' | 'symmetric'", useDraft: 'boolean', draftAngle: 'degrees',
      operation: "'new' | 'add' | 'remove' | 'intersect'",
    },
  },
  {
    type: 'revolve', status: 'live', summary: 'Revolve a closed profile about an axis (also used for cylinder/sphere/cone primitives: omit sketchId and pass radius/height).',
    params: {
      sketchId: '', profileId: 'entity id', axisId: "'x-axis' | 'y-axis' | 'z-axis' | id of a sketch line",
      angle: 'degrees (360 = full)', operation: "'new' | 'add' | 'remove' | 'intersect'",
    },
  },
  {
    type: 'sweep', status: 'live', summary: 'Sweep a closed profile along a line or arc path.',
    params: { profileSketchId: '', profileId: '', pathSketchId: '', pathId: 'line/arc entity id', operation: '' },
  },
  {
    type: 'loft', status: 'live', summary: 'Loft a solid through two or more closed profiles.',
    params: { profiles: '[{ sketchId, entityId }, …]', closedLoft: 'boolean', operation: '' },
  },
  {
    type: 'fillet', status: 'live', summary: 'Round edges of the current body.',
    params: { radius: 'mm', edges: "['<partId>-edge-<N>', …] or [] for every edge" },
  },
  {
    type: 'chamfer', status: 'live', summary: 'Bevel edges of the current body.',
    params: { distance1: 'mm', edges: 'as fillet' },
  },
  {
    type: 'linearPattern', status: 'live',
    summary: 'Repeat the current body along one or two directions and fuse the copies together.',
    params: {
      direction1: "'x-axis' | 'y-axis' | 'z-axis'", count1: 'total instances incl. the original', spacing1: 'mm',
      flip1: 'boolean', useDirection2: 'boolean', direction2: "same as direction1", count2: '', spacing2: 'mm', flip2: 'boolean',
    },
  },
  {
    type: 'circularPattern', status: 'live',
    summary: 'Repeat the current body around an axis through its center and fuse the copies together.',
    params: { axis: "'x-axis' | 'y-axis' | 'z-axis'", instanceCount: 'total instances incl. the original', fullCircle: 'boolean', totalAngle: 'degrees, used when fullCircle is false' },
  },
  {
    type: 'mirror', status: 'live',
    summary: 'Mirror the current body about a plane and fuse the mirrored copy onto it.',
    params: { planeId: "'top-plane' | 'front-plane' | 'right-plane' | '<partId>-face-<N>'", operation: "'new' | 'add' | 'remove' | 'intersect'" },
  },
  {
    type: 'shell', status: 'live',
    summary: 'Hollow out the current body to a wall thickness, removing the given faces to open it up.',
    params: { facesToRemove: "['<partId>-face-<N>', …] — empty = a fully enclosed hollow shell", thickness: 'mm' },
  },
]

/** Types the store handles that the assistant does not create directly. */
const INTERNAL_TYPES = new Set(['import'])

export function isKnownFeatureType(type: string): boolean {
  const t = canonicalType(type)
  return INTERNAL_TYPES.has(t) || FEATURE_CATALOG.some(f => f.type === t)
}

export function isLiveFeatureType(type: string): boolean {
  const t = canonicalType(type)
  return INTERNAL_TYPES.has(t) || FEATURE_CATALOG.some(f => f.type === t && f.status === 'live')
}
