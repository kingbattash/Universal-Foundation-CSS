/** Numeric seed values. Products may configure these, not clone them. */
export const coreTokens = {
  spacingUnitPx: 4,
  spacingSteps: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32],
  neutral: {
    white: "#ffffff", gray50: "#f7f7f8", gray100: "#eceeef", gray300: "#c7cbd0",
    gray600: "#5f6670", gray800: "#272c33", black: "#111111",
  },
  radiiPx: { none: 0, sm: 4, md: 8, lg: 12, xl: 20, pill: 9999 },
} as const
