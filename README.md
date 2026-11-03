# Universal Foundation CSS

**Build your own design system with open, framework-independent foundations.**

[![Apache License 2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Status: Early Development](https://img.shields.io/badge/status-early%20development-informational.svg)](docs/ROADMAP.md)

Universal Foundation CSS (**UF-CSS**) is an open-source **design-system construction toolkit**: optional mathematical tools, semantic modeling methods, hierarchy and grid references, token generators, framework adapters and component contracts. **It does not prescribe a visual system.** Each developer or product creates and owns its own design language.

> **Status: 0.x experimental.** The repository provides a working TypeScript foundation, canonical token generation, an optional CSS starter adapter, and generated framework mappings. It has **not yet been published to npm**, and some registered grids are references, not implemented CSS layouts. Use the source or a Git dependency until a package release is announced.

See **[the design freedom and extension philosophy](docs/PHILOSOPHY.md)** before adopting a preset. All existing scales, grids, categories and starter tokens are optional examples, not mandatory conventions.

## Implementation status and next steps

See the **[step-by-step implementation plan](docs/IMPLEMENTATION_PLAN.md)** for all phases, exact folders, dependencies, review gates, and which capabilities are already implemented versus planned.

**Phases 00–03 complete for their declared experimental scopes.** The neutral starter, independent token generator and creator-owned theme builder now share verified token parsing and platform adapters. Phase 03 introduces custom light/dark themes with any names and values, explicit Tailwind/Bootstrap mappings, StyleX/native outputs, and user-chosen accessibility checks. Two unrelated examples are available in [Copper Editorial](examples/project-theme/editorial.v2.json) and [Harbor Operations](examples/project-theme/operations.v2.json); see [theme guide](docs/THEMES.md) and [theme contract](docs/THEME-CONTRACT.md). **Phase 04 now complete for the verified build scope:** packed-package framework consumers, a production Next.js StyleX App Router build, and Expo Android JavaScript export. **Next: Phase 05 — mathematics, formulas and quantified design guidance.** Full DTCG support remains outside the current documented profile.

## Actual framework-consuming projects

Beyond isolated adapters, the feature branch now builds applications consuming the actual **locally packed npm tarball**. [Framework-consumer guide](docs/FRAMEWORK-CONSUMERS.md) explains exactly which imports, compilers and style overrides each project controls.

- [Next.js + StyleX App Router](integration/nextjs/) uses a project-owned editorial theme and produces a production Webpack build.
- [Expo / React Native](integration/expo/) uses a different independent project theme, safe-area context, font scaling and Metro's Android JavaScript export.
- [Packed Tailwind v3/v4, Bootstrap, StyleX and native consumer](integration/web/verify-packed.mjs) verifies distribution exports in a separate installed environment.
- Normal HTML, Vue, Svelte, Angular and Astro can import the same generated CSS custom properties without a framework-specific runtime.

These are verified **build integration tests**, not physical-device, visual-regression or full WCAG audits. The package remains experimental and unpublished. No required brand, grid, hierarchy, font or styling library is imposed.

## The problem it solves

Projects frequently develop competing UI rules: one app uses 16px gutters, another uses 24px, headings change font roles, and buttons behave differently across web and mobile. UF-CSS separates **shared decisions and behavior** from **platform-specific rendering and product branding**.

It is **not** a Tailwind replacement, a mandatory UI theme, or a claim that golden ratios and UX heuristics are universal laws.

## Seven foundation domains

| Directory | Responsibility |
| --- | --- |
| [foundation-formular](src/foundation-formular/) | Pure modular scale, fluid clamp, spacing, grid geometry and WCAG contrast calculations; documented UX principles |
| [semantic](src/semantic/) | Content, navigation, surface, action, status and interaction roles |
| [hierarchy](src/hierarchy/) | 20 useful categories across communication, structure, visual techniques and interaction |
| [tokens](src/tokens/) | Core, brand slots, semantic colors, typography, layout, motion and extended token roles |
| [patterns](src/patterns/) | Framework-neutral hero, article, dashboard, form and collection patterns |
| [components](src/components/) | Behavioral and accessible-state contracts, not prebranded components |
| [grid](src/grid/) | 37 registered web, editorial, geometric, classical and spacing systems with honest implementation statuses |

## Get started (repository)

Node.js 22 or newer is recommended for developing the repository.

```bash
git clone https://github.com/kingbattash/Universal-Foundation-CSS.git
cd Universal-Foundation-CSS
npm install
npm run verify
```

The build emits JavaScript and declarations under `dist/`. **No stable npm package is published yet.**

### TypeScript example

```ts
import {
  modularScale,
  spacingStep,
  fluidClamp,
  contrastRatio,
  getGrid,
  hierarchy,
} from "@kingbattash/universal-foundation-css";

// After publishing or linking the package:
const titleSize = modularScale(3);           // 31.25px
const sectionGap = spacingStep(8);           // 32px
const responsiveTitle = fluidClamp(32, 64); // CSS clamp(...)
const accessible = contrastRatio("#111111", "#ffffff") >= 4.5;
const layout = getGrid("twelve-column");     // css-recipe
```

### Optional CSS adapter

For plain HTML / CSS, use the [opt-in neutral stylesheet](src/css/foundation.css). It contains only namespaced `--uf-*` values and `uf-*` layout helpers; it does **not** reset global element styles.

```html
<link rel="stylesheet" href="./path/to/foundation.css" />
<section class="uf-container">
  <div class="uf-grid">
    <article>First item</article>
    <article>Second item</article>
  </div>
</section>
```

Browse the [vanilla HTML example](examples/vanilla/index.html). The layout helper stylesheet is maintained independently, but its variables are generated from the canonical token source in `tokens/source.tokens.json`.

## Choosing a grid

UF-CSS offers **choices, not 37 mandatory styles**. A grid registry entry declares whether it is a CSS recipe, a mathematical helper, or a reference. For example:

- `twelve-column`: available as a simple responsive CSS recipe.
- `rule-of-thirds`: available through a geometry helper.
- `golden-canon`: reference only; not a browser CSS engine.
- `four-point`: spacing rhythm, not a literal column grid.

See the [grid catalog](docs/GRIDS.md) before selecting a layout.

## Interactive design-system builder

Run the **opt-in setup wizard** to choose or skip your own colors, typography, spacing, structural grids, composition guides, hierarchy, and framework adapters. It previews all planned files and requires explicit confirmation before creating a directory.

```bash
# From this repository (not yet published on npm)
node scripts/cli.mjs init

# Read-only plan suitable for an AI agent or CI
node scripts/cli.mjs init --config examples/builder/editorial.config.json --out ./my-system --dry-run
```

See the [interactive wizard guide](docs/WIZARD.md). The CLI is included in the experimental packed package as `uf-css init`; the corresponding npm package has not been published yet.

## Create a completely custom design system

You can now generate adapters from **your own token names and values**, with no inherited color palette, font, spacing scale, grid or hierarchy. The generator accepts independently authored DTCG-style files and optional explicit Tailwind/Bootstrap mappings.

```bash
node scripts/generate-custom-system.mjs \
  --tokens examples/custom-systems/editorial/tokens.json \
  --mapping examples/custom-systems/editorial/mapping.json \
  --prefix press \
  --out ./generated/press
```

Two very different examples are included at `examples/custom-systems/{editorial,operations}/`. Both are compiled by the actual Tailwind v3/v4 and StyleX toolchains in CI, with Bootstrap output and native TypeScript checked. Read the [complete custom system guide](docs/CUSTOM_SYSTEMS.md).

## Cross-framework adapters

All adapters derive from [`tokens/source.tokens.json`](tokens/source.tokens.json), which uses a supported subset of the DTCG 2025.10 typed-token format. **Do not edit generated files directly.**

| Stack | Output | Status |
| --- | --- | --- |
| Vanilla HTML/CSS | `src/css/foundation.css` and `tokens.generated.css` | Opt-in layout + semantic variables |
| Tailwind CSS v4 | `adapters/tailwind-v4/theme.generated.css` | Generated `@theme inline` mapping; CLI smoke test passes |
| Tailwind CSS v3 | `adapters/tailwind-v3/preset.generated.cjs` | Generated theme preset; CLI smoke test passes |
| Bootstrap 5.3 | `adapters/bootstrap/bootstrap.generated.css` | Body/semantic variable and button mapping; component-specific coverage incomplete |
| StyleX | `adapters/stylex/tokens.generated.stylex.ts` | Generated `defineVars`/dark theme; Babel compilation verified; consuming app must configure StyleX |
| React Native/Expo | `adapters/react-native/tokens.generated.ts` | Generated typed native values; Expo Metro Android JS export passes; device tests pending |

See [adapter installation instructions](docs/ADAPTERS.md) for exact import order, examples, and limitations.

```bash
npm run generate:tokens  # Regenerate all adapters from canonical source
npm run check:tokens     # Verify no generated file was edited or missed
```


## Project-specific themes

Your product can keep its own identity while using the universal rules. UF-CSS now includes a **brand-neutral theme generator** with semantic light/dark colors, basic contrast checks, and adapters for CSS, Bootstrap, StyleX and React Native.

```bash
node scripts/generate-project-theme.mjs \
  --config examples/project-theme/theme.json \
  --out ../my-project/styles/uf-css
```

Use `--check` to validate outputs and `--force` only for intentional regeneration. See the [theme guide](docs/THEMES.md) for configuration, import order, accessibility checks and limitations.

## AI agent skill

A portable, open [Agent Skills](https://agentskills.io/specification) workflow helps coding agents audit, generate and migrate design foundations **while preserving the project's brand**. The canonical instructions live at [`.agents/skills/universal-foundation-css/SKILL.md`](.agents/skills/universal-foundation-css/SKILL.md).

Install into another project explicitly:

```bash
node scripts/install-skill.mjs --target all --project ../your-project
```

This copies the skill to supported Codex, Claude and Copilot project locations without overwriting an existing skill. Skills are not automatically installed in ChatGPT or every AI product. See [AI agent setup](docs/AI-AGENTS.md).

## Inspect an existing project without changing it

```sh
node scripts/cli.mjs audit --project ../your-project --format text
node scripts/cli.mjs audit --project ../your-project --format json
```

The Phase 10 auditor uses bounded, read-only project inspection to report stack/version evidence, CSS token duplication and potential interaction/import issues. It never runs your app, installs packages or changes any files. Its adapter suggestions are optional and require your review. For safe agent adoption and limitations, see [the audit guide](docs/AUDIT.md) and [AI agents](docs/AI-AGENTS.md). Unknown versions are never assumed supported.

## Development quality

```bash
npm run check:tokens # Canonical generated-output drift check
npm run check  # TypeScript type checking
npm run build  # Compiled .js and .d.ts files
npm test       # Formula, registry and contract tests
npm run verify # Type-check and tests
```

CI verifies token parity, the TypeScript suite, compiled **Tailwind v3/v4**, **Bootstrap CSS**, and **StyleX Babel** fixtures, plus an **Expo SDK 57 Android JavaScript export**. A sixth quality workflow now runs **Playwright Chromium + axe-core** on 25 browser scenarios, captures 12 responsive light/dark screenshots, and checks keyboard interactions and limited WCAG A/AA rules. Use `npm ci --prefix integration/browser` and `npm test --prefix integration/browser` after browser setup. Pixel-diff baselines, manual screen readers, true browser zoom and physical Android/iOS device validation are **pending**; see [testing evidence and checklist](docs/TESTING.md).

## Architecture and roadmap

- [Architecture and dependency boundaries](docs/ARCHITECTURE.md)
- [Grid reference catalog](docs/GRIDS.md)
- [Development roadmap](docs/ROADMAP.md)
- [AI agent compatibility and installation](docs/AI-AGENTS.md)
- [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), [Code of Conduct](CODE_OF_CONDUCT.md)

### Project identity is separate

An organization-specific design system (such as an AMGYNA design system) may consume UF-CSS and define its own brand, token values, components, fonts, densities and selected grid layouts. UF-CSS must **never import or depend on** that organization-specific package.

## License

Apache License, Version 2.0. See [LICENSE](LICENSE). Commercial and personal use are permitted under its terms. Contributions are welcome.

Maintained by [kingbattash](https://github.com/kingbattash). **Early development; no stable release or support guarantee.**
