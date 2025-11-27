/**
 * Geometric Dimensioning & Tolerancing (GD&T) System
 * ISO 1101 / ASME Y14.5 compliant
 */

export type GDTCharacteristic =
  // Form tolerances (no datum reference)
  | 'straightness'       // —
  | 'flatness'           // ⏥
  | 'circularity'        // ○
  | 'cylindricity'       // ⌭
  // Profile tolerances
  | 'profile_line'       // ⌒
  | 'profile_surface'    // ⌓
  // Orientation tolerances (require datum)
  | 'perpendicularity'   // ⊥
  | 'angularity'         // ∠
  | 'parallelism'        // ∥
  // Location tolerances (require datum)
  | 'position'           // ⌖
  | 'concentricity'      // ◎
  | 'symmetry'           // ⌯
  // Runout tolerances (require datum)
  | 'circular_runout'    // ↗
  | 'total_runout'       // ↗↗

export type MaterialCondition = 
  | 'MMC'  // Maximum Material Condition (Ⓜ)
  | 'LMC'  // Least Material Condition (Ⓛ)
  | 'RFS'  // Regardless of Feature Size (default, no symbol)

export interface DatumReference {
  letter: string
  materialCondition?: MaterialCondition
}

export interface GDTFrame {
  id: string
  characteristic: GDTCharacteristic
  toleranceValue: number
  toleranceValue2?: number // For composite tolerances
  diameter?: boolean // ⌀ prefix for cylindrical tolerance zone
  materialCondition?: MaterialCondition
  datums: DatumReference[]
  
  // Position in drawing
  position: { x: number; y: number }
  leaderPoints?: Array<{ x: number; y: number }>
}

export interface DatumFeature {
  id: string
  letter: string
  position: { x: number; y: number }
  type: 'target' | 'feature'
}

// GD&T symbol characters (using Unicode approximations)
const GDT_SYMBOLS: Record<GDTCharacteristic, string> = {
  straightness: '—',
  flatness: '⏥',
  circularity: '○',
  cylindricity: '⌭',
  profile_line: '⌒',
  profile_surface: '⌓',
  perpendicularity: '⊥',
  angularity: '∠',
  parallelism: '∥',
  position: '⌖',
  concentricity: '◎',
  symmetry: '⌯',
  circular_runout: '↗',
  total_runout: '↗↗'
}

const MATERIAL_CONDITION_SYMBOLS: Record<MaterialCondition, string> = {
  MMC: 'Ⓜ',
  LMC: 'Ⓛ',
  RFS: ''
}

/**
 * Get the symbol for a GD&T characteristic
 */
export function getCharacteristicSymbol(characteristic: GDTCharacteristic): string {
  return GDT_SYMBOLS[characteristic]
}

/**
 * Get the symbol for a material condition
 */
export function getMaterialConditionSymbol(mc?: MaterialCondition): string {
  return mc ? MATERIAL_CONDITION_SYMBOLS[mc] : ''
}

/**
 * Format a GD&T frame as text (for rendering)
 */
export function formatGDTFrame(frame: GDTFrame): string[] {
  const parts: string[] = []
  
  // First compartment: characteristic symbol
  parts.push(GDT_SYMBOLS[frame.characteristic])
  
  // Second compartment: tolerance value
  let toleranceStr = ''
  if (frame.diameter) {
    toleranceStr += '⌀'
  }
  toleranceStr += frame.toleranceValue.toFixed(3)
  if (frame.materialCondition && frame.materialCondition !== 'RFS') {
    toleranceStr += MATERIAL_CONDITION_SYMBOLS[frame.materialCondition]
  }
  parts.push(toleranceStr)
  
  // Datum compartments
  for (const datum of frame.datums) {
    let datumStr = datum.letter
    if (datum.materialCondition && datum.materialCondition !== 'RFS') {
      datumStr += MATERIAL_CONDITION_SYMBOLS[datum.materialCondition]
    }
    parts.push(datumStr)
  }
  
  return parts
}

/**
 * Calculate feature control frame dimensions for drawing
 */
export function calculateFrameDimensions(
  frame: GDTFrame,
  textHeight: number = 3.5
): { width: number; height: number; compartments: Array<{ x: number; width: number }> } {
  const charWidth = textHeight * 1.5
  const compartments: Array<{ x: number; width: number }> = []
  let totalWidth = 0
  
  // Characteristic compartment
  compartments.push({ x: totalWidth, width: charWidth })
  totalWidth += charWidth
  
  // Tolerance compartment (variable width)
  const tolWidth = charWidth * (frame.diameter ? 2.5 : 2)
  compartments.push({ x: totalWidth, width: tolWidth })
  totalWidth += tolWidth
  
  // Datum compartments
  for (const datum of frame.datums) {
    const datumWidth = charWidth * (datum.materialCondition ? 1.5 : 1)
    compartments.push({ x: totalWidth, width: datumWidth })
    totalWidth += datumWidth
  }
  
  return {
    width: totalWidth,
    height: textHeight * 2,
    compartments
  }
}

/**
 * Create a GD&T frame for position tolerance
 */
export function createPositionTolerance(
  toleranceValue: number,
  datums: DatumReference[],
  materialCondition?: MaterialCondition,
  diameter: boolean = true
): Omit<GDTFrame, 'id' | 'position'> {
  return {
    characteristic: 'position',
    toleranceValue,
    diameter,
    materialCondition,
    datums
  }
}

/**
 * Create a GD&T frame for perpendicularity
 */
export function createPerpendicularityTolerance(
  toleranceValue: number,
  datumLetter: string,
  materialCondition?: MaterialCondition
): Omit<GDTFrame, 'id' | 'position'> {
  return {
    characteristic: 'perpendicularity',
    toleranceValue,
    materialCondition,
    datums: [{ letter: datumLetter }]
  }
}

/**
 * Create a GD&T frame for flatness (form tolerance - no datum)
 */
export function createFlatnessTolerance(
  toleranceValue: number
): Omit<GDTFrame, 'id' | 'position'> {
  return {
    characteristic: 'flatness',
    toleranceValue,
    datums: []
  }
}

/**
 * Create a datum feature symbol
 */
export function createDatumFeature(
  letter: string,
  position: { x: number; y: number },
  type: 'target' | 'feature' = 'feature'
): DatumFeature {
  return {
    id: `datum_${letter}_${Date.now()}`,
    letter,
    position,
    type
  }
}

/**
 * Validate GD&T frame according to standards
 */
export function validateGDTFrame(frame: GDTFrame): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Form tolerances should not have datum references
  const formTolerances: GDTCharacteristic[] = ['straightness', 'flatness', 'circularity', 'cylindricity']
  if (formTolerances.includes(frame.characteristic) && frame.datums.length > 0) {
    errors.push(`${frame.characteristic} is a form tolerance and should not reference datums`)
  }
  
  // Orientation and location tolerances require at least one datum
  const datumRequired: GDTCharacteristic[] = [
    'perpendicularity', 'angularity', 'parallelism',
    'position', 'concentricity', 'symmetry',
    'circular_runout', 'total_runout'
  ]
  if (datumRequired.includes(frame.characteristic) && frame.datums.length === 0) {
    errors.push(`${frame.characteristic} requires at least one datum reference`)
  }
  
  // Tolerance value must be positive
  if (frame.toleranceValue <= 0) {
    errors.push('Tolerance value must be positive')
  }
  
  // MMC/LMC only applicable to features of size
  if (frame.materialCondition === 'MMC' || frame.materialCondition === 'LMC') {
    // This is a simplified check - in practice, the feature type would need to be verified
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Common GD&T configurations
 */
export const GDT_PRESETS = {
  // Hole position with MMC
  holePosition: (tolerance: number, datumA: string, datumB: string, datumC: string) => ({
    characteristic: 'position' as GDTCharacteristic,
    toleranceValue: tolerance,
    diameter: true,
    materialCondition: 'MMC' as MaterialCondition,
    datums: [
      { letter: datumA },
      { letter: datumB },
      { letter: datumC }
    ]
  }),
  
  // Surface flatness
  surfaceFlatness: (tolerance: number) => ({
    characteristic: 'flatness' as GDTCharacteristic,
    toleranceValue: tolerance,
    datums: []
  }),
  
  // Perpendicular surface
  perpendicularSurface: (tolerance: number, datum: string) => ({
    characteristic: 'perpendicularity' as GDTCharacteristic,
    toleranceValue: tolerance,
    datums: [{ letter: datum }]
  }),
  
  // Cylindrical surface runout
  cylindricalRunout: (tolerance: number, datum: string) => ({
    characteristic: 'circular_runout' as GDTCharacteristic,
    toleranceValue: tolerance,
    datums: [{ letter: datum }]
  })
}

