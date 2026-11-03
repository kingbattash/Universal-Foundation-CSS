# Roadmap (early 0.x)

**Detailed execution plan:** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — exact phase tasks, source ownership, dependencies, and acceptance gates. **Phases 00–08 complete for their declared experimental scopes** (2026-11-03). **Phase 09 Chromium automation implemented:** 25 real-browser tests plus a sixth CI workflow (Playwright/axe, screenshots, keyboard, responsive reflow and contrast/semantics). **Full Phase 09 is NOT complete:** pixel baselines, real browser zoom, manual screen readers and Android/iOS runtime audits remain. Phase 10 inspect-only agent automation and explicit-confirmation CLI is implemented. **Phase 11 release-readiness engineering is implemented, but actual npm publishing/versioning is deliberately pending maintainer approval.** Phase 09 manual/device gates and product-specific migrations remain separate. Full DTCG 2025.10 feature coverage is deliberately outside the current supported profile.

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

## Phase 05 — mathematics and UX evidence (DONE for library/test scope)
- [x] Preserve existing modular scale, spacing, fluid CSS, contrast and basic geometry API
- [x] Add pure interpolation, fluid evaluation, arbitrary spacing steps, padded arbitrary-column grid layouts and span measurement
- [x] Add safe Fibonacci ratios, golden rectangles, rule-of-thirds and golden-section guides
- [x] Document Fitts/Hick–Hyman calibrated models and qualitative Jakob/Gestalt/progressive-disclosure caveats
- [x] Add boundary, monotonicity, overflow and geometry tests; see [RESEARCH.md](RESEARCH.md)
- [ ] Calibrate empirical models on real product users; browser/device visual audits (Phase 09)

## Phase 06 — semantics and hierarchy (DONE for specifications/static scope)
- [x] Expand optional semantic vocabulary and allow fully custom semantic roles
- [x] Keep 20 original catalog references; add four family-specific modules with 20 actionable category specifications
- [x] Every specification distinguishes major hierarchy vs technique and describes priorities, relationships, constraints, examples and anti-patterns
- [x] Add creator-owned hierarchy model with custom roles, priorities, relationships, safe validation and no required presets
- [x] Add explicitly imported hierarchy CSS strategy hooks, without global styles or branded defaults
- [x] Static reading-order audit and two contrasting HTML specimens at three declared viewport widths
- [ ] Browser screenshot, actual focus order, assistive-technology and device tests (Phase 09)

## Phase 07 — optional grid recipes and geometry (DONE for declared code/static scope)
- [x] Audit 37 registry entries, source notes, support levels and CSS-selector claims
- [x] CSS recipes for responsive columns, auto-fit, fluid, fixed, adaptive, nested/subgrid, Bento, editorial and manuscript/baseline
- [x] Weighted mathematical tracks, arbitrary creator-defined breakpoints, safe CSS renderer with zero required grids
- [x] Pure compositional guides for thirds, phi, root rectangles and simple diagonal constructions
- [x] Document Van de Graaf, Rosarivo, Villard, Golden Canon as researched references; actual masonry stays reference with ordinary-grid fallback
- [x] Add responsive/long-content HTML examples, numeric and static tests, web CSS import and packed-package smoke tests
- [ ] Real browser, 200%/400% zoom, keyboard, RTL and assistive-technology validation (Phase 09)

## Phase 08 — task and component contracts (DONE for code/static scope)
- [x] Ten framework-neutral component specifications with original five names retained
- [x] Explicit web/native keyboard, screen-reader and applicable state semantics
- [x] Pure idle/loading/success/error/empty/disabled operation transitions and creator-defined components
- [x] Ten optional patterns with reading order and platform behavior; fully custom definitions allowed
- [x] Unbranded opt-in layout-only `./patterns.css` and real CSS compiler/package import verification
- [x] Two interactive local HTML specimens, native-equivalence guidance and source/test audits
- [ ] Browser screenshot, keyboard/tab/pointer, screen reader, 200% zoom and physical-device QA (Phase 09)

## Phase 09 — browser/accessibility automation (PARTIAL: human and device gates pending)
- [x] 25 Playwright Chromium tests with 12 responsive light/dark screenshot artifacts (320, 768, 1440 CSS px)
- [x] axe-core WCAG 2/2.1/2.2 A/AA rule scans on selected interactive, grid and independent theme specimens
- [x] Actual keyboard flow for tabs, dialog focus confinement/Escape, form errors, skip links, filtering and sorting
- [x] Browser geometry and overflow checks, 320px reflow, 200% root font-size stress, Arabic long-text case and reduced-motion preference
- [x] Fix browser-found mobile table overflow, editorial long-heading clipping and mislabeled theme button
- [x] Make native Expo specimen safe-area scrollable and accessible for scaled text; TypeScript, native static quality tests and Android Metro export
- [x] Add sixth workflow with pinned `npm ci`, artifact retention and code-level failure gates
- [ ] Approved cross-version pixel-diff screenshot baselines; images currently provide evidence for review
- [ ] Manual NVDA/VoiceOver/TalkBack audits and real browser 200%/400% zoom; Firefox/WebKit as applicable
- [ ] Android and iOS emulator/physical-device runtime validation, safe areas, dynamic fonts, orientations and accessibility

## Phase 10 — audit-first AI agents and project CLI (DONE for inspected static scope)
- [x] New `uf-css audit --project DIR --format text|json` with no writes, no network, no project-script execution and symlink/private file exclusions
- [x] Evidence-based detection for plain CSS, Tailwind v3/v4, Bootstrap 5, StyleX, Next.js, Expo/React Native and unsupported versions
- [x] Token duplicate/conflict inventory, import order and static navigation/component-state review
- [x] Partial-coverage reporting and conservative unknown-framework adapter decisions
- [x] Separate `init --dry-run` preview and explicit `--yes` generation maintained, no forced palette/grid/hierarchy
- [x] CLI safety regression tests, packed-install audit test, Codex/Claude/Copilot prompts and ChatGPT compatibility caveat
- [ ] Product-specific auto-migrations or interactive project editing; require separate authorization and implementation

## Phase 11 — controlled prerelease preparation (READY FOR REVIEW; NOT PUBLISHED)
- [x] Review metadata, public JS/TS/CSS exports, README, compatibility, contributor/security policy and distribution rules
- [x] Limit tarball build output to `dist/src` and reject missing exports, compiled tests and secret file types
- [x] Add `npm run verify:release` dry-run file manifest validation and existing independent offline tarball consumer checks in CI
- [x] Define `0.x` version policy, prerelease notes template and per-version migration requirements
- [x] Add manual-only, exact-version, main/SHA-check, six-CI-check, environment-review and npm OIDC gated workflow
- [ ] Set up actual GitHub `npm-prerelease` required reviewers and npm Trusted Publisher (maintainer approval required)
- [ ] Authorize release version and notes; publish a prerelease, independently install actual npm version and gather feedback
- [ ] Approve any tag/GitHub release and later 1.0 stability gate

## Foundation v0.3 — design governance
- [ ] Expand accessible interaction contracts with platform examples
- [ ] Add design-review templates and CLI validation
- [ ] Verify design hierarchy across example pages and responsive widths
- [ ] Add visual/keyboard test suite and more examples
- [ ] Author and validate full historical grid construction guides where warranted

## Package release
- [x] Commit root and integration lockfiles and use `npm ci` in CI
- [x] Add manual-only prerelease workflow with npm OIDC/provenance readiness and documented maintainer approvals (not yet configured or executed)
- [ ] Release a tested prerelease before a stable 1.0
- [ ] Publish optional AI skill/plugin distribution for supported hosts

**Not goals:** universal UI styles, forced brand identity, 37 CSS grid overlays, automatic publication, or replacing a project's product-specific UX.
