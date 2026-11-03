import type { HierarchyId } from "../hierarchy/hierarchy.js"
import type { GridId } from "../grid/registry.js"
export interface PatternContract{
  id:string
  purpose:string
  readingOrder:readonly string[]
  hierarchy:readonly HierarchyId[]
  suggestedGrids:readonly GridId[]
  caution:string
}
export const patterns=[
  {id:"hero",purpose:"Explain a page promise and direct a next action",readingOrder:["eyebrow","h1","lede","primary-action","evidence"],hierarchy:["content","typographic","visual","interaction"],suggestedGrids:["twelve-column","phi"],caution:"One dominant message; no autoplay content required for comprehension."},
  {id:"article",purpose:"Support sustained reading and evidence assessment",readingOrder:["title","metadata","abstract","article-body","references"],hierarchy:["semantic","information","spacing"],suggestedGrids:["manuscript","baseline"],caution:"Constrain reading width; figures need captions and text alternatives."},
  {id:"dashboard",purpose:"Support operational decisions",readingOrder:["heading","exceptions","tasks","metrics","records"],hierarchy:["information","layout","state-feedback"],suggestedGrids:["twelve-column","modular"],caution:"Actionable exceptions may take priority over decorative metrics."},
  {id:"form",purpose:"Complete a task with accessible inputs",readingOrder:["purpose","field-labels","inputs","help-or-errors","submit","result"],hierarchy:["semantic","interaction","state-feedback"],suggestedGrids:["manuscript","responsive-grid"],caution:"Do not claim success until the operation finishes."},
  {id:"collection",purpose:"Browse comparable items",readingOrder:["heading","filter","items","pagination"],hierarchy:["grouping","navigation","spatial"],suggestedGrids:["twelve-column","column"],caution:"Avoid card treatment when a list or table is more useful."},
] as const satisfies readonly PatternContract[]
export type PatternId=(typeof patterns)[number]["id"]
