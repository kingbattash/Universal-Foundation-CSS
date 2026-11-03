/** Values derived from the canonical DTCG token file. */
import { generatedTokens } from "./generated.js"

export const coreTokens = {
  spacingUnitPx: generatedTokens.spacePx["1"],
  spacingSteps: Object.keys(generatedTokens.spacePx).map(Number),
  neutral: {
    white: generatedTokens.colors.white,
    gray50: generatedTokens.colors.neutral50,
    gray100: generatedTokens.colors.neutral100,
    gray300: generatedTokens.colors.neutral300,
    gray600: generatedTokens.colors.neutral600,
    gray800: generatedTokens.colors.neutral800,
    black: generatedTokens.colors.black,
  },
  radiiPx: generatedTokens.radiusPx,
} as const
