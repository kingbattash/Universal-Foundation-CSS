# Create a project-specific identity without changing UF-CSS

**Universal Foundation CSS is not a brand.** A consuming project owns its own colors, fonts, logo, content hierarchy and component appearance. The universal foundation provides shared token roles and accessibility constraints.

The theme generator supports **semantic colors** in light and dark modes. Font selections, geometry, motion and layout remain configurable in the consuming project; a larger typed-theme schema is planned.

## Example

From a local checkout of this repository:

```bash
node scripts/generate-project-theme.mjs \
  --config examples/project-theme/theme.json \
  --out ../your-project/styles/universal
```

Theme configurations use a constrained JSON format:

```json
{
  "name": "example-product",
  "light": {
    "action": "#005bbb",
    "actionHover": "#004b99",
    "onAction": "#ffffff",
    "focus": "#005bbb"
  },
  "dark": {
    "action": "#8cb4ff",
    "actionHover": "#bad0ff",
    "onAction": "#111111",
    "focus": "#8cb4ff"
  }
}
```

Only existing semantic color roles are accepted. Colors must be **six-digit hex** and are compared against WCAG 2.x relative luminance guidance. Text/canvas and on-action/action colors must reach 4.5:1; focus/canvas targets 3:1. These are useful automated checks, **not full accessibility audits**.

The command creates these outputs in the selected directory:

| File | Purpose |
| --- | --- |
| `theme.css` | Unlayered semantic `--uf-*` overrides; works with Vanilla CSS and Tailwind |
| `bootstrap.css` | Bootstrap RGB channel overrides for the selected palette |
| `stylex-theme.ts` | Light/dark `stylex.createTheme(ufVars, ...)` definitions |
| `native-theme.ts` | Typed light/dark palettes for React Native |
| `theme.manifest.json` | Theme identity, semantic roles and selected contrast values |

The tool is intentionally non-destructive: it refuses to overwrite existing generated files without `--force`. Use `--check` to detect outdated outputs.

```bash
node scripts/generate-project-theme.mjs --config theme.json --out styles/universal --check
# Only for deliberate regeneration:
node scripts/generate-project-theme.mjs --config theme.json --out styles/universal --force
```

## Import order

For ordinary CSS:

```css
@import "@kingbattash/universal-foundation-css/css";
@import "./styles/universal/theme.css";
```

For Bootstrap 5.3, after importing Bootstrap and the UF-CSS Bootstrap adapter, also import **both** `theme.css` and `bootstrap.css`. See [adapter docs](ADAPTERS.md).

For Tailwind v4, import `theme.css` after the UF-CSS foundation CSS and its generated `@theme` mapping. For Tailwind v3, load it after UF-CSS tokens CSS.

For StyleX, compile the generated theme file with your app's StyleX Babel/PostCSS integration and apply the exported `projectLightTheme` / `projectDarkTheme` on appropriate subtrees.

For React Native, use `projectNativeTheme.light` or `.dark` with `StyleSheet` and the design foundation's numeric spacing and typography tokens.

## What the generator does NOT do

- Does not change the public UF-CSS source tokens or any existing project's branding.
- Does not create or modify React components, CSS utilities, navigation or layouts.
- Does not install dependencies, run network requests or publish packages.
- Does not generate a complete Bootstrap Sass theme or guarantee visual equivalence.
- Does not verify focus behavior, state labels, RTL, motion or native font scaling.
- Does not currently support custom typography, spacing, radius or motion role overrides.

A project's versioned theme config should live in the **consuming project**, not in the universal foundation source.
