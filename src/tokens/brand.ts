/**
 * Brand slots deliberately have NO brand colors or fonts.
 * Project design systems implement these roles.
 */
export const brandRoles = [
  "brand-primary", "brand-accent", "brand-muted", "brand-on-primary",
  "brand-heading-font", "brand-body-font", "brand-radius-style",
] as const
export type BrandRole = (typeof brandRoles)[number]
