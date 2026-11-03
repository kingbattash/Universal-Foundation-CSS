/**
 * Research-informed UX principles are explanatory, not inviolable formulae.
 * No single universally recognized "Number One Law" exists in UI/UX.
 */
export const uxPrinciples = [
  { id: "fitts", name: "Fitts's Law", idea: "Target selection time depends on distance and effective target size.", use: "Make important touch targets sufficiently large and reachable.", caution: "A model of movement, not a universal pixel prescription." },
  { id: "hick-hyman", name: "Hick–Hyman Law", idea: "Choosing among alternatives can grow harder as uncertainty increases.", use: "Group meaningful choices, prioritize frequent tasks.", caution: "Do not replace necessary options with hidden navigation." },
  { id: "jakob", name: "Jakob's Law", idea: "People transfer expectations from experiences with other interfaces.", use: "Prefer recognizable navigation and control affordances.", caution: "Conventions evolve; novelty is not always bad." },
  { id: "gestalt-proximity", name: "Gestalt proximity", idea: "Nearby items are perceived as related.", use: "Separate groups more than items within them.", caution: "Spacing cannot replace explicit semantic structure." },
  { id: "gestalt-similarity", name: "Gestalt similarity", idea: "Similar-looking elements appear related.", use: "Style equivalent actions consistently.", caution: "Similar styling cannot imply identical outcomes unless true." },
  { id: "progressive-disclosure", name: "Progressive disclosure", idea: "Present essentials before complexity when appropriate.", use: "Place secondary controls in context rather than overwhelming the first view.", caution: "Do not hide material terms, safety or risk information." },
  { id: "serial-position", name: "Serial-position effect", idea: "Beginning and end positions may be more memorable.", use: "Review key information placement and summary structure.", caution: "Not a guaranteed attention or conversion law." },
] as const
export type UxPrincipleId = (typeof uxPrinciples)[number]["id"]
