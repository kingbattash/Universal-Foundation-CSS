import { columnWidth, goldenSplit, rootRectangleRatio } from "../foundation-formular/formular.js";
import { foundation } from "../foundation-formular/foundation.js";

function positive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + " must be positive and finite");
}
function nonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(name + " must be non-negative and finite");
}

export interface GridTrackGeometry {
  readonly containerPx: number;
  readonly columns: number;
  readonly gapPx: number;
  readonly outerPaddingPx: number;
  readonly innerWidthPx: number;
  readonly totalGapsPx: number;
  readonly trackPx: number;
}

/** Equal CSS grid track geometry for ANY positive column count, not just 8/12. */
export function gridTrackLayout(containerPx: number, columns: number, gapPx: number, outerPaddingPx = 0): GridTrackGeometry {
  positive(containerPx, "containerPx");
  nonnegative(outerPaddingPx, "outerPaddingPx");
  const innerWidthPx = containerPx - 2 * outerPaddingPx;
  positive(innerWidthPx, "innerWidthPx");
  const trackPx = columnWidth(innerWidthPx, columns, gapPx);
  const totalGapsPx = (columns - 1) * gapPx;
  return { containerPx, columns, gapPx, outerPaddingPx, innerWidthPx, totalGapsPx, trackPx };
}

/** Existing API retained; now accepts consumer-owned column counts. */
export function gridTrackWidths(containerPx: number, columns: number, gapPx: number): number {
  return gridTrackLayout(containerPx, columns, gapPx).trackPx;
}

/** Width in CSS px of a cell spanning 1..columns tracks, including internal gaps. */
export function gridSpanWidth(containerPx: number, columns: number, span: number, gapPx: number, outerPaddingPx = 0): number {
  const geometry = gridTrackLayout(containerPx, columns, gapPx, outerPaddingPx);
  if (!Number.isSafeInteger(span) || span < 1 || span > columns) throw new RangeError("span must be from 1 through columns");
  const width = geometry.trackPx * span + (span - 1) * gapPx;
  positive(width, "span width");
  return width;
}

export function thirds(total: number): readonly [number, number, number] {
  positive(total, "total");
  return [total / 3, total / 3, total / 3] as const;
}
export function phiSections(total: number): Readonly<{ primary: number; secondary: number }> {
  return goldenSplit(total);
}

/** Given a short side in CSS px, compute the long side of a root-n rectangle. */
export function rootRectangleHeight(shortSidePx: number, root: 2 | 3 | 4 | 5): number {
  positive(shortSidePx, "shortSidePx");
  const height = shortSidePx * rootRectangleRatio(root);
  positive(height, "long side");
  return height;
}

/** Coordinates of rule-of-thirds guides, relative to a top-left origin. */
export function ruleOfThirdsGuides(widthPx: number, heightPx: number): Readonly<{
  verticalPx: readonly [number, number]; horizontalPx: readonly [number, number];
}> {
  positive(widthPx, "widthPx");
  positive(heightPx, "heightPx");
  return {
    verticalPx: [widthPx / 3, widthPx * 2 / 3],
    horizontalPx: [heightPx / 3, heightPx * 2 / 3],
  };
}

/** Coordinates of optional phi-section composition guides (not a mandatory layout). */
export function goldenSectionGuides(widthPx: number, heightPx: number): Readonly<{
  verticalPx: readonly [number, number]; horizontalPx: readonly [number, number];
}> {
  positive(widthPx, "widthPx");
  positive(heightPx, "heightPx");
  const a = 1 - 1 / foundation.goldenRatio;
  const b = 1 / foundation.goldenRatio;
  return {
    verticalPx: [widthPx * a, widthPx * b],
    horizontalPx: [heightPx * a, heightPx * b],
  };
}
