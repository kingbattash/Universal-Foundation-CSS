import * as stylex from "@stylexjs/stylex"
import { ufVars } from "../../../adapters/stylex/tokens.generated.stylex"

export const fixtureStyles = stylex.create({
  panel: {
    backgroundColor: ufVars.surface,
    color: ufVars.text,
    padding: ufVars.space4,
    borderRadius: ufVars.radiuslg,
  },
})
