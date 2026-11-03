/** Optional starter typography roles, all numeric values from canonical tokens. */
import { generatedTokens } from "./generated.js";

const t = generatedTokens.type;
export const typographyRoles = {
  display: { minPx:t.displayMin, maxPx:t.displayMax, weight:t.headingWeight, lineHeight:t.displayLineHeight },
  h1: { minPx:t.h1Min, maxPx:t.h1Max, weight:t.headingWeight, lineHeight:t.headingLineHeight },
  h2: { minPx:t.h2Min, maxPx:t.h2Max, weight:t.headingWeight, lineHeight:t.h2LineHeight },
  h3: { minPx:t.h3Min, maxPx:t.h3Max, weight:t.headingWeight, lineHeight:t.h3LineHeight },
  h4: { minPx:t.h4Min, maxPx:t.h4Max, weight:t.headingWeight, lineHeight:t.h4LineHeight },
  body: { minPx:t.bodySize, maxPx:t.bodyMax, weight:t.bodyWeight, lineHeight:t.bodyLineHeight },
  bodySmall: { minPx:t.bodySmall, maxPx:t.bodySmallMax, weight:t.bodyWeight, lineHeight:t.smallLineHeight },
  caption: { minPx:t.captionSize, maxPx:t.captionMax, weight:t.bodyWeight, lineHeight:t.captionLineHeight },
} as const;
export type TypographyRole = keyof typeof typographyRoles;
