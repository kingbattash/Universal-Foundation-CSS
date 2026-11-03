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

These are **build checks**, not guarantees of pixel parity, physical-device functionality, or full accessibility. [Framework consumer contracts](FRAMEWORK-CONSUMERS.md) explain the Next.js/StyleX and Expo fixtures, import order, and package boundaries.

## CLI commands (experimental)

The package exposes `uf-css init` for the interactive creator-first builder and `uf-css generate` for low-level user-owned token compilation, plus `uf-css theme` for optional standalone v2 light/dark project themes. In a checkout use `node scripts/cli.mjs init`, `node scripts/cli.mjs generate`, or `node scripts/cli.mjs theme`. See [WIZARD.md](WIZARD.md). The npm package is **not** published yet.

## Package boundaries

- `@kingbattash/universal-foundation-css`: pure generated JavaScript, declarations and optional references.
- `/css` and `/tokens.css`: opt-in CSS files, explicitly marked as side-effectful so bundlers preserve imports.
- `/tailwind-v3`: CommonJS preset, expects Tailwind v3 in the consumer.
- `/tailwind-v4`: Tailwind-specific CSS with `@theme inline`; must pass through Tailwind v4.
- `/bootstrap`: Bootstrap CSS variables; consumer loads Bootstrap CSS first.
- `/stylex`: raw generated `.stylex.ts` source, **requires a consuming StyleX-compatible compiler**. StyleX is an optional peer.
- `/react-native`: generated raw TypeScript with numeric layout values; consumer must transpile TypeScript.
- The package is experimental and **not published**; import examples only apply after a local link or future release.

## What is deliberately not included

No required typography scale, brand palette, company identity, UI component kit, layout system, grid preset, hierarchy taxonomy, or framework migration. The creator chooses their own design decisions and may opt out of UF-CSS presets.

## Compatibility and versioning

- During `0.x`, interfaces may change. Pin an exact version or Git commit when consuming this library.
- Any breaking token/adapter/schema change requires a changelog entry and migration instructions.
- New framework-adapter implementations must ship with a real fixture and CI check.
- Recommended Node version for contributors is 22, even while the declared engine supports >=20.
- Root, web integration and Expo fixture lockfiles are committed; CI uses `npm ci`. See the [implementation plan](IMPLEMENTATION_PLAN.md).

## Release checklist

A public prerelease requires locked installs, `npm pack --dry-run` verification, a separate offline tarball consumer test, all three CI workflows green, truthful adapter docs and maintainer approval. No automatic publishing or merging.
