/** Semantic color slots: a consumer theme must provide the actual colors. */
export const semanticColorRoles = [
  "canvas", "surface", "surface-subtle", "surface-raised",
  "text-primary", "text-secondary", "text-muted", "text-inverse",
  "border", "border-strong", "action", "action-hover", "on-action",
  "focus", "success", "warning", "danger", "info", "disabled",
] as const
export type SemanticColorRole = (typeof semanticColorRoles)[number]
/** An optional neutral starter theme, NOT a required product brand. */
export const starterNeutralTheme: Record<SemanticColorRole, string> = {
  canvas: "#ffffff", surface: "#ffffff", "surface-subtle": "#f7f7f8", "surface-raised": "#ffffff",
  "text-primary": "#111111", "text-secondary": "#343b43", "text-muted": "#535b64", "text-inverse": "#ffffff",
  border: "#c7cbd0", "border-strong": "#767e89", action: "#111111",
  "action-hover": "#333941", "on-action": "#ffffff",
  focus: "#005bbb", success: "#196b43", warning: "#815200", danger: "#ac251c",
  info: "#005bbb", disabled: "#eceeef",
}
