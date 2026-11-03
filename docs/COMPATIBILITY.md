# UF-CSS compatibility and distribution policy

UF-CSS is a **toolkit for creating your own design system**, not a prescribed system. Its presets are opt-in and may be replaced by project-specific values. See [PHILOSOPHY.md](PHILOSOPHY.md).

## Current experimental support

| Environment | Support scope | Verification |
| --- | --- | --- |
| Node.js | >=20 declared; Node.js 22 used in CI | Core builds and tests |
| Vanilla HTML/CSS | Modern browsers with CSS layers, grid, clamp | Static demo, imported CSS |
| Tailwind v3 | Tailwind v3.4 preset in a consuming fixture | CLI CSS compilation |
| Tailwind v4 | Tailwind v4.1 `@theme inline` mapping | CLI CSS compilation |
| Bootstrap 5.3 | Semantic variables and selected component overrides | PostCSS compilation |
| StyleX | StyleX 0.19.x, typed `.stylex.ts` module | Babel + Next.js production Webpack compiler fixture |
| React Native / Expo | React Native 0.86.x with Expo SDK 57 | Packed-library import, TypeScript, safe-area context, Android Metro JavaScript export |

These are **build checks**, not guarantees of pixel parity, physical-device functionality, or full accessibility. A separate Playwright Chromium/axe workflow tests 25 browser scenarios and collects 12 screenshot artifacts; human screen-reader, native devices and approved pixel baselines remain pending. [Framework consumer contracts](FRAMEWORK-CONSUMERS.md) explain the Next.js/StyleX and Expo fixtures, import order, and package boundaries.

## CLI commands (experimental)

The package provides `uf-css init` (optional builder), `uf-css generate` (creator-owned token compilation), `uf-css theme` (independent themes) and **`uf-css audit --project DIRECTORY`** (strictly inspect-only existing project report). In a checkout use `node scripts/cli.mjs <command>`. See [WIZARD.md](WIZARD.md), [AUDIT.md](AUDIT.md) and the prerelease process in [RELEASE.md](RELEASE.md). The npm package is **not** published yet.

## Package boundaries

- `@kingbattash/universal-foundation-css`: pure generated JavaScript, declarations and optional references.
- `/css` and `/tokens.css`: opt-in CSS files, explicitly marked as side-effectful so bundlers preserve imports.
- `/hierarchy.css`, `/grid.css`, `/patterns.css`: separate opt-in presentation hooks; no global theme or mandatory design language.
- `/tailwind-v3`: CommonJS preset, expects Tailwind v3 in the consumer.
- `/tailwind-v4`: Tailwind-specific CSS with `@theme inline`; must pass through Tailwind v4.
- `/bootstrap`: Bootstrap CSS variables; consumer loads Bootstrap CSS first.
- `/stylex`: raw generated `.stylex.ts` source, **requires a consuming StyleX-compatible compiler**. StyleX is an optional peer.
- `/react-native`: generated raw TypeScript with numeric layout values; consumer must transpile TypeScript.
- The package is experimental and **not published**; import examples only apply after a local link or future release.

## What is deliberately not included

No required typography scale, brand palette, company identity, UI component kit, layout system, grid preset, hierarchy taxonomy, or framework migration. The creator chooses their own design decisions and may opt out of UF-CSS presets.

## Compatibility and versioning

- The source version is `1.0.0` for testing; it has not been published to npm or independently certified stable. Pin an exact Git commit or test a verified local tarball.
- Any breaking token/adapter/schema change requires a changelog entry and migration instructions.
- New framework-adapter implementations must ship with a real fixture and CI check.
- Recommended Node version for contributors is 22, even while the declared engine supports >=20.
- Root, browser, web integration, Next.js and Expo fixture lockfiles are committed; CI uses `npm ci`. See the [implementation plan](IMPLEMENTATION_PLAN.md).

## Release checklist

A public prerelease requires locked installs, `npm run verify:release`, an independent offline packed consumer, **all six CI workflows** green on the chosen main commit, exact package version, a human-reviewed release note, GitHub environment approval, a separately enabled repository variable and npm Trusted Publisher/OIDC configuration. The workflow is manual-only, and **no version bump, merge, tag or npm publication has occurred**. See [RELEASE.md](RELEASE.md).
