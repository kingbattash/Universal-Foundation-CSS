import { frameworks, layoutChoices, gridDescriptions, guideExamples, guideDescriptions, hierarchyExamples } from "./config.mjs";

/** Each question group is optional. The returned configuration belongs to the user. */
const split = value => value.split(",").map(s => s.trim()).filter(Boolean);
function numberOrSkip(input, label) {
  if (!input.trim()) return undefined;
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) throw new Error(label + " must be a positive number");
  return value;
}
function parseColors(input) {
  const colors = {};
  for (const pair of split(input)) {
    const at = pair.indexOf("=");
    if (at === -1) throw new Error("Colors must be entered as role=#RRGGBB");
    const role = pair.slice(0, at).trim(), color = pair.slice(at + 1).trim();
    if (Object.hasOwn(colors, role)) throw new Error("Duplicate color role: " + role);
    colors[role] = color;
  }
  return colors;
}
/** ask() can come from readline, a mock in tests, or another UI shell. */
export async function collectWizard(ask, say = console.log) {
  say("UF-CSS creates YOUR design system. Press Enter to skip any design decision.");
  const name = (await ask("Project ID (kebab-case, required): ")).trim();
  const suggestedOut = (await ask("Output directory [./" + name + "]: ")).trim() || "./" + name;
  say("Framework options: " + frameworks.join(", ") + ". Blank means configuration only.");
  const selectedFrameworks = split(await ask("Frameworks (comma-separated; blank skips): "));
  say("You choose arbitrary color role names and hex codes; no default palette is selected.");
  const colors = parseColors(await ask("Colors (e.g. primary=#2563eb,canvas=#ffffff; blank skips): "));
  const headingFont = (await ask("Heading font family (blank skips): ")).trim();
  const bodyFont = (await ask("Body font family (blank skips): ")).trim();
  const baseSizePx = numberOrSkip(await ask("Base font size in px (blank skips): "), "Base font size");
  const unitPx = numberOrSkip(await ask("Spacing unit in px (blank skips): "), "Spacing unit");
  say("Structural grid choices (optional):");
  for (const id of layoutChoices) say("  " + id + " — " + gridDescriptions[id]);
  const chosenLayouts = split(await ask("Layout grids (comma-separated; blank skips): "));
  const layouts = [];
  for (const id of chosenLayouts) {
    if (id === "custom") {
      const customName = (await ask("Custom grid name (kebab-case): ")).trim();
      const columns = Number((await ask("Custom grid columns (1-24): ")).trim());
      layouts.push({ id: "custom", name: customName, columns });
    } else layouts.push({ id });
  }
  say("Composition guides can accompany ANY grid or no grid.");
  for (const id of guideExamples) say("  " + id + " — " + guideDescriptions[id]);
  const guides = split(await ask("Composition guides (names or custom names, comma-separated; blank skips): "));
  say("Hierarchy examples: " + hierarchyExamples.join(", ") + ". You may invent your own.");
  const hierarchy = split(await ask("Hierarchy approaches (comma-separated; blank skips): "));
  return {
    suggestedOut,
    config: {
      schemaVersion: 1, name, frameworks: selectedFrameworks,
      design: {
        colors,
        typography: {
          ...(headingFont ? { headingFont } : {}),
          ...(bodyFont ? { bodyFont } : {}),
          ...(baseSizePx !== undefined ? { baseSizePx } : {}),
        },
        spacing: unitPx !== undefined ? { unitPx } : {},
        grids: { layouts, guides },
        hierarchy,
      },
    },
  };
}
