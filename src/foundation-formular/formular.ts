/**
 * Pure mathematical helpers. No DOM, CSS-in-JS library or product dependencies.
 * Naming "formular" follows the project's original seven-folder convention.
 */
import { foundation } from "./foundation.js"

function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`)
}
function positive(value: number, name: string): void {
  finite(value, name)
  if (value <= 0) throw new RangeError(`${name} must be positive`)
}
export function modularScale(step: number, basePx = foundation.baseFontPx, ratio = foundation.modularRatio): number {
  finite(step, "step")
  positive(basePx, "basePx")
  if (!Number.isFinite(ratio) || ratio <= 1) throw new RangeError("ratio must exceed 1")
  return Number((basePx * ratio ** step).toFixed(4))
}
export function spacingStep(units: number, basePx = foundation.baseUnitPx): number {
  if (!Number.isFinite(units) || units < 0) throw new RangeError("units must be non-negative and finite")
  positive(basePx, "basePx")
  return Number((units * basePx).toFixed(4))
}
/**
 * Linear interpolation between viewport anchors, clamped outside the range.
 * For convenience returns a CSS expression, but does not read browser state.
 */
export function fluidClamp(minPx: number, maxPx: number, minViewportPx = foundation.viewport.minPx, maxViewportPx = foundation.viewport.maxPx): string {
  positive(minPx, "minPx"); positive(maxPx, "maxPx")
  positive(minViewportPx, "minViewportPx"); positive(maxViewportPx, "maxViewportPx")
  if (maxPx < minPx || maxViewportPx <= minViewportPx) throw new RangeError("invalid clamp bounds")
  const slope = ((maxPx - minPx) / (maxViewportPx - minViewportPx)) * 100
  const intercept = minPx - (slope * minViewportPx / 100)
  return `clamp(${minPx}px, calc(${intercept.toFixed(5)}px + ${slope.toFixed(5)}vw), ${maxPx}px)`
}
export function columnWidth(containerPx: number, columns: number, gapPx: number): number {
  positive(containerPx, "containerPx")
  if (!Number.isInteger(columns) || columns < 1) throw new RangeError("columns must be a positive integer")
  if (!Number.isFinite(gapPx) || gapPx < 0) throw new RangeError("gapPx must be non-negative")
  const usable = containerPx - (columns - 1) * gapPx
  if (usable <= 0) throw new RangeError("gaps consume the available container width")
  return usable / columns
}
export function goldenSplit(total: number): Readonly<{ primary: number; secondary: number }> {
  positive(total, "total")
  const primary = total / foundation.goldenRatio
  return { primary, secondary: total - primary }
}
export function rootRectangleRatio(root: 2 | 3 | 4 | 5): number {
  return Math.sqrt(root)
}
/** WCAG 2.x relative luminance for 6-digit hex RGB colors. */
export function relativeLuminance(hex: string): number {
  if (!/^#[a-f0-9]{6}$/i.test(hex)) throw new TypeError("hex must be #RRGGBB")
  const channels = [1, 3, 5].map((n) => parseInt(hex.slice(n, n + 2), 16) / 255)
  const linear = channels.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}
export function contrastRatio(colorA: string, colorB: string): number {
  const a = relativeLuminance(colorA)
  const b = relativeLuminance(colorB)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
export function passesWcagAA(colorA: string, colorB: string, largeText = false): boolean {
  return contrastRatio(colorA, colorB) >= (largeText ? 3 : 4.5)
}
