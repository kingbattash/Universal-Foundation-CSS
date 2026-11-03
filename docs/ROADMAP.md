# Roadmap (early 0.x)

**Detailed execution plan:** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — exact phase tasks, source ownership, dependencies, and acceptance gates. **Phases 00–04 complete for their declared experimental scopes** (2026-11-03); five CI workflows now include real npm-tarball consumers, a Next.js/StyleX production Webpack build and an Expo Android JavaScript export. **Next: Phase 05 — foundation mathematics and design guidance.** Full DTCG 2025.10 feature coverage is deliberately outside the current supported profile.

The roadmap is a planning aid, not a feature-completeness guarantee.

## Foundation v0 — initial scaffold
- [x] Public Apache-2.0 license and contributor guidance
- [x] Seven-domain TypeScript architecture
- [x] Tested formulas for modular scale, spacing, fluid type and WCAG contrast
- [x] Semantic and component contracts
- [x] 20-category hierarchy registry and 37-grid reference registry
- [x] Neutral opt-in CSS adapter and simple HTML specimen
- [x] Portable Agent Skill and a non-destructive project installer
- [x] Basic GitHub CI for TypeScript and tests

## Foundation v0.2 — token authority and adapters
- [x] Adopt a supported subset of the DTCG 2025.10 design-token format; resolve and validate typed aliases
- [x] Generate neutral CSS, Tailwind v3/v4, Bootstrap, StyleX, React Native and TypeScript token outputs; check drift in CI
- [x] Generate validated, non-destructive project-specific light/dark semantic color themes and document CSS/Bootstrap/StyleX/native output precedence
- [x] Extend independent project theme schema to typography, custom density/spacing, radii, motion and arbitrary user-owned roles (legacy neutral themes remain compatible)
- [x] Generate a StyleX token adapter without tying core to React; verify the packed package in Babel and Next.js/StyleX production builds
- [x] Generate a React Native token adapter and verify packed-library import, native theme, safe areas, text scaling and Expo Metro Android JavaScript export (device/runtime behavior remains unverified)
- [x] Add opt-in color contrast checks for text, links, action, hover and focus for sample project themes (full accessibility audit is Phase 09)

## User-owned design system extensions
- [x] Compile arbitrary consumer-defined token groups without mandatory starter palette, scale, semantic roles, grids, or hierarchy
- [x] Allow explicit optional Tailwind/Bootstrap adapter aliases without hardcoded design choices
- [x] Ship safe non-overwriting CLI in packed package, with two distinct custom-system examples
- [x] Verify editorial and operations systems in real Tailwind v3/v4 and StyleX builds
- [x] Unify neutral-starter and custom-system token parsing and formatting while preserving backwards compatibility
- [ ] Expand beyond the documented DTCG supported profile; no finalized official JSON Schema is published in the 2025.10 format report

## Consumer-owned project themes (Phase 03)
- [x] Creator-controlled DTCG-style theme tokens, light/dark mode overrides, custom typography, sizing, motion, and semantic names
- [x] Document explicit precedence, independent v2 semantics and opt-in legacy v1 compatibility
- [x] Generate theme CSS, Tailwind v3/v4 aliases, Bootstrap variables, StyleX themes and React Native values
- [x] Compare five user-selected contrast pairs per mode in two unrelated example themes
- [x] Safe CLI with drift verification, force regeneration, symlink preflight and installed-tarball smoke tests
- [x] Two browser-viewable Vanilla HTML specimens and real Tailwind v3/v4, Bootstrap, StyleX and native TypeScript smoke compilations
- [ ] Browser/device screenshot and keyboard/screen-reader audits (Phase 09)

## Interactive design-system builder (creator-first)
- [x] Terminal wizard: frameworks, custom color hex values, typography, spacing, layout grids and composition guides
- [x] Optional hierarchy and user-defined naming without a compulsory taxonomy
- [x] Preview all files and obtain explicit confirmation before creating a folder
- [x] Non-interactive `--config --out --dry-run` and opt-in `--yes`
- [x] Output only selected CSS/Tailwind/Bootstrap/StyleX/native files, grid recipes and specification files
- [x] CLI and packaged-tarball smoke tests, non-destructive/scaffold safety tests
- [ ] Interactive resume/edit, visual palette preview and richer custom grid editor
- [ ] Full accessibility and visual inspection of builder-generated sample projects

## Phase 04 framework integration
- [x] Import a real locally packed UF-CSS package into an independent Tailwind v3/v4, Bootstrap, StyleX and native TypeScript consumer
- [x] Next.js 16 App Router production build with StyleX, packed package import and user-owned themes
- [x] Expo SDK 57 React Native TypeScript + Android Metro export with a packed library and safe-area-aware independent theme
- [x] Five CI workflows with locked toolchain installs, public exports and package boundary tests
- [x] Document framework-neutral CSS reuse for Vue, Svelte, Angular, Astro and plain HTML
- [ ] Browser screenshots, keyboard accessibility, and physical device tests (Phase 09)

## Integration gaps
- [x] Smoke-test the real Tailwind v3/v4 CSS compilers, Bootstrap CSS import pipeline, StyleX Babel plugin and Expo SDK 57 Metro Android JS export
- [x] Add fixture sources for Tailwind v3/v4, Bootstrap, StyleX and Expo consuming generated tokens
- [ ] Add browser screenshot, device runtime and interaction/accessibility validation to those fixtures
- [x] Canonicalize existing starter typography values, responsive bounds, modular ratio, density, motion, z-order and optional elevation-level examples
- [ ] Pursue complete DTCG 2025.10 validation and resolver behavior when standardized tooling/schema is available; current strict profile is documented in TOKEN-CONTRACT.md

## Foundation v0.3 — design governance
- [ ] Expand accessible interaction contracts with platform examples
- [ ] Add design-review templates and CLI validation
- [ ] Verify design hierarchy across example pages and responsive widths
- [ ] Add visual/keyboard test suite and more examples
- [ ] Author and validate full historical grid construction guides where warranted

## Package release
- [x] Commit root and integration lockfiles and use `npm ci` in CI
- [ ] Add package publishing workflow and provenance, with maintainer approvals
- [ ] Release a tested prerelease before a stable 1.0
- [ ] Publish optional AI skill/plugin distribution for supported hosts

**Not goals:** universal UI styles, forced brand identity, 37 CSS grid overlays, automatic publication, or replacing a project's product-specific UX.
