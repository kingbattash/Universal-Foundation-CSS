import { generatedTokens } from "./generated.js"

export const motionTokens = {
  durationsMs: {
    instant: generatedTokens.motion.instant,
    fast: generatedTokens.motion.fast,
    standard: generatedTokens.motion.standard,
    deliberate: generatedTokens.motion.deliberate,
    slow: generatedTokens.motion.slow,
  },
  easing: {
    emphasized: `cubic-bezier(${generatedTokens.motion.standardEasing.join(", ")})`,
    standard: "ease",
  },
  reducedMotion: "Reduce or eliminate nonessential transitions; meaning must remain available.",
} as const
