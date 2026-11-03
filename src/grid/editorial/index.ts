/** Editorial measurements; semantic headings and line length are consumer choices. */
export interface ManuscriptGeometry {
  readonly pageWidthPx: number;
  readonly pageHeightPx: number;
  readonly textWidthPx: number;
  readonly textHeightPx: number;
  readonly marginInlinePx: number;
  readonly marginBlockPx: number;
}

/** Symmetric printable text area from arbitrary page dimensions/margins. */
export function manuscriptGeometry(
  pageWidthPx: number, pageHeightPx: number, marginInlinePx: number, marginBlockPx: number,
): ManuscriptGeometry {
  for (const [name, value] of Object.entries({pageWidthPx,pageHeightPx})) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + " must be positive and finite");
  }
  for (const [name, value] of Object.entries({marginInlinePx,marginBlockPx})) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(name + " must be non-negative and finite");
  }
  const textWidthPx = pageWidthPx - 2 * marginInlinePx;
  const textHeightPx = pageHeightPx - 2 * marginBlockPx;
  if (![textWidthPx,textHeightPx].every(v=>Number.isFinite(v) && v > 0)) throw new RangeError("margins consume the page");
  return {pageWidthPx,pageHeightPx,textWidthPx,textHeightPx,marginInlinePx,marginBlockPx};
}

/** Baseline positions from a creator-specified pixel rhythm, not an imposed 4/8px scale. */
export function baselinePositions(heightPx: number, linePx: number, offsetPx = 0): readonly number[] {
  if (!Number.isFinite(heightPx) || heightPx <= 0 ||
      !Number.isFinite(linePx) || linePx <= 0 ||
      !Number.isFinite(offsetPx) || offsetPx < 0) throw new RangeError("invalid baseline dimensions");
  if (offsetPx > heightPx) return [];
  const count = Math.floor((heightPx - offsetPx) / linePx) + 1;
  if (count > 10000) throw new RangeError("too many baseline guides");
  return Array.from({length:count}, (_, i) => offsetPx + i * linePx);
}
