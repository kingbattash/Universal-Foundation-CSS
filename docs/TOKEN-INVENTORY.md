# Token inventory — Phase 02

This audit identifies which values are owned by the canonical **optional starter**, which are pure mathematical constants, and which remain inside opt-in layout recipes rather than a mandatory product design language.

| Area | Current source of truth | How it is consumed |
| --- | --- | --- |
| Palette and neutral semantic light/dark roles | `tokens/source.tokens.json` → `core.color`, `semantic`, `themes.dark` | Generated web/native colors and framework variables |
| Spacing steps and radii | `core.space`, `core.radius` | Generated CSS variables, Tailwind mappings, StyleX and native values |
| Typography sizes, weights, leading, families | `core.type` | `src/tokens/typography.ts` uses generated values; optional reference roles |
| Reading measure, containers, gutters, touch target | `core.layout` | `src/tokens/layout.ts`, `foundation.ts`, CSS and native |
| Breakpoints and viewport bounds | `core.layout.breakpoint*`, `viewport*` | `foundation.ts`, `fluidClamp` default input values |
| Modular type scale ratio | `core.scale.modularRatio` | `foundation.modularRatio` and `modularScale` |
| Motion durations and easing curves | `core.motion` | `src/tokens/motion.ts`, CSS and generated native/style values |
| Density, z-order, elevation level examples | `core.density`, `core.zIndex`, `core.elevation` | Optional generated starter roles; **not** required product policies |
| Semantic role *names* and state taxonomies | `src/semantic/`, `src/tokens/semantic.ts` | Types and reference descriptions, not independent color values |
| Brand slots and expanded optional role lists | `src/tokens/brand.ts`, `extended.ts` | Reference lists; not preset branded values |
| Golden ratio, root rectangle ratio, WCAG color weights | Mathematical functions in `src/foundation-formular/formular.ts` | Pure mathematical definitions, not design-token preferences |
| Historical grid names, 20 hierarchy categories | `src/grid/registry.ts`, `src/hierarchy/hierarchy.ts` | Optional knowledge catalogs, **not mandatory tokens** |
| CSS recipe details (auto-fit min of 260px, 48rem query, focus outline 2px / offset 3px) | `src/css/foundation.css` | Opt-in layout and accessibility recipes; project may replace them. These are **implementation-specific recipe values**, not universal scale requirements |
| Project product-specific colors, fonts, grids, hierarchy | **Consumer-owned token/config files** | Never written into the neutral starter's source of truth |

## Key normalization changes

Before Phase 02, the starter defined some viewport bounds, font sizes, type weights, leading, breakpoints and motion easing independently in TypeScript. Those values now originate in `tokens/source.tokens.json` and feed `src/tokens/generated.ts` and `src/foundation-formular/foundation.ts` as appropriate.

The neutral starter remains optional. Its presence is **not** a universal constraint; `scripts/generate-custom-system.mjs` does not import or blend its visual defaults into a user's token file.

## Remaining non-token responsibilities

- Layout implementation mechanics (CSS grid track counts, minmax, query units) belong in opt-in CSS recipes, not in all consumer design systems.
- WCAG contrast thresholds are verification criteria, not palette choices.
- The 2025.10 standard defines more token types than this emitter currently supports. See [TOKEN-CONTRACT.md](TOKEN-CONTRACT.md) for the explicit supported profile and future scope.
