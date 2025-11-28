/**
 * FEA Utility Functions for Frontend
 */

// Colormap definitions (RGB values 0-255)
export interface ColormapStop {
  position: number;   // 0-1
  color: [number, number, number];
}

export type ColormapType = 
  | 'rainbow'
  | 'jet'
  | 'viridis'
  | 'coolwarm'
  | 'plasma'
  | 'turbo';

export const COLORMAPS: Record<ColormapType, ColormapStop[]> = {
  rainbow: [
    { position: 0.0, color: [0, 0, 255] },
    { position: 0.25, color: [0, 255, 255] },
    { position: 0.5, color: [0, 255, 0] },
    { position: 0.75, color: [255, 255, 0] },
    { position: 1.0, color: [255, 0, 0] },
  ],
  jet: [
    { position: 0.0, color: [0, 0, 127] },
    { position: 0.1, color: [0, 0, 255] },
    { position: 0.35, color: [0, 255, 255] },
    { position: 0.5, color: [0, 255, 0] },
    { position: 0.65, color: [255, 255, 0] },
    { position: 0.9, color: [255, 0, 0] },
    { position: 1.0, color: [127, 0, 0] },
  ],
  viridis: [
    { position: 0.0, color: [68, 1, 84] },
    { position: 0.25, color: [59, 82, 139] },
    { position: 0.5, color: [33, 145, 140] },
    { position: 0.75, color: [94, 201, 98] },
    { position: 1.0, color: [253, 231, 37] },
  ],
  coolwarm: [
    { position: 0.0, color: [59, 76, 192] },
    { position: 0.5, color: [221, 221, 221] },
    { position: 1.0, color: [180, 4, 38] },
  ],
  plasma: [
    { position: 0.0, color: [13, 8, 135] },
    { position: 0.25, color: [126, 3, 168] },
    { position: 0.5, color: [204, 71, 120] },
    { position: 0.75, color: [248, 149, 64] },
    { position: 1.0, color: [240, 249, 33] },
  ],
  turbo: [
    { position: 0.0, color: [48, 18, 59] },
    { position: 0.17, color: [70, 107, 227] },
    { position: 0.33, color: [46, 195, 212] },
    { position: 0.5, color: [112, 242, 122] },
    { position: 0.67, color: [220, 231, 72] },
    { position: 0.83, color: [254, 145, 47] },
    { position: 1.0, color: [122, 4, 3] },
  ],
};

export function interpolateColor(colormap: ColormapStop[], value: number): [number, number, number] {
  // Clamp value to 0-1
  const t = Math.max(0, Math.min(1, value));
  
  // Find the two stops to interpolate between
  let lowerStop = colormap[0];
  let upperStop = colormap[colormap.length - 1];
  
  for (let i = 0; i < colormap.length - 1; i++) {
    if (t >= colormap[i].position && t <= colormap[i + 1].position) {
      lowerStop = colormap[i];
      upperStop = colormap[i + 1];
      break;
    }
  }
  
  // Interpolate
  const range = upperStop.position - lowerStop.position;
  const localT = range > 0 ? (t - lowerStop.position) / range : 0;
  
  return [
    Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * localT),
    Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * localT),
    Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * localT),
  ];
}

/**
 * Format stress value for display
 */
export function formatStress(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} GPa`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} MPa`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)} kPa`;
  return `${value.toFixed(2)} Pa`;
}

/**
 * Format displacement value for display
 */
export function formatDisplacement(value: number): string {
  if (Math.abs(value) >= 1) return `${value.toFixed(3)} mm`;
  if (Math.abs(value) >= 0.001) return `${(value * 1000).toFixed(3)} μm`;
  return `${(value * 1e6).toFixed(3)} nm`;
}

