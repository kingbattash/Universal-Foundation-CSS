/**
 * Unit conventions: pixels for dimensions, milliseconds for durations, and
 * unitless ratios. These are opt-in defaults, not required brand choices.
 */
export const foundation = {
  baseUnitPx: 4,
  baseFontPx: 16,
  modularRatio: 1.25,
  goldenRatio: (1 + Math.sqrt(5)) / 2,
  viewport: { minPx: 360, maxPx: 1440 },
  breakpointsPx: { sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  preferredReadingMeasureCh: 68,
  recommendedTouchTargetPx: 44,
  motionMs: { fast: 120, normal: 180, deliberate: 260, slow: 360 },
} as const

export type Foundation = typeof foundation
