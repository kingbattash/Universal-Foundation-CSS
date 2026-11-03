# Interactive design-system builder

The interactive builder helps you **create your own design system**. It never selects an obligatory palette, grid, hierarchy, typography scale or CSS framework. Every design question can be skipped.

> **Status: experimental, available on the feature branch.** UF-CSS has **not** been published to npm, so run it from a cloned repository or after installing a local packed copy. Do **not** assume `npx uf-css init` is already available from the npm registry.

## Interactive setup

From a UF-CSS checkout:

```bash
node scripts/cli.mjs init
```

The terminal asks for a project ID, target directory, framework(s), custom color role/hex values, optional font families, base text size, spacing unit, structural grid(s), composition guide(s), and hierarchy approach(es).

Example interaction (your answers are not required defaults):

```text
Project ID: coastal-ui
Output directory [./coastal-ui]: ./my-systems/coastal-ui
Frameworks: vanilla-css,tailwind-v4
Colors: primary=#1b6574,canvas=#ffffff,text=#1a2530
Heading font family: Georgia
Body font family: [skip]
Base font size in px: 18
Spacing unit in px: 6
Layout grids: twelve-column,manuscript
Composition guides: golden-ratio,baseline
Hierarchy approaches: typographic,information

=== Design system preview — nothing has been written ===
Project: coastal-ui
Output: /path/to/my-systems/coastal-ui
...
Planned files:
  design-system.config.json
  tokens/system.tokens.json
  generated/tokens.css
  generated/tailwind-v4.css
  composition/selected.json
  composition/layout.css
  hierarchy/selected.json
  README.md
=========================================================
Generate these files? Type yes to confirm: yes
```

Typing anything other than **yes** cancels with no project folder created. Existing files are never overwritten without the explicit `--force` option.

## Grid combinations

The wizard distinguishes **structural layouts** from **composition guides**.

- Layouts: twelve-column, eight-column, manuscript, modular, or a custom layout with 1–24 columns. Select more than one for different areas of a product.
- Guides: golden-ratio, rule-of-thirds, baseline, or any custom name. These are optional annotations/reference choices and do **not** automatically change the layout.
- Hierarchy: typographic, visual, information, structural, interaction, or any user-defined name.

The generator produces simple opt-in grid CSS classes **only for the structural grids you explicitly selected**, and only when a CSS-based framework is selected. Custom hierarchy and guide choices are recorded as JSON specifications without forced visual implementation. The developer still decides responsiveness and actual component appearances.

**Examples, not rules:** twelve-column + golden-ratio, manuscript + baseline, or a custom five-column layout with an original composition guide. A project with **no grid or hierarchy** is also valid.

## Non-interactive / AI-agent setup

AI agents and build systems should use explicit JSON configuration and preview it before asking for approval.

```bash
# Read-only preview; does not create any folder
node scripts/cli.mjs init \
  --config examples/builder/editorial.config.json \
  --out ./preview/editorial \
  --dry-run

# Only after the creator approves the exact paths and design choices
node scripts/cli.mjs init \
  --config examples/builder/editorial.config.json \
  --out ./my-systems/editorial \
  --yes
```

The configuration format:

```json
{
  "schemaVersion": 1,
  "name": "my-product",
  "frameworks": ["vanilla-css", "tailwind-v4"],
  "design": {
    "colors": { "primary": "#2563eb" },
    "typography": { "headingFont": "Georgia", "baseSizePx": 18 },
    "spacing": { "unitPx": 6 },
    "grids": {
      "layouts": [{ "id": "custom", "name": "feature", "columns": 5 }],
      "guides": ["golden-ratio", "custom-guide"]
    },
    "hierarchy": ["typographic", "my-hierarchy"]
  }
}
```

Every `design` field can be omitted or left empty. Supported frameworks: `vanilla-css`, `tailwind-v3`, `tailwind-v4`, `bootstrap`, `stylex`, `react-native`. An empty framework list generates only the configuration/specifications, not an unnecessary CSS adapter.

The `--yes` option is deliberately restricted to `--config` mode, making it safer for automation. A config invocation without `--yes` requires real terminal confirmation. `--dry-run` never writes files.

## Where the implementation lives

| Purpose | File |
| --- | --- |
| Project CLI dispatcher | `scripts/cli.mjs` |
| Wizard entry and confirmation | `scripts/init-project.mjs` |
| Interactive question prompts | `scripts/lib/init/wizard.mjs` |
| Configuration validation and choice guidance | `scripts/lib/init/config.mjs` |
| Conditional outputs and overwrite safety | `scripts/lib/init/scaffold.mjs` |
| Framework token generation | `scripts/lib/custom-tokens.mjs` |
| Sample configuration | `examples/builder/editorial.config.json` |
| Unit/CLI safety tests | `tests/builder.test.mjs` |

## Current limits and future enhancements

- This is a **terminal wizard**, not a graphical color picker or drag-and-drop grid editor.
- Colors use valid `#RRGGBB` hex input. If text and canvas are both provided, the preview reports contrast guidance; it does not force a particular palette.
- Grid layouts use basic CSS grid tracks; they do not automatically supply responsive breakpoints, row structures or historical geometric constructions.
- Hierarchy and guide selections are saved as design intentions, not fully generated UI components.
- Design choices can be edited in the saved JSON and explicitly regenerated. An interactive resume/edit existing project workflow is not yet implemented.
- The wizard supports a focused set of interactive questions; full arbitrary DTCG authoring remains available via [the lower-level custom-system compiler](CUSTOM_SYSTEMS.md).
- The builder does not install npm dependencies, edit unrelated projects, publish packages or automatically deploy anything.

**The user owns the design system. UF-CSS only helps create it.**
