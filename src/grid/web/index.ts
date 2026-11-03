/** Web geometry without DOM or CSS dependencies. All lengths are CSS px. */
export interface WeightedTrackLayout {
  readonly containerPx: number;
  readonly paddingPx: number;
  readonly gapPx: number;
  readonly weights: readonly number[];
  readonly widthsPx: readonly number[];
  readonly availablePx: number;
}

/** Creator-owned unequal track weights (e.g. [2, 1, 3]), with no preset count. */
export function weightedTrackLayout(
  containerPx: number, weights: readonly number[], gapPx = 0, paddingPx = 0,
): WeightedTrackLayout {
  if (!Number.isFinite(containerPx) || containerPx <= 0) throw new RangeError("containerPx must be positive and finite");
  if (!Array.isArray(weights) || weights.length < 1 || weights.length > 64) throw new RangeError("weights must contain 1–64 values");
  if (!Number.isFinite(gapPx) || gapPx < 0) throw new RangeError("gapPx must be non-negative and finite");
  if (!Number.isFinite(paddingPx) || paddingPx < 0) throw new RangeError("paddingPx must be non-negative and finite");
  if (weights.some((w) => !Number.isFinite(w) || w <= 0)) throw new RangeError("weights must be positive and finite");
  // Normalize ratios before summing; this avoids overflowing sum(weights).
  const maximum = Math.max(...weights);
  const normalized = weights.map((w) => w / maximum);
  const total = normalized.reduce((a, b) => a + b, 0);
  const availablePx = containerPx - 2 * paddingPx - (weights.length - 1) * gapPx;
  if (!Number.isFinite(availablePx) || availablePx <= 0) throw new RangeError("grid padding or gutters consume container");
  const widthsPx = normalized.map((w) => availablePx * (w / total));
  if (widthsPx.some((w) => !Number.isFinite(w) || w <= 0)) throw new RangeError("track cannot be represented");
  return { containerPx, paddingPx, gapPx, weights: [...weights], widthsPx, availablePx };
}

/** CSS-pixel based fixed container that stays inside available space. */
export function fixedContainerWidth(availablePx: number, maxWidthPx: number, sidePaddingPx = 0): number {
  if (![availablePx, maxWidthPx].every((v) => Number.isFinite(v) && v > 0) ||
      !Number.isFinite(sidePaddingPx) || sidePaddingPx < 0) throw new RangeError("invalid container dimensions");
  const inner = availablePx - 2 * sidePaddingPx;
  if (inner <= 0) throw new RangeError("padding consumes the container");
  return Math.min(inner, maxWidthPx);
}

/** Floor-based repeat count for auto-fit tracks, without assuming any grid or breakpoint. */
export function autoFitColumnCount(containerPx: number, minTrackPx: number, gapPx = 0): number {
  if (!Number.isFinite(containerPx) || containerPx <= 0 ||
      !Number.isFinite(minTrackPx) || minTrackPx <= 0 ||
      !Number.isFinite(gapPx) || gapPx < 0) throw new RangeError("invalid auto-fit dimensions");
  const count = Math.floor((containerPx + gapPx) / (minTrackPx + gapPx));
  // CSS min(100%, ...) can become one narrow track, rather than overflowing.
  if (!Number.isSafeInteger(count)) throw new RangeError("column count exceeds safe integer range");
  return Math.max(1, count);
}
