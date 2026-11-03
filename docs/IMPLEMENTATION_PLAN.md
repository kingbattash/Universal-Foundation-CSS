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

### Phase 02 — Canonical tokens and normalization (IN PROGRESS)

**Goal:** Every generated platform value originates from a validated canonical source, with no hidden independent defaults.

| Step | Work | Location |
| --- | --- | --- |
| 02.1 | Inventory every existing hardcoded token-like value, classify as canonical or reference guidance | `src/tokens/`, `src/foundation-formular/`, `src/css/`, `tokens/` |
| 02.2 | **PARTIAL:** Allow arbitrary consumer-owned token paths, typed aliases and explicit adapter mappings; document role and unit rules | `scripts/lib/custom-tokens.mjs`, `docs/CUSTOM_SYSTEMS.md`, `docs/TOKEN-CONTRACT.md` (planned) |
| 02.3 | Add appropriate typography roles, responsive constraints, density, radii, elevation, z-order, and motion; avoid forcing product brand | `tokens/source.tokens.json` |
| 02.4 | Prefer official DTCG schema validation plus explicit checks for references, unsupported types, cycles and invalid units | `scripts/lib/token-validator.mjs`, `tests/tokens.test.ts` |
| 02.5 | Split generator into validators, formatters and per-platform writers while preserving deterministic output | `scripts/lib/tokens/`, `scripts/generate-tokens.mjs` |
| 02.6 | **PARTIAL:** Test collisions, missing/circular aliases, unsafe input, output parity and real web adapter compilers; official DTCG schema conformance remains | `tests/custom-system.test.ts`, `integration/web/verify.mjs`, `.github/workflows/ci.yml` |

**Gate:** changing a canonical token regenerates the correct outputs in **all six adapters**. Unchanged inputs produce byte-identical outputs. No adapter must reimplement fundamental token calculations.

### Phase 03 — Consumer themes and branding isolation

**Goal:** A user creates a unique product theme without forking UF-CSS or leaking another project's identity.

| Step | Work | Location |
| --- | --- | --- |
| 03.1 | Extend current color-only schema with optional font families, type scale, density, spacing/radii, elevation and motion | `scripts/lib/project-theme.mjs`, `docs/THEMES.md` |
| 03.2 | Define inheritance and precedence: core defaults → product values → contextual theme → component states | `docs/THEME-CONTRACT.md` |
| 03.3 | Generate Vanilla/Tailwind CSS variables, Bootstrap-compatible overrides, StyleX themes, and native values from the same input | `scripts/generate-project-theme.mjs`, `scripts/lib/` |
| 03.4 | Expand semantic contrast tests for light/dark, state colors, links and focus indicators; report—not silently alter—invalid palettes | `tests/project-theme.test.ts`, `scripts/lib/` |
| 03.5 | Support non-destructive `--check`, `--force`, config schema validation, deterministic manifest and documented migration | `scripts/generate-project-theme.mjs`, `docs/THEMES.md` |
| 03.6 | Add a neutral sample theme and demonstrate **two visibly distinct product themes** that share the same foundation | `examples/project-theme/`, `integration/web/` |
| 03.7 | Support consumer-defined token values and custom semantic roles without being limited to UF-CSS's neutral example palette | `tokens/` consumer schema, `scripts/lib/project-theme.mjs`, `docs/THEME-CONTRACT.md` |

**Gate:** two unrelated example products use the same UF-CSS version, have different branding, and pass token/contrast checks without editing `src/` or canonical tokens.

### Phase 04 — Platform adapters and real consuming examples

**Goal:** Frameworks consume the foundation naturally, rather than being forced to adopt the foundation's own styling library.

| Step | Output | Location |
| --- | --- | --- |
| 04.1 | Vanilla CSS: standalone import, cascade layers, native custom properties and responsive layout examples | `src/css/`, `examples/vanilla/` |
| 04.2 | Tailwind v4: functional `@theme` mapping, dark mode, spacing, font and color roles | `adapters/tailwind-v4/`, `integration/web/tailwind-v4/` |
| 04.3 | Tailwind v3: preset compatibility, utilities and documented limitations | `adapters/tailwind-v3/`, `integration/web/tailwind-v3/` |
| 04.4 | Bootstrap 5.3: root variables, RGB channels, common controls and accurate theming limitations | `adapters/bootstrap/`, `integration/web/bootstrap/` |
| 04.5 | StyleX: compiler-safe token output, typed variables and selectable themes, Next.js consuming example | `adapters/stylex/`, `examples/nextjs-stylex/` |
| 04.6 | React Native/Expo: typed numeric values, light/dark, font scaling and safe-area-aware example | `adapters/react-native/`, `integration/expo/` |
| 04.7 | Vue, Svelte, Angular, Astro and normal HTML: document use of the same Vanilla CSS variables instead of duplicating framework implementations | `docs/ADAPTERS.md` |
| 04.8 | Add actual package-consumer builds (not only relative-file fixtures), followed by visual/functional tests | `integration/`, `.github/workflows/` |

**Gate:** every advertised adapter builds against the **packed** UF-CSS package, uses product theme overrides and has clear import instructions. Equivalent semantic tokens resolve to the same meanings; platform layouts may differ legitimately.

### Phase 05 — Mathematical foundation and UX principles

**Goal:** Provide reusable, documented calculations rather than arbitrary numbers.

| Step | Work | Location |
| --- | --- | --- |
| 05.1 | Normalize existing `foundation.ts` and `formular.ts` APIs | `src/foundation-formular/` |
| 05.2 | Modular scales, fluid `clamp()`, responsive interpolation, spacing scales, grid track calculation | `src/foundation-formular/formular.ts` |
| 05.3 | Golden ratio, Fibonacci relationships, root rectangles, thirds and geometric construction utilities where mathematically justified | `src/foundation-formular/ratios.ts`, `src/grid/formulas.ts` |
| 05.4 | Document Fitts's, Hick–Hyman, Jakob's, Gestalt and relevant UX laws with practical application **and caveats** | `src/foundation-formular/laws.ts`, `docs/RESEARCH.md` |
| 05.5 | Add property/boundary tests for monotonic scales, invalid input, layout overflows and rounding | `tests/formular.test.ts` |

**Gate:** formulas are pure, typed, testable, unit-documented and independent of React, Tailwind or StyleX. There is **no invented universal “No. 1 UX law.”**

### Phase 06 — Semantics and hierarchy

**Goal:** Turn conceptual terminology into usable, testable specification and style strategies.

| Step | Work | Location |
| --- | --- | --- |
| 06.1 | Expand semantic types for documents, actions, state/feedback, surfaces, navigation, accessibility and responsive meaning | `src/semantic/` |
| 06.2 | Preserve the 20-category practical hierarchy registry; separate **major types** from techniques | `src/hierarchy/hierarchy.ts` |
| 06.3 | Add category-specific TS modules for communication, structure, visual techniques and interaction | `src/hierarchy/{communication,structural,visual-techniques,interactive}/` |
| 06.4 | Specify priority levels, relationships, design constraints, examples and anti-patterns for each type | `src/hierarchy/**`, `docs/HIERARCHY.md` |
| 06.5 | Define optional style strategies in CSS/adapter layers—**not** StyleX-only code inside universal core | `src/css/`, `adapters/` |
| 06.6 | Validate semantic reading order and representative hierarchy examples at responsive widths | `examples/`, `tests/` |
| 06.7 | Accept custom hierarchy names, rules, and extensions in consuming projects; do not force any of the 20 reference categories | `src/hierarchy/`, `docs/HIERARCHY.md`, `tests/` |

**Gate:** all 20 categories have implementable specifications or documented reference status. A user can select hierarchy rules and see which style strategies express them, without assuming every category is scientifically independent.

### Phase 07 — Grid catalog to grid implementation

**Goal:** Keep the full library as reference while shipping the **practical grids first**.

| Step | Work | Location |
| --- | --- | --- |
| 07.1 | Audit all 37 entries: CSS recipe vs mathematical helper vs reference; reconcile family counts and scope | `src/grid/registry.ts`, `docs/GRIDS.md` |
| 07.2 | Implement core responsive systems: 12-column, 8-column, fluid, adaptive/fixed containers, nested grids and supported subgrid | `src/grid/web/`, `src/css/` |
| 07.3 | Add editorial reading layouts: manuscript, column, modular and baseline alignment | `src/grid/editorial/`, `src/css/` |
| 07.4 | Provide optional construction outputs for rule of thirds, Phi, root rectangles and diagonal/golden-composition guides | `src/grid/geometric/`, `src/grid/formulas.ts` |
| 07.5 | Document Van de Graaf, Rosarivo, Villard, Golden Canon, and other classical systems as researched references unless a real implementation is warranted | `src/grid/golden-canons/`, `docs/GRIDS.md` |
| 07.6 | Evaluate Bento and Masonry with CSS feature support and fallbacks; avoid unsupported claims | `src/grid/web/`, `integration/web/` |
| 07.7 | Add responsive, zoom, long-content and logical reading-order test pages | `examples/grids/`, `tests/` |
| 07.8 | Make user-authored grid definitions first-class; allow projects to select zero or more built-in grid presets | `src/grid/`, `docs/GRIDS.md`, `tests/` |

**Gate:** each grid has an explicit support level, reference/source notes, suitable-use guidance, and a working example **where claimed implemented**. No requirement to render all 37.

### Phase 08 — Patterns and component contracts

**Goal:** UI reuse without forcing a global visual style or cloning components across frameworks.

| Step | Work | Location |
| --- | --- | --- |
| 08.1 | Formalize behavior/state contracts for buttons, input, select, feedback, dialog, tabs, navigation, lists and tables | `src/components/` |
| 08.2 | Define compositional contracts for hero, section, editorial split, dashboard, filters, table, form and auth layouts | `src/patterns/` |
| 08.3 | Put only optional styles into CSS/StyleX/native adapters; keep universal contracts framework-agnostic | `src/css/`, `adapters/` |
| 08.4 | Document web keyboard and screen-reader behavior and native touch/accessibility alternatives | `docs/COMPONENTS.md`, `examples/` |
| 08.5 | Add interaction examples and explicit success/error/loading/empty/disabled state reviews | `integration/`, `tests/` |

**Gate:** a web component and a native component can have different rendering but satisfy the same **task and semantic contract**. No requirement to clone pixels.

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
| 10.3 | Create explicit `init` workflow: identify stack, optionally choose or define grid(s), define **user-owned** design decisions, generate a product theme, install adapter, write config | `scripts/init-project.mjs`, `scripts/lib/` |
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
| Token/theme/skill tooling | `scripts/` and `.agents/` | App UI source |
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

**Continue Phase 02.** User-defined tokens now generate without neutral presets, and two independent systems compile through Tailwind v3/v4 and StyleX. Full DTCG schema validation and unifying the two generator implementations are still pending. Phase 01 checks are complete (19/19 tests, 3/3 CI workflows, packed install and committed lockfiles). Work on token normalization and custom consumer-owned design rules **without treating the existing neutral tokens as mandatory**:

- [ ] Inventory all core/hierarchy/grid values and split experimental defaults from reusable validation rules.
- [ ] Define user-authorable project token manifests, including custom roles and optional/empty presets.
- [ ] Add official DTCG schema validation or document and test every unsupported type.
- [ ] Make token generation deterministic for a non-default consumer-defined manifest without modifying the UF-CSS repository defaults.
- [ ] Add cross-adapter tests and examples demonstrating entirely different project design systems.

Do **not** start rewriting AMGYNA or AmyMail yet. Preserve full consumer ownership of design choices.
