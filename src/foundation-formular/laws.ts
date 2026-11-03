/**
 * Research-informed UX principles are explanatory, not inviolable formulae.
 * No single universally recognized "Number One Law" exists in UI/UX.
 */
export const uxPrinciples = [
  { id: "fitts", name: "Fitts's Law", idea: "Target selection time depends on distance and effective target size.", use: "Make important touch targets sufficiently large and reachable.", caution: "Movement-time coefficients must be calibrated for the task, users and input device; not a universal pixel prescription." },
  { id: "hick-hyman", name: "Hick–Hyman Law", idea: "Choice reaction time can increase with uncertainty across alternatives.", use: "Group meaningful choices and prioritize frequent tasks.", caution: "Choice count alone ignores familiarity, unequal probabilities, search and interface layout." },
  { id: "jakob", name: "Jakob's Law", idea: "People transfer expectations from experiences with other interfaces.", use: "Prefer recognizable navigation and control affordances.", caution: "Conventions evolve; novelty is not always bad." },
  { id: "gestalt-proximity", name: "Gestalt proximity", idea: "Nearby items are perceived as related.", use: "Separate groups more than items within them.", caution: "Spacing cannot replace explicit semantic structure." },
  { id: "gestalt-similarity", name: "Gestalt similarity", idea: "Similar-looking elements appear related.", use: "Style equivalent actions consistently.", caution: "Similar styling cannot imply identical outcomes unless true." },
  { id: "progressive-disclosure", name: "Progressive disclosure", idea: "Present essentials before complexity when appropriate.", use: "Place secondary controls in context rather than overwhelming the first view.", caution: "Do not hide material terms, safety or risk information." },
  { id: "serial-position", name: "Serial-position effect", idea: "Beginning and end positions may be more memorable.", use: "Review key information placement and summary structure.", caution: "Not a guaranteed attention or conversion law." },
] as const;
export type UxPrincipleId = (typeof uxPrinciples)[number]["id"];

/** Experimental coefficients supplied by the consumer, not universal defaults. */
export interface TimingCalibration {
  /** Empirically fitted intercept, in milliseconds. */
  readonly interceptMs: number;
  /** Empirically fitted slope, in milliseconds per bit. */
  readonly slopeMsPerBit: number;
}

/** Shannon formulation of Fitts's index of difficulty: log2(1 + distance/width), bits. */
export function fittsDifficultyBits(distancePx: number, effectiveWidthPx: number): number {
  if (!Number.isFinite(distancePx) || distancePx < 0) throw new RangeError("distancePx must be non-negative and finite");
  if (!Number.isFinite(effectiveWidthPx) || effectiveWidthPx <= 0) throw new RangeError("effectiveWidthPx must be positive and finite");
  const bits = Math.log2(1 + distancePx / effectiveWidthPx);
  if (!Number.isFinite(bits)) throw new RangeError("Fitts difficulty is not finite");
  return bits;
}

/**
 * Simplified equal-likelihood Hick–Hyman choice count: log2(N + 1), bits.
 * Not a model for search effort or unequal option probabilities.
 */
export function hickHymanDifficultyBits(optionCount: number): number {
  if (!Number.isSafeInteger(optionCount) || optionCount < 1) throw new RangeError("optionCount must be a positive safe integer");
  return Math.log2(optionCount + 1);
}

function timeEstimate(bits: number, calibration: TimingCalibration): number {
  if (!calibration || typeof calibration !== "object") throw new TypeError("calibration is required");
  const { interceptMs, slopeMsPerBit } = calibration;
  if (!Number.isFinite(interceptMs) || interceptMs < 0 ||
      !Number.isFinite(slopeMsPerBit) || slopeMsPerBit < 0) {
    throw new RangeError("timing coefficients must be finite and non-negative");
  }
  const result = interceptMs + slopeMsPerBit * bits;
  if (!Number.isFinite(result)) throw new RangeError("timing estimate is not finite");
  return result;
}

/** Calibrated Fitts movement-time model in ms; not valid without empirical coefficients. */
export function fittsMovementTimeMs(distancePx: number, effectiveWidthPx: number, calibration: TimingCalibration): number {
  return timeEstimate(fittsDifficultyBits(distancePx, effectiveWidthPx), calibration);
}

/** Calibrated Hick–Hyman choice-time model in ms; not a UX quality score. */
export function hickHymanChoiceTimeMs(optionCount: number, calibration: TimingCalibration): number {
  return timeEstimate(hickHymanDifficultyBits(optionCount), calibration);
}
