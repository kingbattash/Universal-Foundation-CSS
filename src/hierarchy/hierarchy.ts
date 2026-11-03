/**
 * A working classification, not 20 universally independent scientific types.
 * Some items describe broad hierarchies while others are techniques that express them.
 */
export const hierarchy = [
  { id: "visual", family: "communication", label: "Visual", meaning: "Direct attention based on importance.", technique: false },
  { id: "typographic", family: "communication", label: "Typographic", meaning: "Differentiate text roles with size, weight, leading and measure.", technique: false },
  { id: "content", family: "communication", label: "Content", meaning: "Prioritize messages based on the user's task.", technique: false },
  { id: "semantic", family: "communication", label: "Semantic", meaning: "Express meaning through document structures and roles.", technique: false },
  { id: "information", family: "communication", label: "Information", meaning: "Organize broad-to-specific information.", technique: false },
  { id: "layout", family: "structural", label: "Layout", meaning: "Organize page regions and visual groups.", technique: false },
  { id: "spatial", family: "structural", label: "Spatial", meaning: "Use position, alignment and space to show relationships.", technique: false },
  { id: "navigation", family: "structural", label: "Navigation", meaning: "Prioritize routes and wayfinding.", technique: false },
  { id: "component", family: "structural", label: "Component", meaning: "Define ownership and nested component relationships.", technique: false },
  { id: "grouping", family: "structural", label: "Grouping", meaning: "Group related elements by proximity and containment.", technique: false },
  { id: "size", family: "visual-technique", label: "Size", meaning: "Use relative dimensions to establish emphasis.", technique: true },
  { id: "weight", family: "visual-technique", label: "Weight", meaning: "Use font weight or visual mass for emphasis.", technique: true },
  { id: "color", family: "visual-technique", label: "Color", meaning: "Use semantic color roles to clarify meaning.", technique: true },
  { id: "contrast", family: "visual-technique", label: "Contrast", meaning: "Make important elements distinct while preserving legibility.", technique: true },
  { id: "spacing", family: "visual-technique", label: "Spacing", meaning: "Use whitespace to group and separate content.", technique: true },
  { id: "depth", family: "visual-technique", label: "Depth", meaning: "Indicate layering and overlays where relevant.", technique: true },
  { id: "motion", family: "visual-technique", label: "Motion", meaning: "Clarify state changes with restrained movement.", technique: true },
  { id: "interaction", family: "interactive", label: "Interaction", meaning: "Prioritize user actions and controls.", technique: false },
  { id: "state-feedback", family: "interactive", label: "State and feedback", meaning: "Communicate current status, warnings and outcomes.", technique: false },
  { id: "responsive", family: "interactive", label: "Responsive", meaning: "Preserve priorities across device sizes and capabilities.", technique: false },
] as const
export type HierarchyId = (typeof hierarchy)[number]["id"]
export type HierarchyFamily = (typeof hierarchy)[number]["family"]
export function getHierarchy(id: HierarchyId) {
  const item = hierarchy.find((h) => h.id === id)
  if (!item) throw new Error(`Unknown hierarchy: ${id}`)
  return item
}
export function listHierarchyFamily(family: HierarchyFamily) {
  return hierarchy.filter((item) => item.family === family)
}
