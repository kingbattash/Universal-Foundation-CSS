import type { GridDefinition, GridFamily } from "./grid.js"

const raw = [
  // Web grids: the CSS adapter includes generic 12/8-column grid recipes.
  ["twelve-column","12-column grid","web","css-recipe","Responsive multi-column websites"],
  ["responsive-grid","Responsive grid","web","css-recipe","Layout adapts at breakpoints"],
  ["fluid-grid","Fluid grid","web","css-recipe","Proportional tracks adjust with available width"],
  ["fixed-grid","Fixed grid","web","reference","Fixed-width containers and controls"],
  ["adaptive-grid","Adaptive grid","web","reference","Preset layouts at selected breakpoints"],
  ["subgrid","CSS subgrid","web","reference","Align child tracks with a parent CSS grid"],
  ["bento-grid","Bento grid","web","reference","Different-sized blocks grouped intentionally"],
  ["masonry-grid","Masonry grid","web","reference","Dense layout for unequal content heights"],
  // Editorial grids
  ["manuscript","Manuscript grid","editorial","reference","Single reading area for books and articles"],
  ["column","Column grid","editorial","css-recipe","Editorial columns and website sections"],
  ["modular","Modular grid","editorial","reference","Editorial or dashboard row-column modules"],
  ["baseline","Baseline grid","editorial","reference","Vertical typographic rhythm"],
  ["hierarchical","Hierarchical grid","editorial","reference","Content-led hierarchy"],
  ["asymmetric","Asymmetric grid","editorial","reference","Editorial variation with clear priority"],
  ["nested","Nested grid","editorial","reference","Independent layout inside a parent grid"],
  ["axial","Axial grid","editorial","reference","Composition around a central axis"],
  ["radial","Radial grid","editorial","reference","Items arranged around a center"],
  // Geometric composition guidelines: not literal CSS grid algorithms.
  ["rule-of-thirds","Rule of thirds","geometric","mathematical","3 × 3 photographic and visual guide"],
  ["phi","Phi grid","geometric","mathematical","Divisions using the golden ratio"],
  ["golden-spiral","Golden spiral","geometric","reference","Spiral-based composition guide"],
  ["fibonacci","Fibonacci grid","geometric","reference","Composition using Fibonacci rectangles"],
  ["golden-triangle","Golden triangle","geometric","reference","Diagonal-based geometric composition"],
  ["diagonal-method","Diagonal method","geometric","reference","Focal relationships along diagonals"],
  ["dynamic-symmetry","Dynamic symmetry","geometric","reference","Intersecting reciprocal lines"],
  ["harmonic-armature","Harmonic armature","geometric","reference","Detailed diagonal armature"],
  ["root-2","Root-2 rectangle","geometric","mathematical","1:√2 composition"],
  ["root-3","Root-3 rectangle","geometric","mathematical","1:√3 composition"],
  ["root-4","Root-4 rectangle","geometric","mathematical","1:2 composition"],
  ["root-5","Root-5 rectangle","geometric","mathematical","1:√5 composition"],
  // Historical book canons: scholarly references, not universally agreed UI defaults.
  ["golden-canon","Golden canon","classical","reference","Historical page proportion construction"],
  ["van-de-graaf","Van de Graaf canon","classical","reference","Text area by diagonal construction"],
  ["rosarivo","Rosarivo canon","classical","reference","Page area based on ninths"],
  ["villard","Villard de Honnecourt","classical","reference","Geometric division of rectangles"],
  ["golden-section","Golden section grid","classical","mathematical","Using golden-ratio proportions"],
  ["root-rectangle","Root rectangle grid","classical","mathematical","Using √n rectangle proportions"],
  // Spacing systems, deliberately separate from actual CSS columns.
  ["eight-point","8-point spacing grid","spacing","mathematical","Spacing increments based on 8px"],
  ["four-point","4-point spacing grid","spacing","mathematical","Spacing increments based on 4px"],
] as const satisfies readonly (readonly [string,string,GridFamily,GridDefinition["support"],string])[]

const caution: Record<GridFamily,string> = {
  web:"Test responsive behavior, content fit, zoom and keyboard reading order.",
  editorial:"Adapt to content density and reading measure; never sacrifice semantic order.",
  geometric:"A compositional guide, not a mandated CSS grid or UX law.",
  classical:"Historical construction with multiple interpretations; treat as reference, not an accessibility requirement.",
  spacing:"A spacing rhythm is not itself a column layout.",
}
export const gridRegistry: readonly GridDefinition[] = raw.map(([id,name,family,support,use])=>({
  id,name,family,support,use,caution:caution[family],
}))
export type GridId = (typeof raw)[number][0]
export function getGrid(id: GridId): GridDefinition {
  const item=gridRegistry.find((g)=>g.id===id)
  if(!item) throw new Error(`Unknown grid: ${id}`)
  return item
}
export function listGrids(family?:GridFamily):GridDefinition[]{
  return gridRegistry.filter((g)=>!family||g.family===family)
}
