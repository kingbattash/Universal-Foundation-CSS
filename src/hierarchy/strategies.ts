/**
 * Optional implementation techniques. These are independent of visual
 * values, brands and frameworks. CSS hooks are opt-in; none are a requirement.
 */
export const hierarchyStrategies = {
  "semantic-markup": { intent: "Represent content meaning with native document structure.", cssHook: null },
  "content-sequence": { intent: "Author meaningful DOM reading order before visual arrangement.", cssHook: null },
  "type-scale": { intent: "Choose distinct, creator-owned typographic levels.", cssHook: ".uf-h-level" },
  "font-emphasis": { intent: "Adjust weight or emphasis with author-provided variables.", cssHook: ".uf-h-emphasis" },
  "reading-measure": { intent: "Constrain long-form line length to content and audience.", cssHook: ".uf-h-measure" },
  "group-proximity": { intent: "Connect related items with a creator-selected grouping gap.", cssHook: ".uf-h-group" },
  "spatial-alignment": { intent: "Align grouped regions without changing source order.", cssHook: ".uf-h-flow" },
  "navigation-landmarks": { intent: "Expose navigable landmarks and descriptive link labels.", cssHook: null },
  "component-composition": { intent: "Define nested components without changing their semantics.", cssHook: null },
  "semantic-color": { intent: "Use creator-defined color as redundant, nonexclusive emphasis.", cssHook: ".uf-h-emphasis" },
  "contrast-differentiation": { intent: "Differentiate important items while checking actual contrast.", cssHook: ".uf-h-emphasis" },
  "layer-boundaries": { intent: "Indicate meaningful overlay boundaries; manage focus separately.", cssHook: ".uf-h-layer" },
  "motion-feedback": { intent: "Animate changes only where useful and respect reduced motion.", cssHook: ".uf-h-motion" },
  "action-emphasis": { intent: "Clarify action purpose and priority without inventing a visual standard.", cssHook: ".uf-h-emphasis" },
  "state-messaging": { intent: "Show status in text and non-color-only cues.", cssHook: ".uf-h-state" },
  "responsive-reflow": { intent: "Reflow content at creator-selected widths while preserving DOM order.", cssHook: ".uf-h-flow" },
} as const;
export type HierarchyStrategyId = keyof typeof hierarchyStrategies;
export function getHierarchyStrategy(id: HierarchyStrategyId) {
  return hierarchyStrategies[id];
}
