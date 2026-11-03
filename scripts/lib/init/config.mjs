/** Optional, user-owned UF-CSS builder configuration (v1). */
const plain = v => v !== null && typeof v === "object" && !Array.isArray(v);
const slug = /^[a-z][a-z0-9-]{0,47}$/;
const hex = /^#[a-f0-9]{6}$/i;
export const frameworks = ["vanilla-css", "tailwind-v4", "tailwind-v3", "bootstrap", "stylex", "react-native"];
export const layoutChoices = ["twelve-column", "eight-column", "manuscript", "modular", "custom"];
export const guideExamples = ["golden-ratio", "rule-of-thirds", "baseline"];
export const hierarchyExamples = ["typographic", "visual", "information", "structural", "interaction"];

function fail(message) { throw new Error(message); }
function keys(value, allowed, where) {
  if (!plain(value)) fail(where + " must be an object");
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(where + ": unknown option " + key);
}
function choices(values, where, allowed, allowCustom = false) {
  if (!Array.isArray(values)) fail(where + " must be an array");
  const results = [];
  for (const item of values) {
    if (typeof item !== "string" || !slug.test(item) || (!allowCustom && !allowed.includes(item))) fail(where + ": invalid choice " + item);
    if (results.includes(item)) fail(where + ": duplicate " + item);
    results.push(item);
  }
  return results;
}
function dimension(value, where, max = 1000) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max) fail(where + " must be positive and <= " + max);
  return value;
}
/** No presets or default visual choices are inserted. Empty selections are valid. */
export function normalizeBuilderConfig(input) {
  keys(input, ["schemaVersion", "name", "frameworks", "design"], "config");
  if (input.schemaVersion !== 1) fail("Unsupported schemaVersion; expected 1");
  if (typeof input.name !== "string" || !slug.test(input.name)) fail("name must be lowercase kebab-case");
  const selectedFrameworks = choices(input.frameworks ?? [], "frameworks", frameworks);
  const raw = input.design ?? {};
  keys(raw, ["colors", "typography", "spacing", "grids", "hierarchy"], "design");
  const colors = raw.colors ?? {};
  if (!plain(colors)) fail("design.colors must be an object");
  const normalizedColors = {};
  for (const [role, color] of Object.entries(colors)) {
    if (!slug.test(role) || ["__proto__", "constructor", "prototype"].includes(role)) fail("Invalid color role " + role);
    if (typeof color !== "string" || !hex.test(color)) fail("Invalid color hex for " + role + " (expected #RRGGBB)");
    normalizedColors[role] = color.toLowerCase();
  }
  const type = raw.typography ?? {};
  keys(type, ["headingFont", "bodyFont", "baseSizePx"], "typography");
  const typography = {};
  for (const field of ["headingFont", "bodyFont"]) {
    if (type[field] !== undefined) {
      if (typeof type[field] !== "string" || !type[field].trim() || type[field].length > 120 || /[;{}\r\n]/.test(type[field])) fail("Invalid " + field);
      typography[field] = type[field].trim();
    }
  }
  if (type.baseSizePx !== undefined) typography.baseSizePx = dimension(type.baseSizePx, "baseSizePx", 500);
  const space = raw.spacing ?? {};
  keys(space, ["unitPx"], "spacing");
  const spacing = {};
  if (space.unitPx !== undefined) spacing.unitPx = dimension(space.unitPx, "unitPx");
  const rawGrids = raw.grids ?? {};
  keys(rawGrids, ["layouts", "guides"], "grids");
  const selectedLayouts = rawGrids.layouts ?? [];
  if (!Array.isArray(selectedLayouts)) fail("grids.layouts must be an array");
  const layouts = [], ids = new Set();
  for (const layout of selectedLayouts) {
    keys(layout, ["id", "name", "columns"], "grid layout");
    if (!layoutChoices.includes(layout.id)) fail("Unknown grid layout: " + layout.id);
    if (layout.id === "custom") {
      if (!slug.test(layout.name ?? "")) fail("Custom grid requires a kebab-case name");
      if (!Number.isInteger(layout.columns) || layout.columns < 1 || layout.columns > 24) fail("Custom grid columns must be 1–24");
    } else if (layout.name !== undefined || layout.columns !== undefined) fail("Built-in grid does not accept custom columns/name");
    const id = layout.id === "custom" ? layout.name : layout.id;
    if (ids.has(id)) fail("Duplicate grid layout name: " + id);
    ids.add(id);
    layouts.push(layout.id === "custom" ? { id: "custom", name: layout.name, columns: layout.columns } : { id: layout.id });
  }
  const guides = choices(rawGrids.guides ?? [], "grids.guides", guideExamples, true);
  const hierarchy = choices(raw.hierarchy ?? [], "hierarchy", hierarchyExamples, true);
  return { schemaVersion: 1, name: input.name, frameworks: selectedFrameworks,
    design: { colors: normalizedColors, typography, spacing, grids: { layouts, guides }, hierarchy } };
}
export const gridDescriptions = Object.freeze({
  "twelve-column": "Twelve tracks; responsive behavior stays under project control.",
  "eight-column": "Eight tracks; optionally pair with a composition guide.",
  manuscript: "A single reading region for long-form content.",
  modular: "Four tracks; adjust and extend in your own project.",
  custom: "Define your own number of columns (1–24).",
});
export const guideDescriptions = Object.freeze({
  "golden-ratio": "Optional mathematical proportion, not a mandatory CSS grid.",
  "rule-of-thirds": "Optional 3×3 composition guide.",
  baseline: "Optional typography rhythm guide.",
});
export function combinationNotes(config) {
  const layouts = config.design.grids.layouts.map(l => l.id);
  const guides = config.design.grids.guides;
  const notes = [];
  if (layouts.length > 1) notes.push("Layouts can be assigned to distinct regions; no automatic overlap is imposed.");
  if (guides.includes("golden-ratio") && layouts.length) notes.push("Golden ratio is a composition reference; CSS grid tracks remain independent.");
  if (guides.includes("baseline")) notes.push("Baseline is a typography alignment guide, not a forced spacing scale.");
  if (!layouts.length && guides.length) notes.push("Guides may be documented without generating grid CSS.");
  return notes;
}
