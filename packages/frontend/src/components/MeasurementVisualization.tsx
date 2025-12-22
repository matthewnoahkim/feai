/**
 * MeasurementVisualization - Renders measurement dimension lines in 3D view
 */

import React from 'react'
import { useUIStore } from '../store/uiStore'
import { DimensionLine, AngleDimension } from './DimensionLine'

export function MeasurementVisualization() {
  const { measurements, measurementMode } = useUIStore()
  
  return (
    <group>
      {/* Completed measurements */}
      {measurements.map(measurement => {
        if (measurement.type === 'angle') {
          return <AngleDimension key={measurement.id} measurement={measurement} />
        }
        return <DimensionLine key={measurement.id} measurement={measurement} />
      })}
      
      {/* Preview measurement while hovering */}
      {measurementMode.isActive && measurementMode.previewMeasurement && (
        measurementMode.previewMeasurement.type === 'angle' ? (
          <AngleDimension 
            measurement={measurementMode.previewMeasurement} 
            isPreview 
          />
        ) : (
          <DimensionLine 
            measurement={measurementMode.previewMeasurement} 
            isPreview 
          />
        )
      )}
    </group>
  )
}

