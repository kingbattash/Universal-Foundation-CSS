# Create your own design system (no required presets)

UF-CSS is a toolkit to help anyone **create and validate their own design system**, not a predefined design system.

## What you control

Your token names, token categories, colors, typography families, numeric values, spacing, density, radii, motion, hierarchy, grids, components, and framework choices. This generator does **not import any UF-CSS neutral values**.

It accepts a **supported subset** of [DTCG design tokens](https://www.designtokens.org/TR/2025.10/format/): `color` (opaque sRGB), `dimension` (px/rem), `duration` (ms/s), `number`, `fontFamily`, `fontWeight`, and `cubicBezier`. It supports group `$type` inheritance and typed curly-brace aliases. Unsupported composite types, `$extends`, and JSON Pointer references are rejected or not implemented; this is not yet complete DTCG conformance.

## 1. Define a token source

Create `my-system.tokens.json` in **your own project**, for example:

```json
{
  "myPalette": {
    "canvas": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [1, 1, 1],
        "hex": "#ffffff"
      }
    }
  },
  "density": {
    "tight": {"$type": "dimension", "$value": {"value": 6, "unit": "px"}}
  },
  "interaction": {
    "motion": {"$type": "duration", "$value": {"value": 140, "unit": "ms"}}
  }
}
```

No `core`, `brand`, `semantic`, `grid`, or other category is required. Choose names that fit **your system**. A minimal file containing only one `number` token is valid.

## 2. Optionally map your own tokens to frameworks

Create `my-system.mapping.json` only if you want framework-specific aliases:

```json
{
  "tailwind": {
    "colors": {"canvas": "myPalette.canvas"},
    "spacing": {"tight": "density.tight"}
  },
  "bootstrap": {
    "--bs-body-bg": "myPalette.canvas"
  }
}
```

The mappings are explicit: they do not force a token named `primary`, any default grid, or a particular spacing scale.

## 3. Generate your own outputs

From the UF-CSS repository:

```bash
node scripts/generate-custom-system.mjs \
  --tokens ../my-project/my-system.tokens.json \
  --mapping ../my-project/my-system.mapping.json \
  --prefix my-product \
  --out ../my-project/generated/uf-css
```

For a local installation of a **future published package**, use the `uf-css` executable. The CLI is already included in the **experimental Git branch tarball**, but no npm release exists yet.

Run `--check` to detect stale outputs, or `--force` only when you intend to overwrite generated files. Without `--mapping`, every token still appears in Vanilla CSS, StyleX variables and React Native values, while Tailwind and Bootstrap receive empty, harmless mappings.

### Seven generated files

| Output | Use |
| --- | --- |
| `tokens.css` | Custom CSS variables named `--your-prefix-...` |
| `tailwind-v4.css` | `@theme inline` aliases, only for mappings you selected |
| `tailwind-v3.cjs` | Tailwind v3 preset extending only your aliases |
| `bootstrap.css` | Explicit Bootstrap variable mappings |
| `stylex.stylex.ts` | Typed StyleX variable definition |
| `native.ts` | Nested JS-native values without CSS strings for px dimensions |
| `manifest.json` | Token paths, types and output format |

React Native does not interpret CSS `rem` values. Such dimensions stay tagged as `{value, unit:"rem"}` for the consuming app to convert, rather than being silently treated as points/dp.

## 4. Run the two contrasting examples

```bash
node scripts/generate-custom-system.mjs \
  --tokens examples/custom-systems/editorial/tokens.json \
  --mapping examples/custom-systems/editorial/mapping.json \
  --prefix press   --out /tmp/uf-css-press

node scripts/generate-custom-system.mjs \
  --tokens examples/custom-systems/operations/tokens.json \
  --mapping examples/custom-systems/operations/mapping.json \
  --prefix ops   --out /tmp/uf-css-ops
```

The editorial example uses a cream background, Georgia headings, unusual spacing and sharp corners; the operational example uses a dark navy palette, Inter, larger curves and its own density scale. Neither inherits the neutral starter's values, grid choices or hierarchy categories.

## 5. Limitations to resolve before a public stable release

- This is a strict supported DTCG subset, not full JSON Schema conformance.
- StyleX and native outputs are source files; consuming apps must transpile them appropriately.
- Project dark/light modes, custom naming functions, advanced theme inheritance and additional token kinds need further implementation.
- The project theme generator for semantic light/dark color overrides (`generate-project-theme.mjs`) is separate and still based on the existing neutral starter; the **custom system compiler never imports that starter**.
- No one is required to consume a library-provided token value, hierarchy category, grid or component appearance.

Each consuming project should version its **own tokens and mapping file**. UF-CSS provides interoperable generation, not aesthetic governance.
