# Roadmap (early 0.x)

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
- [ ] Add configurable, validated custom project themes and documented override precedence (light/dark neutral examples currently included)
- [x] Generate a StyleX token adapter without tying core to React (consuming-app integration tests pending)
- [x] Generate a React Native token adapter; runtime Expo example and cross-platform UI contract tests pending
- [ ] Add WCAG-focused accessibility audit examples

## Integration gaps
- [ ] Full framework builds for Tailwind v3/v4, Bootstrap, StyleX and Expo on their real toolchains
- [ ] Verified examples for each framework (generated mappings are supplied but browser/native rendering is not fully verified)
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
