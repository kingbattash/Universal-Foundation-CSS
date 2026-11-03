# Architecture and boundaries

UF-CSS is a **framework-neutral toolkit to create design systems**, not a mandatory design system. Its example scales, hierarchy classifications, grids and neutral theme are optional, and consuming projects define their own rules. See [PHILOSOPHY.md](PHILOSOPHY.md).

```text
                 UNIVERSAL FOUNDATION
      pure formulas / semantic roles / hierarchies
                 token roles / grid registry
             pattern and component contracts
                           |
         +-----------------+-----------------+
         |                 |                 |
     opt-in CSS      future StyleX      future native
       adapter          adapter            adapter
         |                 |                 |
         +-----------------+-----------------+
                           |
                independent products
               (own fonts, colors, UX)
```

## Design freedom

Consumers can omit any optional preset, supply custom design tokens and define their own hierarchy, grid algorithms and component appearance. The catalog of 20 hierarchy categories and 37 grids is illustrative and expandable—not an exclusive set of recognized methods. Technical validity and accessibility should be tested without enforcing a common look. Current 0.x theme configuration supports semantic colors; further customization and plugin interfaces are planned, not yet implemented.

## Token compiler architecture

The neutral starter at `tokens/source.tokens.json` and every creator-owned token manifest share `scripts/lib/tokens/parse.mjs` and `format.mjs`. They use separate renderers (`starter-renderer.mjs` and `custom-renderer.mjs`) so no product inherits a neutral style merely by generating tokens. All runtime examples consume explicitly chosen adapters.

The [token contract](TOKEN-CONTRACT.md) documents the supported DTCG profile; the [token inventory](TOKEN-INVENTORY.md) distinguishes optional starter defaults from mathematical formulas and CSS recipe details.

## Dependency policy

1. `src/foundation-formular` is pure TypeScript; no DOM, React or browser APIs.
2. `src/semantic` and `src/hierarchy` define meaning and priorities, not color hex values.
3. `src/tokens` defines seed values and role names. The neutral theme is **optional**, never a brand identity.
4. `src/grid` is a registry. `support: "reference"` does not imply browser-renderable CSS.
5. `src/components` describes accessible behavior and states; actual React/native implementations belong to platform adapters or consumers.
6. `src/patterns` describes reading order and suggested composition; it does not force a layout.
7. `src/css/foundation.css` is opt-in, prefixed `uf-` and does not reset tags.

## Avoiding web/mobile drift

For product projects, create a canonical token-and-contract source. Web, StyleX and native adapters should be generated from or validated against that source; allow documented, platform-specific overrides (e.g. safe areas, type metrics, pointer/hover states). Behavioral parity is more important than pixel parity.

A project's actual visual identity belongs in its own repository. The optional generator in `scripts/generate-project-theme.mjs` validates semantic colors and writes web/native theme files to an explicitly selected output location. See [project themes](THEMES.md).

**Current 0.x state:** `tokens/source.tokens.json` is the canonical source for neutral primitive and semantic token values. `scripts/generate-tokens.mjs` produces `src/css/tokens.generated.css`, `src/tokens/generated.ts`, and all framework adapter outputs, with CI drift detection. Some broader role recommendations still live as TS specifications; custom project themes and real framework build tests are not yet complete.

## Naming

The folder name `foundation-formular` intentionally preserves the maintainer's requested convention. Mathematical functions themselves use standard English names, like `fluidClamp`.

## Semantic versus mathematical concepts

Fitts's Law and Hick–Hyman Law are studied UX models. "Golden canon", Phi, Fibonacci and root rectangle construction are visual-composition approaches, **not accessibility requirements or universal rules for UI**. No single "No. 1 law of design" is accepted as an industry standard.

## Compatibility

The TypeScript module is ESM and targets modern JavaScript runtimes; external platform APIs are not used in the core. The CSS adapter requires browser support for modern CSS features like cascade layers, `min()`, `clamp()`, and responsive grid.

## Real platform-consumer boundary (Phase 04)

The actual packed UF-CSS package is consumed by independent `integration/web`, `integration/nextjs`, and `integration/expo` build fixtures. Their lockfiles and optional compiler toolchains are **not dependencies of the core package**. StyleX/Next.js and safe-area/Expo helpers belong in the consuming application. See [FRAMEWORK-CONSUMERS.md](FRAMEWORK-CONSUMERS.md).
