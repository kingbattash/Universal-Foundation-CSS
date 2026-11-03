/** Semantic intent, separate from visual colors and specific components. */
export const semantic = {
  content: ["page-title", "section-title", "description", "body", "caption", "metadata", "eyebrow"] as const,
  navigation: ["primary", "secondary", "local", "breadcrumb", "utility", "contextual"] as const,
  actions: ["primary", "secondary", "tertiary", "destructive", "subtle"] as const,
  status: ["neutral", "info", "success", "warning", "danger"] as const,
  surface: ["canvas", "surface", "raised", "inset", "overlay"] as const,
  interactionStates: ["rest", "hover", "focus-visible", "pressed", "selected", "disabled", "loading", "invalid"] as const,
  density: ["comfortable", "compact", "spacious"] as const,
  // Optional descriptive vocabulary, not reserved names or required roles.
  document: ["page", "article", "section", "heading", "paragraph", "list", "figure", "form", "table"] as const,
  regions: ["banner", "main", "navigation", "complementary", "search", "contentinfo"] as const,
  feedback: ["error", "progress", "status-message", "confirmation", "instruction"] as const,
  accessibility: ["label", "description", "live-announcement", "focus-target", "skip-link"] as const,
  responsive: ["reflow", "persistent", "collapsible", "scroll-container", "adaptive-density"] as const,
} as const

export type SemanticContent = (typeof semantic.content)[number]
export type SemanticAction = (typeof semantic.actions)[number]
export type SemanticStatus = (typeof semantic.status)[number]
export type InteractionState = (typeof semantic.interactionStates)[number]

export const semanticGuidance = {
  documentOrder: "DOM reading order follows meaning; CSS visual order must not contradict keyboard or screen-reader sequence.",
  aria: "Prefer native semantic HTML. Only introduce ARIA when needed for missing native meaning.",
  feedback: "Present text or icons with color; color must not communicate critical status alone.",
  disabled: "Disabled controls should have a discoverable explanation when users need to understand why.",
  focus: "Maintain a visible focus indicator and keyboard access.",
  contrast: "WCAG AA target: >=4.5:1 normal text and >=3:1 large text.",
  touch: "44×44 CSS px is a UF-CSS ergonomic recommendation, not the universal WCAG 2.2 AA minimum.",
} as const

/** Creators can declare completely different semantic names (including Unicode). */
export function defineSemanticRoles(roles: readonly string[]): readonly string[] {
  if (!Array.isArray(roles)) throw new TypeError("roles must be an array");
  const values = roles.map((role) => {
    if (typeof role !== "string" || !role.trim() || role.length > 128 || /[\u0000-\u001f\u007f]/u.test(role)) {
      throw new TypeError("role must be a printable nonempty string up to 128 characters");
    }
    return role.trim();
  });
  if (new Set(values).size !== values.length) throw new RangeError("duplicate semantic role");
  return Object.freeze(values);
}
