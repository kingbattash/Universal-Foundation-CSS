/**
 * Grid theory is a reference library. A grid being registered does not mean
 * a browser implementation exists for it. Avoid applying any grid by default.
 */
export type GridFamily = "web" | "editorial" | "geometric" | "classical" | "spacing"
export type GridSupport = "css-recipe" | "mathematical" | "reference"
export interface GridDefinition {
  id: string
  name: string
  family: GridFamily
  support: GridSupport
  use: string
  caution: string
}
