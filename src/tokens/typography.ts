/** Style role sizes are starting points; platforms may adapt the rendering. */
export const typographyRoles = {
  display: { minPx: 48, maxPx: 96, weight: 600, lineHeight: 1.05 },
  h1: { minPx: 36, maxPx: 72, weight: 600, lineHeight: 1.12 },
  h2: { minPx: 30, maxPx: 52, weight: 600, lineHeight: 1.16 },
  h3: { minPx: 24, maxPx: 38, weight: 600, lineHeight: 1.2 },
  h4: { minPx: 22, maxPx: 26, weight: 600, lineHeight: 1.25 },
  body: { minPx: 16, maxPx: 18, weight: 400, lineHeight: 1.55 },
  bodySmall: { minPx: 14, maxPx: 16, weight: 400, lineHeight: 1.5 },
  caption: { minPx: 12, maxPx: 14, weight: 400, lineHeight: 1.4 },
} as const
export type TypographyRole = keyof typeof typographyRoles
