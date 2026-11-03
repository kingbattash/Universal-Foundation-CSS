import { mkdir, lstat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { generateCustomSystem } from "../custom-tokens.mjs";
import { combinationNotes, normalizeBuilderConfig } from "./config.mjs";
import { contrast } from "../project-theme.mjs";

const scalar = (type, value) => ({ $type: type, $value: value });
function colorToken(hex) {
  return scalar("color", { colorSpace: "srgb",
    components: [1, 3, 5].map(i => Number((parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(8))), hex });
}
export function createTokenSource(config) {
  const { colors, typography, spacing } = config.design;
  const tokens = {};
  if (Object.keys(colors).length) {
    tokens.palette = Object.fromEntries(Object.entries(colors).map(([name, hex]) => [name, colorToken(hex)]));
  }
  const type = {};
  if (typography.headingFont) type.heading = scalar("fontFamily", [typography.headingFont]);
  if (typography.bodyFont) type.body = scalar("fontFamily", [typography.bodyFont]);
  if (typography.baseSizePx) type.baseSize = scalar("dimension", { value: typography.baseSizePx, unit: "px" });
  if (Object.keys(type).length) tokens.typography = type;
  if (spacing.unitPx) tokens.spacing = { unit: scalar("dimension", { value: spacing.unitPx, unit: "px" }) };
  return tokens;
}
function buildMapping(config) {
  const { colors, typography, spacing } = config.design;
  const tailwind = { colors: {}, spacing: {}, radii: {}, fonts: {} };
  for (const role of Object.keys(colors)) tailwind.colors[role] = "palette." + role;
  if (typography.headingFont) tailwind.fonts.heading = "typography.heading";
  if (typography.bodyFont) tailwind.fonts.body = "typography.body";
  if (spacing.unitPx) tailwind.spacing.unit = "spacing.unit";
  const bootstrap = {};
  if (colors.primary) {
    bootstrap["--bs-primary"] = "palette.primary";
    bootstrap["--bs-primary-rgb"] = "palette.primary";
  }
  if (colors.canvas) bootstrap["--bs-body-bg"] = "palette.canvas";
  if (colors.text) bootstrap["--bs-body-color"] = "palette.text";
  return { tailwind, bootstrap };
}
function gridCss(config) {
  const { layouts } = config.design.grids;
  if (!layouts.length) return null;
  const prefix = config.name;
  const lines = ["/* Only explicitly selected structural grids. Responsive breakpoints are your decision. */"];
  for (const layout of layouts) {
    const name = layout.id === "custom" ? layout.name : layout.id;
    const count = layout.id === "twelve-column" ? 12 : layout.id === "eight-column" ? 8 :
      layout.id === "modular" ? 4 : layout.id === "manuscript" ? 1 : layout.columns;
    lines.push("." + prefix + "-grid--" + name + " {",
      "  display: grid;",
      "  grid-template-columns: repeat(" + count + ", minmax(0, 1fr));");
    if (config.design.spacing.unitPx) lines.push("  gap: var(--" + prefix + "-spacing-unit);");
    lines.push("}", "");
  }
  return lines.join("\n");
}
const usesCss = fw => ["vanilla-css", "tailwind-v3", "tailwind-v4", "bootstrap"].includes(fw);
export function buildScaffold(input) {
  const config = normalizeBuilderConfig(input);
  const files = {};
  const tokens = createTokenSource(config);
  const hasTokens = Object.keys(tokens).length > 0;
  const frameworks = config.frameworks;
  const web = frameworks.some(usesCss);
  files["design-system.config.json"] = JSON.stringify(config, null, 2) + "\n";
  if (hasTokens) {
    files["tokens/system.tokens.json"] = JSON.stringify(tokens, null, 2) + "\n";
    const generated = generateCustomSystem({ source: tokens, prefix: config.name, mapping: buildMapping(config) });
    if (web) files["generated/tokens.css"] = generated["tokens.css"];
    if (frameworks.includes("tailwind-v4")) files["generated/tailwind-v4.css"] = generated["tailwind-v4.css"];
    if (frameworks.includes("tailwind-v3")) files["generated/tailwind-v3.cjs"] = generated["tailwind-v3.cjs"];
    if (frameworks.includes("bootstrap")) files["generated/bootstrap.css"] = generated["bootstrap.css"];
    if (frameworks.includes("stylex")) files["generated/stylex.stylex.ts"] = generated["stylex.stylex.ts"];
    if (frameworks.includes("react-native")) files["generated/native.ts"] = generated["native.ts"];
  }
  if (config.design.grids.layouts.length || config.design.grids.guides.length) {
    files["composition/selected.json"] = JSON.stringify(config.design.grids, null, 2) + "\n";
    if (web && config.design.grids.layouts.length) files["composition/layout.css"] = gridCss(config);
  }
  if (config.design.hierarchy.length) {
    files["hierarchy/selected.json"] = JSON.stringify({ strategies: config.design.hierarchy }, null, 2) + "\n";
  }
  const notes = combinationNotes(config);
  if (config.design.colors.text && config.design.colors.canvas) {
    const ratio = contrast(config.design.colors.text, config.design.colors.canvas);
    notes.push("Text/canvas contrast " + ratio.toFixed(2) + ":1" + (ratio < 4.5 ? " (below WCAG AA for ordinary text; review before release)." : " (meets the WCAG AA ordinary-text contrast threshold)."));
  }
  files["README.md"] = [
    "# " + config.name + " — Your Design System", "",
    "Created using the independent Universal Foundation CSS toolkit.",
    "No universal design palette, typography, grid or hierarchy was imposed.", "",
    "## Your choices", "",
    "- Frameworks: " + (frameworks.join(", ") || "none (configuration only)"),
    "- Color roles: " + (Object.keys(config.design.colors).join(", ") || "none"),
    "- Layout grids: " + (config.design.grids.layouts.map(l => l.id === "custom" ? l.name + " (" + l.columns + " columns)" : l.id).join(", ") || "none"),
    "- Composition guides: " + (config.design.grids.guides.join(", ") || "none"),
    "- Hierarchy strategies: " + (config.design.hierarchy.join(", ") || "none"), "",
    ...(notes.length ? ["## Combination notes", "", ...notes.map(n => "- " + n), ""] : []),
    "## Editing", "",
    "Edit design-system.config.json, then explicitly regenerate using the UF-CSS builder.",
    "Only selected adapters have been generated; guide and hierarchy choices are references, not imposed global styles.",
    "This folder is independent of UF-CSS starter design tokens and company branding.", "",
  ].join("\n");
  return { config, files, notes };
}
async function statOrNull(path) {
  try { return await lstat(path); } catch(e) { if (e.code === "ENOENT") return null; throw e; }
}
async function assertNoSymlinks(out, file) {
  const target = resolve(out, file);
  if (!target.startsWith(resolve(out) + sep)) throw new Error("File path escapes output directory: " + file);
  let current = target;
  while (true) {
    const s = await statOrNull(current);
    if (s?.isSymbolicLink()) throw new Error("Refusing symbolic link: " + current);
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
export async function writeScaffold(out, files, { force = false } = {}) {
  const destination = resolve(out);
  const existing = [];
  for (const file of Object.keys(files)) {
    await assertNoSymlinks(destination, file);
    const status = await statOrNull(join(destination, file));
    if (status) {
      if (!status.isFile()) throw new Error("Generated destination is not a regular file: " + file);
      existing.push(file);
    }
  }
  if (existing.length && !force) throw new Error("Existing generated files; refusing overwrite: " + existing.join(", "));
  // No folder is created until after validation, preflight and user confirmation.
  for (const [file, content] of Object.entries(files)) {
    const target = join(destination, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, { encoding: "utf8", flag: force ? "w" : "wx" });
  }
}
