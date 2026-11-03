# Project theme contract (Phase 03)

**UF-CSS is not a universal visual design system.** This contract defines how an independent project authors a theme **without inheriting** any colors, typography, spacing, density, components, hierarchy or grids from the optional neutral starter.

## Two distinct formats

| Format | Purpose | Inheritance |
| --- | --- | --- |
| Legacy v1, no schemaVersion (or explicit 1) | Compatibility with the early neutral-starter theme generator | Uses named neutral starter semantic roles as fallback values |
| **Creator-owned v2**, schemaVersion 2 | Build a completely original product theme | **No neutral starter imported or read**; every token comes from this project's config |

Use v2 to create your own independent visual design system. The v1 path remains supported only for compatibility.

## V2 schema

\`\`\`json
{
  "schemaVersion": 2,
  "name": "my-interface",
  "tokens": {
    "ui": {
      "canvas": {"$type":"color","$value":{"colorSpace":"srgb","components":[1,1,1],"hex":"#ffffff"}},
      "ink": {"$type":"color","$value":{"colorSpace":"srgb","components":[0,0,0],"hex":"#000000"}}
    },
    "typography": {
      "heading": {"$type":"fontFamily","$value":["Georgia","serif"]}
    },
    "density": {
      "compact": {"$type":"dimension","$value":{"value":7,"unit":"px"}}
    },
    "motion": {
      "enter": {"$type":"duration","$value":{"value":200,"unit":"ms"}}
    }
  },
  "modes": {
    "dark": {
      "ui": {
        "canvas": {"$value":{"colorSpace":"srgb","components":[0,0,0],"hex":"#000000"}},
        "ink": {"$value":{"colorSpace":"srgb","components":[1,1,1],"hex":"#ffffff"}}
      }
    }
  },
  "mapping": {
    "tailwind": {
      "colors": {"canvas":"ui.canvas","ink":"ui.ink"},
      "spacing": {"compact":"density.compact"},
      "fonts": {"heading":"typography.heading"}
    },
    "bootstrap": {
      "--bs-body-bg":"ui.canvas",
      "--bs-body-color":"ui.ink"
    }
  },
  "contrastChecks": [
    {"name":"body","type":"text","foreground":"ui.ink","background":"ui.canvas","minimum":4.5}
  ]
}
\`\`\`

The only necessary v2 token specification is a **non-empty consumer-authored \`tokens\` object** containing at least one DTCG-profile token. The \`modes\`, \`mapping\`, and \`contrastChecks\` properties are optional. No \`primary\`, \`canvas\`, font family, grid or hierarchy role is required.

Mode overrides may change an **existing base token's** \`$value\`, type-compatible \`$type\`, description or other supported token metadata. A mode cannot secretly introduce a new token: define the role once in \`tokens\` and then override it. \`modes.light\` or \`modes.dark\` can be omitted independently. If no dark mode is authored, none is generated.

Token validation follows the documented **supported subset of DTCG 2025.10** in [TOKEN-CONTRACT.md](TOKEN-CONTRACT.md); full standard conformance is not claimed.

## Override precedence

For **v2 independent themes**, the effective value resolves in this order:

1. The consumer's **base** \`tokens\` values.
2. Optional \`modes.light\` or \`modes.dark\` overrides (these win within their mode).
3. Any component-specific variant/state style the **consumer defines in their app**, using ordinary platform precedence rules.

A dark theme does not change the base config or overwrite light tokens. The generator resolves each mode independently. There is no forced UI component set or hierarchy taxonomy.

For **legacy v1 only**, the starter's core semantic palette supplies missing colors, then product light/dark overrides replace the named semantic role. V2 does not follow that precedence and never imports neutral starter tokens.

## Output files and imports

V2 generation creates **eight files** from one user-owned config:

| Output | Usage |
| --- | --- |
| \`theme.css\` | Light/dark namespaced custom CSS properties in \`@layer uf.project\` |
| \`tailwind-v3.cjs\` | Only explicitly mapped Tailwind v3 classes |
| \`tailwind-v4.css\` | Only explicitly mapped Tailwind v4 \`@theme inline\` properties |
| \`bootstrap.css\` | Only the explicit \`--bs-*\` mappings; mode-aware RGB values |
| \`stylex-vars.stylex.ts\` | \`stylex.defineVars\` token variables |
| \`stylex-theme.stylex.ts\` | \`lightTheme\` and optional \`darkTheme\` using \`stylex.createTheme\` |
| \`native-theme.ts\` | Resolved user-owned light/dark token trees for React Native |
| \`theme.manifest.json\` | Token paths/types, mode names, contrast reports, generated file names and precedence |

The generated CSS properties are prefixed with \`--<your-project-name>-\`, **not** \`--uf-\`. V2 is independent and will not automatically recolor UF-CSS's *optional neutral starter components*; use the new generated classes/variables or author your own mapping. This is by design.

For CSS, load \`theme.css\` after any chosen base/reset stylesheet. For Tailwind v4, import Tailwind CSS, then \`theme.css\` and \`tailwind-v4.css\` through its CSS compilation pipeline. For Tailwind v3, configure the generated CJS preset and load the generated theme variables in your page styles. For Bootstrap, load Bootstrap CSS, then \`theme.css\` and \`bootstrap.css\`. Bootstrap mapping is opt-in, not a comprehensive Bootstrap Sass component theme.

For StyleX, compile both \`.stylex.ts\` files with a StyleX-capable toolchain and apply the exported \`lightTheme\` or \`darkTheme\` explicitly. The generated native values provide numeric dp/pt starting points; rem and platform font scaling require project-specific decisions.

## Validation and contrast

\`contrastChecks\` are optional **creator-selected** pairs, not a compulsory palette or fixed list of role names. Use the \`type\` field (\`text\`, \`large-text\`, \`ui\`, \`focus\`) or specify \`minimum\` directly (1–21). Each check runs separately for every authored mode, and a failing check **halts generation before creating output files**. The generator never silently changes a customer's chosen color.

Samples test ordinary text (4.5:1), action labels (4.5:1), links (4.5:1), hover labels (4.5:1) and focus-color/background contrast (3:1). These are automated color checks, not exhaustive WCAG 2.2 accessibility or usability verification. A pair meeting a contrast threshold can still be inaccessible in practice.

## CLI behavior and migration

\`\`\`bash
# Generate from your own v2 source
node scripts/generate-project-theme.mjs --config my-theme.v2.json --out ./styles/my-theme

# Detect output drift; no files written
node scripts/generate-project-theme.mjs --config my-theme.v2.json --out ./styles/my-theme --check

# Explicit update of existing generated output
node scripts/generate-project-theme.mjs --config my-theme.v2.json --out ./styles/my-theme --force
\`\`\`

From an installed future prerelease: \`uf-css theme --config ... --out ...\`. The package is currently **not published to npm**.

**Migration from legacy v1:** Existing \`{name,light,dark}\` configs still work and produce the same five legacy files. To adopt v2, create a **new** \`*.v2.json\` with your complete DTCG token set, explicit dark overrides and explicit framework mappings; target a new output directory so the old files are not overwritten. Rename the import paths to v2 generated files and use the new namespaced token CSS variables. There is no implicit or automatic migration of another project's palette.

## Identity, reproducibility and future limits

All consumer branding stays in the consuming project's configuration. The universal repository contains only **fictional sample design systems**, no proprietary design decisions. Output is deterministic for a given config. Invalid types, missing aliases, unknown overrides, contrast failures and malformed mappings are rejected before any generation.

Phase 03 does **not** claim full DTCG composites, non-sRGB colors, runtime application of React/StyleX themes, visual accessibility certification, or a GUI editor. These belong to later capability improvements.

The creator may choose an editorial visual language, a dashboard aesthetic or a completely different approach. **UF-CSS provides the tools; it does not choose the design.**
