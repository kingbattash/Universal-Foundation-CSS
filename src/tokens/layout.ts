/** Values derived from canonical DTCG tokens; breakpoints are structural rules. */
import { foundation } from "../foundation-formular/foundation.js"
import { generatedTokens } from "./generated.js"

export const layoutTokens = {
  containerMaxPx: generatedTokens.layout.containerMax,
  containerWidePx: generatedTokens.layout.containerWide,
  readingMeasureCh: generatedTokens.layout.readingMeasure,
  gutterMobilePx: generatedTokens.layout.gutterMobile,
  gutterDesktopPx: generatedTokens.layout.gutterDesktop,
  gridColumnCount: generatedTokens.layout.gridColumnCount,
  touchTargetRecommendedPx: generatedTokens.layout.touchTarget,
  breakpointsPx: foundation.breakpointsPx,
} as const
