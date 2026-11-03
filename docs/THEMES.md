# Create your own project theme with UF-CSS

**Universal Foundation CSS is a framework-neutral construction toolkit, not a visual design system.** Your project owns its palette, typography, spacing, density, radii, motion, component states, hierarchy and grid.

There are two formats. For **new projects**, use **v2 independent themes**, which never load UF-CSS neutral starter values. The old v1 neutral-starter format remains available only for backwards compatibility.

## Create an independent project theme (v2)

Two completely different sample systems are provided:

- [Copper Editorial](../examples/project-theme/editorial.v2.json): warm cream and deep wine colors, serif typography, sharp corners, 7px/29px spacing.
- [Harbor Operations](../examples/project-theme/operations.v2.json): blue operational colors, sans-serif typography, rounded corners, 5px/17px spacing.

Both include their own light/dark colors, type families/weights, spacing, card radii, interaction durations, explicit Tailwind/Bootstrap mappings and contrast checks. Neither inherits a palette, font, spacing system, hierarchy or grid from UF-CSS.

\`\`\`bash
# From the current Git checkout:
node scripts/generate-project-theme.mjs \
  --config examples/project-theme/editorial.v2.json \
  --out ./generated/editorial

# Generate an unrelated product using the same universal toolkit:
node scripts/generate-project-theme.mjs \
  --config examples/project-theme/operations.v2.json \
  --out ./generated/operations
\`\`\`

The generator writes eight outputs: \`theme.css\`, \`tailwind-v3.cjs\`, \`tailwind-v4.css\`, \`bootstrap.css\`, \`stylex-vars.stylex.ts\`, \`stylex-theme.stylex.ts\`, \`native-theme.ts\` and \`theme.manifest.json\`.

The design configuration is **canonical**. A theme mode overrides only the tokens you explicitly select. See [THEME-CONTRACT.md](THEME-CONTRACT.md) for the complete format, ordering rules, color contrast behavior, framework imports and migration policy.

### View two genuinely different HTML specimens

From the repository root, generate both themes into the expected example directories:

```bash
node scripts/generate-project-theme.mjs --config examples/project-theme/editorial.v2.json --out generated/editorial
node scripts/generate-project-theme.mjs --config examples/project-theme/operations.v2.json --out generated/operations
python -m http.server 8000
```

Then visit `http://localhost:8000/examples/project-theme/preview-editorial.html` and `http://localhost:8000/examples/project-theme/preview-operations.html`. Each example has its own visual layout and light/dark toggle. These examples are optional, contain fictional product identities and do not add product styling to UF-CSS core.

These are browser-viewable demonstrations. The CI tests check their dependency paths and framework compilation; automated browser screenshots, keyboard and screen-reader verification are planned in Phase 09.

### Preview and use in your project

Open the v2 JSON file to review your own chosen values. Each generated \`theme.css\` contains light/dark properties named \`--<project-name>-<your-token-path>\`.

Example (Copper Editorial):

\`\`\`css
@import "./generated/editorial/theme.css";
@import "./generated/editorial/tailwind-v4.css";
\`\`\`

With Tailwind v4, include \`@import "tailwindcss";\` first. With Bootstrap, load Bootstrap CSS, then both generated \`theme.css\` and \`bootstrap.css\`. For StyleX and React Native, import the selected generated source modules through the consuming app's toolchain.

No UI components are automatically created or visually imposed. If your app never selects a grid, the theme generator will not invent a grid.

### Accessibility-aware color choices

Users can explicitly define pairs such as text/canvas, action-label/button, link/canvas, hover labels and focus/background in \`contrastChecks\`. The tool validates all chosen modes and **rejects insufficient ratios with a clear error**, without changing the palette silently. The sample configs include five checks per mode.

The checks are not a substitute for browser and device testing or complete accessibility audits.

### Non-destructive updates

\`\`\`bash
# Check if generated files are still current without writing
node scripts/generate-project-theme.mjs --config examples/project-theme/editorial.v2.json --out ./generated/editorial --check

# Explicitly approve replacing generated output
node scripts/generate-project-theme.mjs --config examples/project-theme/editorial.v2.json --out ./generated/editorial --force
\`\`\`

A fresh generate refuses to overwrite an existing output file unless \`--force\` is provided. Use your **own project folder** for production theme configurations and generated CSS.

## Legacy neutral-starter themes (v1)

A legacy file without \`schemaVersion\` (or with \`schemaVersion:1\`) uses the optional neutral-starter palette and overrides named semantic roles:

\`\`\`json
{
  "name":"legacy-example",
  "light":{"action":"#005bbb","onAction":"#ffffff"},
  "dark":{"action":"#8cb4ff","onAction":"#111111"}
}
\`\`\`

Existing [legacy v1 example](../examples/project-theme/theme.json) and its five-file outputs continue to work. Only known starter semantic color roles are permitted in v1. For new custom systems with arbitrary colors, fonts and roles, **choose v2**.

The v1 path generates \`theme.css\`, \`bootstrap.css\`, \`stylex-theme.ts\`, \`native-theme.ts\` and \`theme.manifest.json\`. This remains distinct from the eight-file v2 format. Do not mix the two formats' variable prefixes or import instructions.

## What UF-CSS does not do

It does not import another company's design system, create a brand, choose fonts or grid systems on your behalf, force a visual hierarchy, rewrite React components, install packages, deploy websites, or claim full DTCG/WCAG certification. The current package is an **experimental draft PR** and is not published to npm.

See also [CUSTOM_SYSTEMS.md](CUSTOM_SYSTEMS.md) for a low-level generator that accepts wholly original DTCG token files without any theme modes, and [WIZARD.md](WIZARD.md) for the optional interactive setup questions.
