# Roadmap (early 0.x)

**Detailed execution plan:** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — exact phase tasks, source ownership, dependencies, and acceptance gates. **Phase 00–02 complete for their declared scopes** (2026-11-03); Phase 02 includes a shared token validator, canonical starter values, independent token compilers, deterministic generation, and 37 tests. **Next: Phase 03 — consumer-owned themes.** Full DTCG 2025.10 feature coverage is deliberately outside the current supported profile.

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
- [ ] Extend project theme schema to typography, density, spacing and motion
- [x] Generate a StyleX token adapter without tying core to React (consuming-app integration tests pending)
- [x] Generate a React Native token adapter; runtime Expo example and cross-platform UI contract tests pending
- [ ] Add WCAG-focused accessibility audit examples

## User-owned design system extensions
- [x] Compile arbitrary consumer-defined token groups without mandatory starter palette, scale, semantic roles, grids, or hierarchy
- [x] Allow explicit optional Tailwind/Bootstrap adapter aliases without hardcoded design choices
- [x] Ship safe non-overwriting CLI in packed package, with two distinct custom-system examples
- [x] Verify editorial and operations systems in real Tailwind v3/v4 and StyleX builds
- [x] Unify neutral-starter and custom-system token parsing and formatting while preserving backwards compatibility
- [ ] Expand beyond the documented DTCG supported profile; no finalized official JSON Schema is published in the 2025.10 format report

## Interactive design-system builder (creator-first)
- [x] Terminal wizard: frameworks, custom color hex values, typography, spacing, layout grids and composition guides
- [x] Optional hierarchy and user-defined naming without a compulsory taxonomy
- [x] Preview all files and obtain explicit confirmation before creating a folder
- [x] Non-interactive `--config --out --dry-run` and opt-in `--yes`
- [x] Output only selected CSS/Tailwind/Bootstrap/StyleX/native files, grid recipes and specification files
- [x] CLI and packaged-tarball smoke tests, non-destructive/scaffold safety tests
- [ ] Interactive resume/edit, visual palette preview and richer custom grid editor
- [ ] Full accessibility and visual inspection of builder-generated sample projects

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
