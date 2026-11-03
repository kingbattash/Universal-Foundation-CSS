# Roadmap (early 0.x)

**Detailed execution plan:** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — step-by-step tasks, paths, dependencies and acceptance criteria. **Phase 01 complete (2026-11-03):** locked npm installs, package exports/side effects, offline packed-package consumer test, and all three CI suites passed (19 unit tests). **Phase 02 underway:** a standalone custom token compiler and two independent examples now support wholly user-owned tokens; full DTCG validation and deeper framework checks remain.

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

## Integration gaps
- [x] Smoke-test the real Tailwind v3/v4 CSS compilers, Bootstrap CSS import pipeline, StyleX Babel plugin and Expo SDK 57 Metro Android JS export
- [x] Add fixture sources for Tailwind v3/v4, Bootstrap, StyleX and Expo consuming generated tokens
- [ ] Add browser screenshot, device runtime and interaction/accessibility validation to those fixtures
- [ ] Canonicalize remaining typography guidance, breakpoints and all optional roles into DTCG tokens
- [ ] Adopt full DTCG schema validation rather than the current supported-type subset

## Foundation v0.3 — design governance
- [ ] Expand accessible interaction contracts with platform examples
- [ ] Add design-review templates and CLI validation
- [ ] Verify design hierarchy across example pages and responsive widths
- [ ] Add visual/keyboard test suite and more examples
- [ ] Author and validate full historical grid construction guides where warranted

## Package release
- [ ] Commit a package-lock.json and switch CI to `npm ci`
- [ ] Add package publishing workflow and provenance, with maintainer approvals
- [ ] Release a tested prerelease before a stable 1.0
- [ ] Publish optional AI skill/plugin distribution for supported hosts

**Not goals:** universal UI styles, forced brand identity, 37 CSS grid overlays, automatic publication, or replacing a project's product-specific UX.
