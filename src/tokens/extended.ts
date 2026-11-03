/** Optional future roles; implementation is product-specific. */
export const extendedTokenRoles = {
  elevation: ["none", "subtle", "raised", "overlay"],
  density: ["compact", "comfortable", "spacious"],
  zLayer: ["base", "sticky", "popover", "dialog", "toast"],
  chart: ["categorical", "sequential", "diverging", "neutral"],
} as const
