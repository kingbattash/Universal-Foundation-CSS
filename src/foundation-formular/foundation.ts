/**
 * Optional numerical reference values. Projects are NOT required to choose
 * this spacing unit, type scale, viewport, breakpoints, or motion scheme.
 * Values originate from tokens/source.tokens.json, not duplicated here.
 */
import { generatedTokens } from "../tokens/generated.js";

export const foundation = {
  baseUnitPx: generatedTokens.spacePx["1"],
  baseFontPx: generatedTokens.type.bodySize,
  modularRatio: generatedTokens.scale.modularRatio,
  goldenRatio: (1 + Math.sqrt(5)) / 2, // mathematical constant, not a preset
  viewport: { minPx: generatedTokens.layout.viewportMin, maxPx: generatedTokens.layout.viewportMax },
  breakpointsPx: {
    sm: generatedTokens.layout.breakpointSm,
    md: generatedTokens.layout.breakpointMd,
    lg: generatedTokens.layout.breakpointLg,
    xl: generatedTokens.layout.breakpointXl,
    xxl: generatedTokens.layout.breakpointXxl,
  },
  preferredReadingMeasureCh: generatedTokens.layout.readingMeasure,
  recommendedTouchTargetPx: generatedTokens.layout.touchTarget,
  motionMs: {
    fast: generatedTokens.motion.fast,
    normal: generatedTokens.motion.standard,
    deliberate: generatedTokens.motion.deliberate,
    slow: generatedTokens.motion.slow,
  },
} as const;

export type Foundation = typeof foundation;
