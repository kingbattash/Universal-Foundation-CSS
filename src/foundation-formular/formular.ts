/**
 * Pure mathematical helpers with CSS-pixel units where indicated.
 * Naming "formular" preserves the seven-domain compatibility convention.
 * All starter parameters are optional; consumers may supply their own values.
 */
import { foundation } from "./foundation.js";

function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(name + " must be finite");
}
function positive(value: number, name: string): void {
  finite(value, name);
  if (value <= 0) throw new RangeError(name + " must be positive");
}
function nonnegative(value: number, name: string): void {
  finite(value, name);
  if (value < 0) throw new RangeError(name + " must be non-negative");
}
function rounded(value: number, decimals = 4): number {
  finite(value, "result");
  const result = Number(value.toFixed(decimals));
  if (value !== 0 && result === 0) throw new RangeError("result is too small for four-decimal precision");
  return result;
}

/** Modular type size in CSS px; step may be fractional or negative. */
export function modularScale(step: number, basePx = foundation.baseFontPx, ratio = foundation.modularRatio): number {
  finite(step, "step");
  positive(basePx, "basePx");
  if (!Number.isFinite(ratio) || ratio <= 1) throw new RangeError("ratio must exceed 1");
  const result = basePx * ratio ** step;
  positive(result, "scale result");
  return rounded(result);
}

/** Multiplies a creator-selected non-negative spacing count by a CSS-pixel unit. */
export function spacingStep(units: number, basePx = foundation.baseUnitPx): number {
  nonnegative(units, "units");
  positive(basePx, "basePx");
  return rounded(units * basePx);
}

/** Preserves authored ordering; no 4px/8px scale or preset step count is imposed. */
export function spacingScale(steps: readonly number[], basePx = foundation.baseUnitPx): readonly number[] {
  if (!Array.isArray(steps)) throw new TypeError("steps must be an array");
  return steps.map((step) => spacingStep(step, basePx));
}

/**
 * Affine interpolation from [inputMin, inputMax] to [outputMin, outputMax].
 * Default is clamped to the input domain. Reversed output ranges are allowed.
 */
export function linearInterpolate(
  value: number, inputMin: number, inputMax: number,
  outputMin: number, outputMax: number, clamp = true,
): number {
  for (const [name, v] of Object.entries({ value, inputMin, inputMax, outputMin, outputMax })) finite(v, name);
  if (inputMax <= inputMin) throw new RangeError("inputMax must exceed inputMin");
  const progress = (value - inputMin) / (inputMax - inputMin);
  finite(progress, "interpolation progress");
  const t = clamp ? Math.max(0, Math.min(1, progress)) : progress;
  const result = outputMin + (outputMax - outputMin) * t;
  finite(result, "interpolation result");
  return result;
}

function validateFluid(minPx: number, maxPx: number, minViewportPx: number, maxViewportPx: number): void {
  positive(minPx, "minPx");
  positive(maxPx, "maxPx");
  positive(minViewportPx, "minViewportPx");
  positive(maxViewportPx, "maxViewportPx");
  if (maxPx < minPx || maxViewportPx <= minViewportPx) throw new RangeError("invalid fluid bounds");
}

/** Evaluates a fluid size in CSS px at a viewport width in CSS px, with clamping. */
export function fluidValueAt(
  viewportPx: number, minPx: number, maxPx: number,
  minViewportPx = foundation.viewport.minPx, maxViewportPx = foundation.viewport.maxPx,
): number {
  validateFluid(minPx, maxPx, minViewportPx, maxViewportPx);
  return linearInterpolate(viewportPx, minViewportPx, maxViewportPx, minPx, maxPx);
}

/**
 * Returns a CSS clamp() expression using viewport width (vw).
 * Expression components are rounded to five decimal places; the two extrema
 * retain their authored precision and should be verified in a browser later.
 */
export function fluidClamp(
  minPx: number, maxPx: number,
  minViewportPx = foundation.viewport.minPx, maxViewportPx = foundation.viewport.maxPx,
): string {
  validateFluid(minPx, maxPx, minViewportPx, maxViewportPx);
  const slope = ((maxPx - minPx) / (maxViewportPx - minViewportPx)) * 100;
  const intercept = minPx - slope * minViewportPx / 100;
  finite(slope, "slope");
  finite(intercept, "intercept");
  return "clamp(" + minPx + "px, calc(" + intercept.toFixed(5) + "px + " +
    slope.toFixed(5) + "vw), " + maxPx + "px)";
}

/** One equal-width CSS grid track, excluding the (columns - 1) gutters. */
export function columnWidth(containerPx: number, columns: number, gapPx: number): number {
  positive(containerPx, "containerPx");
  if (!Number.isSafeInteger(columns) || columns < 1) throw new RangeError("columns must be a positive safe integer");
  nonnegative(gapPx, "gapPx");
  const usable = containerPx - (columns - 1) * gapPx;
  if (!Number.isFinite(usable) || usable <= 0) throw new RangeError("gaps consume the available container width");
  const result = usable / columns;
  positive(result, "track width");
  return result;
}

/** Golden-section split of an arbitrary positive length; no design preference implied. */
export function goldenSplit(total: number): Readonly<{ primary: number; secondary: number }> {
  positive(total, "total");
  const primary = total / foundation.goldenRatio;
  return { primary, secondary: total - primary };
}

/** Supported square-root rectangle proportions (long side / short side). */
export function rootRectangleRatio(root: 2 | 3 | 4 | 5): number {
  if (![2, 3, 4, 5].includes(root)) throw new RangeError("root must be 2, 3, 4 or 5");
  return Math.sqrt(root);
}

/** WCAG 2.x relative luminance for opaque 6-digit sRGB hex colors. */
export function relativeLuminance(hex: string): number {
  if (!/^#[a-f0-9]{6}$/i.test(hex)) throw new TypeError("hex must be #RRGGBB");
  const channels = [1, 3, 5].map((n) => parseInt(hex.slice(n, n + 2), 16) / 255);
  const linear = channels.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
export function contrastRatio(colorA: string, colorB: string): number {
  const a = relativeLuminance(colorA);
  const b = relativeLuminance(colorB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function passesWcagAA(colorA: string, colorB: string, largeText = false): boolean {
  return contrastRatio(colorA, colorB) >= (largeText ? 3 : 4.5);
}
