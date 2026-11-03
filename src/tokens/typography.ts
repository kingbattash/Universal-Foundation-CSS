/** Recommended type roles; values in canonical DTCG source are reused where defined. */
import { generatedTokens } from "./generated.js"

export const typographyRoles = {
  display: { minPx: generatedTokens.type.displayMin, maxPx: generatedTokens.type.displayMax, weight: 600, lineHeight: 1.05 },
  h1: { minPx: generatedTokens.type.h1Min, maxPx: generatedTokens.type.h1Max, weight: 600, lineHeight: generatedTokens.type.headingLineHeight },
  h2: { minPx: generatedTokens.type.h2Min, maxPx: generatedTokens.type.h2Max, weight: 600, lineHeight: 1.16 },
  h3: { minPx: 24, maxPx: 38, weight: 600, lineHeight: 1.2 },
  h4: { minPx: 22, maxPx: 26, weight: 600, lineHeight: 1.25 },
  body: { minPx: generatedTokens.type.bodySize, maxPx: 18, weight: 400, lineHeight: generatedTokens.type.bodyLineHeight },
  bodySmall: { minPx: generatedTokens.type.bodySmall, maxPx: 16, weight: 400, lineHeight: 1.5 },
  caption: { minPx: generatedTokens.type.captionSize, maxPx: generatedTokens.type.bodySmall, weight: 400, lineHeight: 1.4 },
} as const
export type TypographyRole = keyof typeof typographyRoles
