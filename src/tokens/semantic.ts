/** Generated neutral theme is a starting point; individual products override it. */
import { generatedTokens } from "./generated.js"

export const semanticColorRoles = Object.keys(generatedTokens.light) as (keyof typeof generatedTokens.light)[]
export type SemanticColorRole = keyof typeof generatedTokens.light
export const starterNeutralTheme: Readonly<Record<SemanticColorRole,string>> = generatedTokens.light
export const starterNeutralDarkTheme: Readonly<Record<SemanticColorRole,string>> = generatedTokens.dark
