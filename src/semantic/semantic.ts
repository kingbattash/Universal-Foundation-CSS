/** Semantic intent, separate from visual colors and specific components. */
export const semantic = {
  content: ["page-title", "section-title", "description", "body", "caption", "metadata", "eyebrow"] as const,
  navigation: ["primary", "secondary", "local", "breadcrumb", "utility", "contextual"] as const,
  actions: ["primary", "secondary", "tertiary", "destructive", "subtle"] as const,
  status: ["neutral", "info", "success", "warning", "danger"] as const,
  surface: ["canvas", "surface", "raised", "inset", "overlay"] as const,
  interactionStates: ["rest", "hover", "focus-visible", "pressed", "selected", "disabled", "loading", "invalid"] as const,
  density: ["comfortable", "compact", "spacious"] as const,
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
