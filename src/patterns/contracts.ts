import type { HierarchyId } from "../hierarchy/hierarchy.js";
import type { GridId } from "../grid/registry.js";

/**
 * These are optional task patterns, not page templates or pixel-perfect designs.
 * Suggested grids are nonbinding references and may be ignored completely.
 */
export interface PatternContract {
  readonly id:string;
  readonly purpose:string;
  readonly readingOrder:readonly string[];
  readonly hierarchy:readonly HierarchyId[];
  readonly suggestedGrids:readonly GridId[];
  readonly caution:string;
}
export const patterns = [
  {id:"hero",purpose:"Explain a page promise and direct a next action",readingOrder:["eyebrow","h1","lede","primary-action","evidence"],hierarchy:["content","typographic","visual","interaction"],suggestedGrids:["twelve-column","phi"],caution:"One dominant message; no autoplay content required for comprehension."},
  {id:"article",purpose:"Support sustained reading and evidence assessment",readingOrder:["title","metadata","abstract","article-body","references"],hierarchy:["semantic","information","spacing"],suggestedGrids:["manuscript","baseline"],caution:"Constrain reading width; figures need captions and text alternatives."},
  {id:"dashboard",purpose:"Support operational decisions",readingOrder:["heading","exceptions","tasks","metrics","records"],hierarchy:["information","layout","state-feedback"],suggestedGrids:["twelve-column","modular"],caution:"Actionable exceptions may take priority over decorative metrics."},
  {id:"form",purpose:"Complete a task with accessible inputs",readingOrder:["purpose","field-labels","inputs","help-or-errors","submit","result"],hierarchy:["semantic","interaction","state-feedback"],suggestedGrids:["manuscript","responsive-grid"],caution:"Do not claim success until the operation finishes."},
  {id:"collection",purpose:"Browse comparable items",readingOrder:["heading","filter","items","pagination"],hierarchy:["grouping","navigation","spatial"],suggestedGrids:["twelve-column","column"],caution:"Avoid card treatment when a list or table is more useful."},
  {id:"section",purpose:"Group a coherent topic with clear heading and related content",readingOrder:["heading","summary","content","actions"],hierarchy:["semantic","grouping","typographic"],suggestedGrids:["manuscript","responsive-grid"],caution:"Avoid arbitrary heading levels dictated by font size."},
  {id:"editorial-split",purpose:"Pair long-form narrative and supporting visual or evidence",readingOrder:["heading","narrative","supporting-media","source"],hierarchy:["content","layout","responsive"],suggestedGrids:["column","asymmetric"],caution:"Reflow at narrow widths without changing meaningful DOM sequence."},
  {id:"filters",purpose:"Refine a results set without hiding the applied constraints",readingOrder:["label","controls","applied-filters","result-count","clear"],hierarchy:["interaction","state-feedback","grouping"],suggestedGrids:["responsive-grid","nested"],caution:"Every filter requires an accessible label and a reversible application method."},
  {id:"table",purpose:"Review and act on comparable data records",readingOrder:["heading","toolbar","caption","headers","rows","pagination","feedback"],hierarchy:["information","semantic","interaction"],suggestedGrids:["responsive-grid","modular"],caution:"Preserve table semantics or explicitly select a different presentation for non-tabular data."},
  {id:"auth",purpose:"Authenticate with understandable error, recovery and completion states",readingOrder:["purpose","credentials","help-or-errors","submit","recovery","feedback"],hierarchy:["semantic","interaction","state-feedback"],suggestedGrids:["manuscript","responsive-grid"],caution:"Avoid ambiguous errors, misleading completion messages, and blocking password managers."},
] as const satisfies readonly PatternContract[];
export type PatternId = typeof patterns[number]["id"];
