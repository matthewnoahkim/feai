/**
 * feai Geometry Kernel
 * Core mathematics, geometry, and modeling operations
 */

// Math utilities
export * from './math/vector'
export * from './math/matrix'
export * from './math/quaternion'
export * from './math/nurbs'

// Geometry primitives
export * from './geometry/curve'
export * from './geometry/surface'
export * from './geometry/brep'
export * from './geometry/tessellation'

// Sketch system
export * from './sketch/entities'
export * from './sketch/solver'
export * from './sketch/regions'

// Solid modeling features
export * from './modeling/extrude'
export * from './modeling/revolve'
export * from './modeling/sweep'
export * from './modeling/loft'
export * from './modeling/fillet'
export * from './modeling/boolean'
export * from './modeling/shell'
export * from './modeling/direct'

// Assembly system
export * from './assembly/mate-solver'
export * from './assembly/exploded-view'

// Technical drawings
export * from './drawing/projection'
export * from './drawing/dimensioning'
export * from './drawing/gdt'

// Analysis tools
export * from './analysis/mass-properties'
export * from './analysis/interference'
export * from './analysis/draft'

// Import/Export
export * from './io/step'
export * from './io/stl'
export * from './io/obj'
export * from './io/dxf'
