# Universal Foundation CSS — Step-by-step implementation plan

**Repository:** `kingbattash/Universal-Foundation-CSS`  
**Status:** Working execution plan for the **experimental 0.x** public foundation  
**Baseline:** `feat/foundation-v0`, reviewed 2026-11-03  
**Companion docs:** [Architecture](ARCHITECTURE.md) · [Roadmap](ROADMAP.md) · [Adapters](ADAPTERS.md) · [Project themes](THEMES.md) · [AI agents](AI-AGENTS.md)

> **Mission:** An open, brand-independent **toolkit for creating original design systems**, with reusable mathematics, token generation, optional references and framework adapters. UF-CSS itself is **not** a prescribed design system. Consumers may replace all example values and choose—or define—their own hierarchy, typography, grids, interactions and component styles. UF-CSS must never depend on AMGYNA (or another consumer). See [PHILOSOPHY.md](PHILOSOPHY.md).

## 1. How to read and execute this plan

**Status legend:** `DONE` = demonstrated by code and/or CI; `PARTIAL` = first implementation exists but acceptance criteria below are not yet met; `TODO` = planned; `EXTERNAL` = work in a consuming repository, not in UF-CSS.

**Work rule:** Complete phases in order, except independent documentation or tests. Each phase gets a focused PR or reviewable group of commits. Record evidence in its PR: changed files, generated artifacts, test commands, screenshots if visual, known limitations, and **why** each new public API is necessary. Do not claim `DONE` just because a file exists.

**Design-freedom rule:** No scale, grid, hierarchy category, neutral palette, component shape, or visual style is mandatory for the consuming project. Treat the present 20 hierarchy entries and 37 grid entries as optional reference catalogs, not exhaustive or exclusive definitions. Future design-system creation APIs must accept custom definitions.

**Source-of-truth rule:** For the current UF-CSS neutral starter, hand-edit `tokens/source.tokens.json` for its canonical values. Run `npm run generate:tokens`. All `*.generated.*` files are outputs; do not manually patch them. Product colors and fonts belong to a **consumer theme**, not the universal defaults.

**Current working location:** the initial scaffold is in `feat/foundation-v0` in [draft PR #1](https://github.com/kingbattash/Universal-Foundation-CSS/pull/1). `main` contains the original open-source initialization, not yet the entire experimental implementation. Do not merge or publish automatically.

## 2. Current baseline — Phase 00 (DONE)

| Capability | Existing location | Verified scope |
| --- | --- | --- |
| Open-source repo | `LICENSE`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md` | Apache-2.0 public project docs |
| Seven core domains | `src/{foundation-formular,semantic,hierarchy,tokens,patterns,components,grid}/` | TS specs, formulas, basic contracts |
| Canonical tokens | `tokens/source.tokens.json` | Supported subset of DTCG token format; typed aliases |
| Token generator | `scripts/generate-tokens.mjs` | Generates CSS, TS, Tailwind v3/v4, Bootstrap, StyleX, native |
| Project theme generator | `scripts/generate-project-theme.mjs` | Light/dark semantic colors; limited contrast checks; safe overwrite |
| Optional CSS | `src/css/foundation.css` | Neutral layout helpers and generated CSS variables |
| AI skill | `.agents/skills/universal-foundation-css/` | Portable instructions and safe installer |
| Web integration smoke tests | `integration/web/` | Tailwind v3/v4 CSS compilation, Bootstrap CSS bundling, StyleX Babel transformation |
| Native smoke tests | `integration/expo/` | Expo SDK 57 Metro Android **JS export**, not a compiled Android binary |
| CI | `.github/workflows/{ci,integration-web,integration-expo}.yml` | Latest observed runs passed; 17 unit tests passed |

**Important incomplete work:** 20 hierarchy categories are registry entries, not 20 finished style modules. The 37 grid entries are a **catalog**, not 37 CSS implementations. Project themes currently customize semantic colors, not every typography/layout/motion role. Browser/device screenshots and complete keyboard/assistive-technology validation are not yet in CI.

---

## 3. Delivery sequence and dependencies

```text
Phase 00  Working public scaffold (DONE)
   ↓
Phase 01  Reproducible installs + stable package/export boundaries
   ↓
Phase 02  Canonical design tokens + schema integrity
   ↓
Phase 03  Consumer theme configuration + generated themes
   ↓
Phase 04  Production-adapter contracts + real framework examples
   ↓
Phase 05  Foundation formulas, laws and quantitative rules
   ↓
Phase 06  Semantic model and 20 hierarchy category specifications
   ↓
Phase 07  Grid recipes, mathematical constructions and guides
   ↓
Phase 08  Pattern specs and platform-neutral component contracts
   ↓
Phase 09  Visual regression, accessibility and design quality gates
   ↓
Phase 10  AI skill + CLI project creation/audit automation
   ↓
Phase 11  Versioned beta release + documentation + public governance
   ↓
Phase 12  Consume in independent projects (AMGYNA separately)
```

Cross-cutting requirement: add tests and documentation **in each phase**, not only in Phase 09 or 11.

## 4. Phase-by-phase instructions

### Phase 01 — Reproducible builds and package boundaries (DONE)

**Goal:** Anyone can clone the repository, run one documented install sequence, and get the same verified artifacts.

| Step | Work | Exact location |
| --- | --- | --- |
| 01.1 | **DONE:** Generate/commit root `package-lock.json`; convert root CI to `npm ci` | `package-lock.json`, `.github/workflows/ci.yml` |
| 01.2 | **DONE:** Pin integration fixture dependencies with their own lockfiles | `integration/web/package-lock.json`, `integration/expo/package-lock.json` |
| 01.3 | **DONE:** Convert integration CI from unlocked `npm install` to `npm ci` | `.github/workflows/integration-*.yml` |
| 01.4 | **DONE:** Validate npm `exports` paths, CSS subpath imports, generated TS importability, `npm pack --dry-run`, and an offline installed tarball | `package.json`, `tests/package-exports.test.ts`, `scripts/verify-packed-package.mjs` |
| 01.5 | **DONE:** Set engine, optional peers, supported Node versions, and semver compatibility policy | `package.json`, `docs/COMPATIBILITY.md` |
| 01.6 | Check CSS layer/import order and package side effects in built consumer fixtures | `src/css/`, `integration/web/` |

**Gate PASSED on commit `8db67ef` (2026-11-03):** clean GitHub Actions locked installs, 19/19 unit tests, real offline tarball consumer and all three CI workflows passed (foundation, real web toolchains, Expo Android JS export). This is still an experimental library; no npm release has been published.

### Phase 02 — Canonical tokens and normalization (DONE: supported DTCG profile)

**Goal met:** All neutral-starter generated values originate from a validated canonical source, and completely independent products can generate their own token systems without inheriting any neutral defaults. Both generator paths share token parsing and formatting. The phase intentionally supports a **documented subset** of DTCG 2025.10; comprehensive standard conformance remains a future capability.

| Step | Result | Exact location |
| --- | --- | --- |
| 02.1 | **DONE:** Audited optional preset values vs mathematical constants, semantic vocabulary, and opt-in CSS recipe fallbacks | [TOKEN-INVENTORY.md](TOKEN-INVENTORY.md) |
| 02.2 | **DONE:** Specified consumer-owned arbitrary token paths, typed aliases, output-safe naming rules, units and optional framework mappings | [TOKEN-CONTRACT.md](TOKEN-CONTRACT.md), `scripts/lib/tokens/parse.mjs` |
| 02.3 | **DONE:** Canonicalized optional typography roles, breakpoints, scale ratio, density, elevation levels, z-layer and easing; removed duplicated foundation defaults | `tokens/source.tokens.json`, `src/foundation-formular/foundation.ts`, `src/tokens/` |
| 02.4 | **DONE for declared supported profile:** Type and metadata checks, missing/circular alias rejection, type inheritance, collision prevention and safe value validation. The DTCG publication does not yet ship a finalized official JSON Schema; UF-CSS does **not** claim full DTCG conformance | `scripts/lib/tokens/parse.mjs`, `tests/token-validator.test.mjs` |
| 02.5 | **DONE:** Separated shared validator and formatters from optional neutral and consumer-owned adapter renderers; preserved public command/CLI compatibility | `scripts/lib/tokens/{parse,format,starter-renderer,custom-renderer}.mjs` |
| 02.6 | **DONE:** Byte-for-byte generated-output parity, in-memory token-mutation tests across web/native mappings, two independent consumer examples, real framework builds and packed-CLI installation checks | `tests/token-parity.test.mjs`, `tests/custom-system.test.ts`, `integration/`, CI |

**Acceptance gate passed (2026-11-03):** `npm run check:tokens`, 37 foundation/builder tests, offline packed tarball verification, Tailwind v3/v4 and StyleX/Babel integration, Bootstrap parsing and Expo Android JS export. The neutral starter outputs are deterministic; modifying relevant canonical tokens propagates into all applicable generated mappings. User-defined systems do not inherit a single required style or hierarchy.

**Deferred to later releases (not represented as Phase 02 functionality):** complete DTCG 2025.10 coverage (advanced color spaces, composites, `$extends`, JSON Pointer references, arbitrary Unicode names), package-wide graphical/visual accessibility validation and full component adaptation. These are separate enhancements and must not be misrepresented as currently implemented.

### Phase 02W — Interactive builder before further expansion (MVP IMPLEMENTED)

**Goal:** The developer answers only the design questions they want to answer, reviews the future file tree, and confirms **before** any directory or CSS is written. This capability is prioritized before expanding the next design-domain catalogs.

| Step | Work | Location |
| --- | --- | --- |
| W.1 | Terminal wizard for project name/output, framework selection, custom colors, fonts, type size and spacing | `scripts/init-project.mjs`, `scripts/lib/init/wizard.mjs` |
| W.2 | Multiple structural grids, optional mathematical composition guides, arbitrary custom hierarchy names | `scripts/lib/init/config.mjs`, `scripts/lib/init/scaffold.mjs` |
| W.3 | Print a configuration and file-tree preview without touching the filesystem; ask for explicit `yes` | `scripts/init-project.mjs` |
| W.4 | Generate only requested adapters, token CSS, selected layout CSS and composition/hierarchy JSON | `scripts/lib/init/scaffold.mjs` |
| W.5 | Safe non-interactive `--config --out --dry-run` or `--yes` flows for AI agents and CI | `scripts/cli.mjs`, `tests/builder.test.mjs` |
| W.6 | Packaged `uf-css init` command, documentation and integration verification | `package.json`, `scripts/verify-packed-package.mjs`, `docs/WIZARD.md` |
| W.7 | Future: edit/resume wizard, richer token schema, responsive custom grid definitions and visual preview | Planned; not implemented |

**MVP gate:** no decisions mandatory, no writes without confirmation, no irrelevant adapter folders, no forced brand or aesthetic rules. The CI test suite verifies this; full graphical preview is not in scope yet.

### Phase 03 — Consumer themes and branding isolation (DONE: independent themes and legacy compatibility)

**Goal met:** A developer can define an entirely unique light/dark theme, with a custom palette, typography, spacing, radii, density, motion, CSS/Tailwind/Bootstrap/StyleX/native mappings and optional contrast checks—without editing or importing universal neutral design values.

| Step | Result | Exact location |
| --- | --- | --- |
| 03.1 | **DONE:** Add optional creator-owned theme tokens (including type, density, spacing, radii, motion and other supported DTCG types). Keep v1 neutral themes unchanged for compatibility | `scripts/lib/theme-v2.mjs`, `examples/project-theme/*.v2.json` |
| 03.2 | **DONE:** Document precedence: project tokens → authored light/dark overrides → app-owned component state styles; distinguish legacy neutral inheritance | [THEME-CONTRACT.md](THEME-CONTRACT.md) |
| 03.3 | **DONE:** Generate Vanilla CSS, Tailwind v3/v4, Bootstrap mappings, StyleX variables/themes and native values from one independent theme | `scripts/generate-project-theme.mjs`, `scripts/lib/theme-v2.mjs` |
| 03.4 | **DONE for explicit checks:** Validate user-selected text, link, action/hover and focus color pairs separately for each authored mode. Invalid ratios fail without silently altering chosen palette | `tests/theme-v2.test.mjs`, `scripts/lib/theme-v2.mjs` |
| 03.5 | **DONE:** Non-destructive `--check` and `--force`, symlink-path preflight, strict config schema, deterministic manifests, documented v1→v2 migration and packed CLI test | `scripts/generate-project-theme.mjs`, [THEMES.md](THEMES.md), `scripts/verify-packed-package.mjs` |
| 03.6 | **DONE for code/build scope:** Two radically different example themes, two Vanilla HTML specimens, and independent real-framework smoke builds. Full screenshots and device audits remain Phase 09 work | `examples/project-theme/`, `integration/web/verify.mjs`, `tests/theme-v2.test.mjs` |
| 03.7 | **DONE:** Arbitrary creator-defined token paths and roles, entirely independent of the fixed UF-CSS neutral palette | `scripts/lib/tokens/`, `scripts/lib/theme-v2.mjs`, [THEME-CONTRACT.md](THEME-CONTRACT.md) |

**Acceptance gate:** Two unrelated products compile independent themed CSS/JS outputs, light/dark contrasts are validated, existing v1 output still works, and real framework builds and packed CLI checks pass. Do not claim visual or accessibility certification; screenshot/device testing is Phase 09.

**Scope note:** Theme v2 consumes the strict supported DTCG profile. It does not automatically rewrite optional neutral starter component styles, generate arbitrary UI components, or implement the full DTCG resolver. Those behaviors are deliberately not part of the Phase 03 acceptance gate.

### Phase 04 — Platform adapters and real consuming examples (DONE: locked builds and packaged consumers)

**Goal met for the declared build scope:** Independent projects use the core naturally, without being forced into a framework or neutral styling system. CI verifies **the real packed UF-CSS artifact**, not only checkout-relative adapter files.

| Step | Verified result | Exact location |
| --- | --- | --- |
| 04.1 | **DONE:** Standalone Vanilla CSS, native custom properties, optional neutral CSS layers, responsive layout references and independent project light/dark specimens | `examples/vanilla/`, `examples/project-theme/`, `src/css/` |
| 04.2 | **DONE:** Tailwind v4 `@theme inline` color/type/spacing/radius mapping, light/dark theme variables and actual installed-package CLI compilation | `adapters/tailwind-v4/`, `integration/web/verify-packed.mjs` |
| 04.3 | **DONE:** Tailwind v3 CJS preset support from actual packed package, real utility compilation and explicit opacity/class-discovery limits | `adapters/tailwind-v3/`, `integration/web/verify-packed.mjs` |
| 04.4 | **DONE for mapped variables:** Bootstrap 5.3 CSS bundle, explicit semantic/RGB mappings, light/dark values and documented component/Sass limits | `adapters/bootstrap/`, `integration/web/` |
| 04.5 | **DONE for production build:** StyleX token and theme compilation plus a real Next.js App Router **Webpack** consumer compiled from a locally packed UF-CSS tarball | `adapters/stylex/`, `integration/nextjs/`, `.github/workflows/integration-nextjs.yml` |
| 04.6 | **DONE for native JS export:** React Native numeric values, independent light/dark theme, text scaling, safe-area context, TypeScript checks and Android Metro JavaScript export from a packed library | `adapters/react-native/`, `integration/expo/`, `.github/workflows/integration-expo.yml` |
| 04.7 | **DONE:** Vue, Svelte, Angular, Astro and normal HTML consume the same Vanilla CSS variables; no duplicated mandatory runtime | [FRAMEWORK-CONSUMERS.md](FRAMEWORK-CONSUMERS.md), [ADAPTERS.md](ADAPTERS.md) |
| 04.8 | **DONE for build and packaging gate:** Five locked CI workflows, including packed web consumers, Next.js Webpack build and Expo Metro export; **visual and interactive accessibility tests deferred to Phase 09** | `integration/`, `.github/workflows/` |

**Gate passed (2026-11-03):** 43/43 foundation and builder tests, all eight web framework integrations, five independent GitHub workflows, a real packed web consumer, a Next.js production static export, an Expo Android JS export and custom semantic light/dark themes. The sample designs differ intentionally; an identical pixel layout is neither required nor expected.

**Explicit limitations:** No automatic browser screenshot or keyboard/screen-reader audit, no physical Android/iOS device verification, no universal component styling system, no full Bootstrap Sass theme and no guarantee for every future Next.js or Expo version. These are outside the Phase 04 build acceptance gate and tracked in Phase 09 / later compatibility work. The Next.js example uses an optional community StyleX SWC plugin, not a core dependency.

### Phase 05 — Mathematical foundation and UX principles (DONE: pure-library scope)

**Goal met:** Reusable, tested mathematical calculations without requiring any specific palette, typographic style, framework, grid or UX aesthetic. Existing public helpers remain available.

| Step | Result | Location |
| --- | --- | --- |
| 05.1 | **DONE:** Preserve existing `foundation`, `modularScale`, `fluidClamp`, `columnWidth` and contrast behavior, strengthen invalid-input validation | `src/foundation-formular/{foundation,formular}.ts` |
| 05.2 | **DONE:** User-defined spacing series, finite interpolation, responsive fluid evaluation, arbitrary padded grid geometry and span calculations | `src/foundation-formular/formular.ts`, `src/grid/formulas.ts` |
| 05.3 | **DONE:** Safe Fibonacci integers and convergent ratios, optional golden rectangles, root rectangles, rule-of-thirds and phi guide coordinates | `src/foundation-formular/ratios.ts`, `src/grid/formulas.ts` |
| 05.4 | **DONE for documented model scope:** Calibrated Fitts / Hick–Hyman index and timing helpers, qualitative Jakob/Gestalt/disclosure and explicit evidence limitations | `src/foundation-formular/laws.ts`, [RESEARCH.md](RESEARCH.md) |
| 05.5 | **DONE for TypeScript and numerical scope:** Bounds, monotonic behavior, grid reconstruction, overflow, rounding and no-framework dependency tests | `tests/formular.test.ts` |

**Gate:** Public mathematics remain pure TypeScript and independent of DOM, Tailwind, React, StyleX and React Native. Formula outputs are unit-documented and testable. No claims of universal UX rules, model calibration, WCAG certification, browser visual QA or human preference optimization. Follow-on phase: **06 (semantic and hierarchy).**

### Phase 06 — Semantics and hierarchy (DONE for specification, fixtures and static-validation scope)

**Goal met:** The existing 20 references now have category-specific specifications; creators can define entirely independent hierarchies and arbitrary semantic role names without a compulsory taxonomy or framework.

| Step | Work completed | Location |
| --- | --- | --- |
| 06.1 | **DONE:** Expanded optional semantic vocab for documents, regions, feedback, accessibility and responsiveness; creator-defined semantic roles | `src/semantic/semantic.ts` |
| 06.2 | **DONE:** Preserved original 20-category registry and categorized major types vs techniques explicitly | `src/hierarchy/hierarchy.ts`, `src/hierarchy/specification.ts` |
| 06.3 | **DONE:** Four family-specific specifications (5 communication, 5 structural, 7 visual techniques, 3 interaction), all independent of presentation code | `src/hierarchy/{communication,structural,visual-techniques,interactive}/` |
| 06.4 | **DONE:** Each specification has priority rule, relationships, constraints, example, anti-pattern and possible strategies | `src/hierarchy/specifications.ts`, [HIERARCHY.md](HIERARCHY.md) |
| 06.5 | **DONE:** Strategy catalog maps to independent opt-in vanilla CSS hooks, package subpath `./hierarchy.css`; no global reset or brand palette | `src/hierarchy/strategies.ts`, `src/css/hierarchy-strategies.css`, `package.json` |
| 06.6 | **DONE for static test scope:** Two unrelated HTML specimens and source/visual-order fixture audits at 320/768/1440 widths. **No rendered browser or screen-reader validation claimed.** | `examples/hierarchy/`, `src/semantic/flow.ts`, `tests/hierarchy.test.ts` |
| 06.7 | **DONE:** Creator-owned hierarchy IDs, priority levels, arbitrary strategy names and typed relationship definitions with cycle/reference checks; zero levels supported | `src/hierarchy/custom.ts`, `tests/hierarchy.test.ts` |

**Gate:** All 20 references have actionable specifications and explicit support levels. Custom systems can be empty or fully independent of the 20 references and need not include a prescribed font, grid, spacing, hierarchy or CSS class. The optional CSS and semantic audits are **starting points**, not browser QA or an aesthetic compliance score. Phase 09 remains responsible for actual visual, keyboard and assistive technology verification.

### Phase 07 — Grid catalog to grid implementation (DONE: declared pure library and static integration scope)

**Goal met:** Preserve all 37 references with truthful support, deliver opt-in CSS and geometric guides, and allow user-authored zero/multiple independent grids.

| Step | Result | Source |
| --- | --- | --- |
| 07.1 | DONE — reconciled all support statuses, research notes, selector-to-recipe mapping | `src/grid/{grid,registry}.ts`, [GRIDS.md](GRIDS.md) |
| 07.2 | DONE — responsive 12/8, fluid, fixed/adaptive, nested and feature-guarded subgrid | `src/grid/web/`, `src/css/grid-recipes.css` |
| 07.3 | DONE for practical scope — manuscript, columns, modular rows and baseline rhythm, geometry | `src/grid/editorial/`, `src/css/grid-recipes.css` |
| 07.4 | DONE for simple constructions — thirds, phi, diagonals, root rectangles, a basic golden triangle guide | `src/grid/geometric/` |
| 07.5 | DONE as historical references — Van de Graaf, Rosarivo, Villard, Golden Canon without invented fully working algorithms | `src/grid/golden-canons/`, [GRIDS.md](GRIDS.md) |
| 07.6 | DONE — optional Bento spans, plain-grid fallback for unsupported actual masonry, tested CSS imports | `src/css/grid-recipes.css`, `integration/web/` |
| 07.7 | DONE for static examples — two different specimen pages, long text and source-order fixture at 320/768/1440 | `examples/grids/`, `tests/grids.test.ts` |
| 07.8 | DONE — creator-owned weighted tracks, arbitrary breakpoints, safe independent CSS generation and empty grid systems | `src/grid/custom.ts` |

**Gate:** All 37 entries accurately report support; a CSS-recipe entry has its selector. User-authored grids require no UF-CSS styling identity. The two specimens are static and do NOT certify real browser zoom, visual, keyboard or assistive-technology operation (Phase 09).

### Phase 08 — Patterns and component contracts (DONE for contract, specimen and static-integration scope)

**Goal met:** Optional behavior-first UI contracts across platforms without a forced component library, design language or styling framework.

| Step | Result | Location |
| --- | --- | --- |
| 08.1 | **DONE:** Ten component task contracts (existing five preserved) with web/native semantics, keyboard/screen-reader guidance and applicable state reviews; pure operation transitions | `src/components/`, [COMPONENTS.md](COMPONENTS.md) |
| 08.2 | **DONE:** Ten reference patterns (existing five preserved) with reading order, responsive rules, platform semantics and review states; custom patterns without built-in defaults | `src/patterns/`, [PATTERNS.md](PATTERNS.md) |
| 08.3 | **DONE:** Optional `./patterns.css` export with prefixed layout-only hooks; real Tailwind v4, Bootstrap and packed-package import checks; no StyleX/native renderer forced into core | `src/css/pattern-recipes.css`, `integration/web/` |
| 08.4 | **DONE for documented scope:** Keyboard, focus, screen-reader and native/Expo equivalent behavior, including limitations of source-only contracts | [COMPONENTS.md](COMPONENTS.md), `examples/components/native-mapping.md` |
| 08.5 | **DONE for source/static scope:** Two locally interactive HTML specimens covering tabs, dialog, form, feedback, filters, table and empty states; state-transition and markup/source tests. Browser/device verification remains Phase 09 | `examples/components/`, `tests/components-patterns.test.ts` |

**Gate:** Web and native may render differently but describe equivalent tasks and outcomes. Passing package compilation and source-level tests is NOT real keyboard/assistive-technology/device validation. User-authored contracts and zero built-in patterns are acceptable. **Next: Phase 09 — accessibility, visual regression and real runtime quality gates.**

### Phase 09 — Accessibility, visual regression and quality gates

**Goal:** Make consistent, accessible behavior testable—not merely documented.

| Step | Work | Location |
| --- | --- | --- |
| 09.1 | Browser snapshots at phone/tablet/desktop widths, light/dark and selected fonts | `tests/visual/`, `integration/web/` |
| 09.2 | Automated contrast and semantic/ARIA checks; keyboard navigation and visible focus | `tests/accessibility/` |
| 09.3 | Test 200% zoom, long/localized text, motion preferences and layout overflow | `tests/accessibility/`, `examples/` |
| 09.4 | Native runtime validation on representative Android/iOS environments with font scaling/safe areas | `integration/expo/`, `docs/TESTING.md` |
| 09.5 | Add test evidence and failure thresholds to CI, while keeping nondeterministic or device-only checks documented | `.github/workflows/` |

**Gate:** core examples pass reproducible automated checks; known device-only limitations are recorded. **A successful build is not equivalent to a passed visual/accessibility audit.**

### Phase 10 — AI agent automation and project CLI

**Goal:** An AI agent or developer can adopt UF-CSS in a new/existing project without silently changing its stack or branding.

| Step | Work | Location |
| --- | --- | --- |
| 10.1 | Extend the skill to detect Vanilla, Tailwind v3/v4, Bootstrap, StyleX, Expo and unsupported stacks | `.agents/skills/universal-foundation-css/SKILL.md` |
| 10.2 | Create an inspect-only project audit report: tokens, duplicates, import order, navigation, component states, framework version | `scripts/audit-project.mjs`, `docs/AI-AGENTS.md` |
| 10.3 | **MVP COMPLETE:** user-owned `init` wizard and config/preview/confirmation scaffold; future agent-led audit and richer project integration remain | `scripts/init-project.mjs`, `scripts/lib/init/`, `docs/WIZARD.md` |
| 10.4 | Keep safe non-overwrite/dry-run behavior; require user consent for package installs, migrations and destructive actions | `scripts/`, `tests/` |
| 10.5 | Test skill installation and example prompts with compatible Codex/Claude/Copilot workflows | `.agents/skills/`, `tests/skill-installer.test.ts` |
| 10.6 | Document ChatGPT compatibility honestly: repository skill files are not automatically installed in the ChatGPT app | `docs/AI-AGENTS.md` |

**Gate:** in a sample existing project the agent can produce a readable **audit first**, recommend only compatible adapters, and make no unapproved changes.

### Phase 11 — Open-source prerelease and governance

**Goal:** A third-party developer can install a **specific version** and reproduce the examples.

| Step | Work | Location |
| --- | --- | --- |
| 11.1 | Reconcile API docs, README examples, type declarations, license, security policy and contribution rules | `README.md`, `docs/`, `package.json` |
| 11.2 | Add package content verification, versioned changelog, release notes and semver rules | `tests/package-exports.test.ts`, `CHANGELOG.md` |
| 11.3 | Add gated publish workflow with provenance/permissions and explicit maintainer approval | `.github/workflows/release.yml` |
| 11.4 | Tag and publish a **prerelease** such as `0.2.0-beta.1` only after review and authorization | Git tag / npm |
| 11.5 | Install prerelease in a clean, unrelated example project and verify all advertised entry points | `integration/`, `docs/COMPATIBILITY.md` |
| 11.6 | Gather external integration feedback, resolve breaking API problems, then define a later stable 1.0 gate | `CHANGELOG.md`, GitHub issues/releases |

**Gate:** version-pinned consuming project builds successfully; docs match published contents; tested capabilities are clearly separated from roadmap promises. **No auto-publish or auto-merge.**

### Phase 12 — Consume from independent projects (EXTERNAL)

**Goal:** Demonstrate reuse without merging company-specific work into UF-CSS.

| Step | Separate project | Where the changes belong |
| --- | --- | --- |
| 12.1 | `kingbattash/amgyna-design-system` | Own colors, fonts, specific hierarchy priorities, chosen grids, StyleX component styles |
| 12.2 | AMGYNA website | Consume `amgyna-design-system` (which in turn depends on a **versioned** UF-CSS package) |
| 12.3 | AmyMail | Consume UF-CSS directly or through an independent AmyMail theme; one behavior contract across web/mobile |
| 12.4 | Other personal or client projects | Adopt UF-CSS directly with separate identity and framework-appropriate adapter |

**Gate:** UF-CSS does **not** depend on, import or embed AMGYNA or AmyMail. Updating a brand in one product cannot alter the universal defaults or another product's design.

---

## 5. Exactly where changes belong

| Responsibility | Correct directory | Do **not** put it in |
| --- | --- | --- |
| Mathematical formulas & law descriptions | `src/foundation-formular/` | Brand CSS or component files |
| Semantic meaning, state, accessibility roles | `src/semantic/` | Hex-only or framework-specific color classes |
| Hierarchy specifications | `src/hierarchy/` | Tailwind/StyleX-only helpers in core |
| Canonical raw design values | `tokens/source.tokens.json` | Hand-maintained duplicate adapter values |
| Generated TypeScript token exports | `src/tokens/generated.ts` | Manual edits |
| Layout/composition catalogs and mathematics | `src/grid/` | Every page's copied CSS |
| Component **behavior contracts** | `src/components/` | React component implementations in core |
| Cross-page pattern specifications | `src/patterns/` | Product-specific page copy |
| Browser CSS recipes | `src/css/` | React Native styles |
| Framework-specific adapters | `adapters/{tailwind-v3,tailwind-v4,bootstrap,stylex,react-native}/` | Canonical design-domain folders |
| Consuming-app build examples | `integration/` and `examples/` | Universal library public API |
| Token/theme/skill tooling, interactive builder | `scripts/`, `scripts/lib/init/` and `.agents/` | App UI source |
| CI, tests and quality gates | `tests/` and `.github/workflows/` | Static README claims |
| An organization's visual identity | **its own repository** | Universal Foundation CSS |

### Target folder expansion (create incrementally; not everything exists today)

```text
Universal-Foundation-CSS/
├── tokens/
│   └── source.tokens.json              # canonical values (exists)
├── src/
│   ├── foundation-formular/
│   │   ├── foundation.ts               # exists
│   │   ├── formular.ts                 # exists
│   │   ├── laws.ts                     # exists
│   │   └── ratios.ts                   # planned
│   ├── semantic/                       # extend existing definitions
│   ├── hierarchy/
│   │   ├── communication/              # planned subtypes
│   │   ├── structural/                 # planned subtypes
│   │   ├── visual-techniques/          # planned subtypes
│   │   └── interactive/                # planned subtypes
│   ├── tokens/                          # generated TS + roles
│   ├── patterns/                        # framework-neutral specs
│   ├── components/                      # behavior/state contracts
│   ├── grid/
│   │   ├── web/                         # planned recipes
│   │   ├── editorial/                   # planned recipes
│   │   ├── geometric/                   # planned constructions
│   │   └── golden-canons/               # planned references
│   └── css/                             # optional Vanilla CSS
├── adapters/
│   ├── tailwind-v3/
│   ├── tailwind-v4/
│   ├── bootstrap/
│   ├── stylex/
│   └── react-native/
├── scripts/
│   ├── generate-tokens.mjs             # exists
│   ├── generate-project-theme.mjs      # exists
│   ├── init-project.mjs                # planned
│   └── audit-project.mjs               # planned
├── examples/
├── integration/
│   ├── web/                            # exists
│   └── expo/                           # exists
├── tests/
├── docs/
│   ├── IMPLEMENTATION_PLAN.md          # this file
│   ├── ROADMAP.md
│   └── ...
├── .agents/skills/universal-foundation-css/
└── .github/workflows/
```

## 6. Release milestones and decision gates

| Milestone | Must contain | Recommended release state |
| --- | --- | --- |
| **M0 — Experiment** | Phase 00 baseline and ongoing review | Current draft PR, not published |
| **M1 — Reproducible core** | Phases 01–02 pass; deterministic, packed exports and canonical tokens | Internal alpha |
| **M2 — Usable cross-framework foundation** | Phases 03–04; product themes and framework examples actually build | Public prerelease candidate |
| **M3 — Design knowledge system** | Phases 05–08; detailed typed hierarchy, grid and pattern contracts | Beta API |
| **M4 — Trusted delivery** | Phases 09–11; visual/accessibility evidence, AI tooling and versioned release | Public beta |
| **M5 — Proven reuse** | Phase 12; at least two independent products consume one version without brand leakage | Stable 1.0 evaluation, not automatic |

### Non-negotiable acceptance checks for every phase

1. **Build:** `npm run verify` passes; generated files agree with canonical values.
2. **Adapters:** update integration fixtures affected by changed tokens or exports.
3. **Accessibility:** document semantic/interaction impact; validate it where applicable.
4. **Documentation:** README/example usage is accurate and points to existing paths.
5. **Portability and freedom:** no AMGYNA, AmyMail, or other consumer's values enter the universal core; no preset is a requirement; user-defined design choices are supported.
6. **Review:** a focused PR explains what was implemented and which limitations remain.

## 7. Immediate next action

**Proceed to Phase 05: foundation formulas, validated mathematical rules and design guidance.** Phases 00–04 are complete for their explicitly limited experimental scopes. Continue to support independent product decisions; a mathematical relationship or historical canon is a reference, not a required UI template.

Run all five CI workflows and `npm run verify` after changes. Do **not** merge the draft PR or publish npm without maintainer authorization. Automated browser/device accessibility and visual regression remain Phase 09 work.
