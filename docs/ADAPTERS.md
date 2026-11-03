# Adapter setup and compatibility

**Creating an entirely original project?** Use [independent theme v2](THEMES.md) or the [custom token generator](CUSTOM_SYSTEMS.md). The default `--uf-*` examples below are **optional neutral starter adapters**, not required colors, fonts, grids or layout conventions. Independent themes generate their own namespaced variables and optional framework mappings.

The **optional neutral starter** outputs come from [its DTCG-style source](../tokens/source.tokens.json); independent projects instead use **their own** DTCG-style token manifests. These modes share validated compiler machinery, but never impose the neutral starter values. The core package does not require Tailwind, Bootstrap, StyleX, Next.js or React Native.

**Current release state:** these adapter files are available on the `feat/foundation-v0` branch. This repository has **not published an npm version yet**. Code examples below use the intended package entry points after a local workspace link or future publish.

**Real consuming applications and verified package exports:** [Framework Consumer Guide](FRAMEWORK-CONSUMERS.md) covers the packed-package test, independent Next.js + StyleX production build, Expo Android Metro JS export, Vanilla CSS import order, and reuse in Vue/Svelte/Angular/Astro.

## Generate from source

```bash
npm install
npm run generate:tokens
npm run check:tokens
npm run verify
```

Change only `tokens/source.tokens.json` for canonical color, spacing, type, motion and layout values. Run `npm run generate:tokens` and commit both source and generated files. The generator validates supported DTCG token types and typed curly-brace aliases, including missing/circular references; it is **not yet a complete DTCG conformance validator**, and does not implement `$extends`, JSON Pointer aliases or all composite types.

## Vanilla HTML / CSS

```html
<link rel="stylesheet" href="./path/to/src/css/foundation.css" />
<section class="uf-container">
  <div class="uf-grid" style="--uf-grid-min: 220px">
    <article>Item one</article><article>Item two</article>
  </div>
</section>
```

The stylesheet uses an `@import` of generated neutral tokens, CSS layers and `uf-`-prefixed opt-in utility classes. It does not add a global reset. You can provide product identity with custom variables:

```css
:root {
  --uf-action: #123d91;
  --uf-action-hover: #0b3075;
  --uf-on-action: #ffffff;
}
```

Load the project override **after** UF-CSS. Preserve sufficient color contrast.

## Tailwind CSS v4

In your application's entry CSS:

```css
@import "tailwindcss";
@import "@kingbattash/universal-foundation-css/css";
@import "@kingbattash/universal-foundation-css/tailwind-v4";
```

Example classes: `bg-uf-canvas text-uf-text p-uf-4 rounded-uf-lg`. The `@theme inline` mapping references `--uf-*` variables and is processed by **Tailwind v4**. Do **not** import this adapter into a plain CSS pipeline without Tailwind.

Tailwind generates only classes it can detect in your source; ensure your project includes relevant static class names. Changing semantic roles in the consumer updates the underlying variables.

## Tailwind CSS v3

`tailwind.config.cjs`:

```js
module.exports = {
  presets: [require("@kingbattash/universal-foundation-css/tailwind-v3")],
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
}
```

Import UF-CSS in your CSS entry so the `--uf-*` variables exist. Example utilities: `bg-uf-action`, `p-uf-4`. Opacity modifier syntax for color utilities is **not provided** by these simple `var()` mappings; use semantic color tokens or extend the preset deliberately.

## Bootstrap 5.3

Import order is important:

```ts
import "bootstrap/dist/css/bootstrap.min.css";
import "@kingbattash/universal-foundation-css/css";
import "@kingbattash/universal-foundation-css/bootstrap";
```

This starter adapter maps root body, text, border, link and primary/status values, plus selected `.btn-primary` local variables. It also produces Bootstrap `--bs-*-rgb` values for the included light and dark themes.

For the built-in dark theme, use a common ancestor with `data-bs-theme="dark"`. UF-CSS tokens support both that selector and `data-uf-theme="dark"`.

**Limitations:** Bootstrap uses component-specific variables and Sass-generated values. This adapter is **not a full Bootstrap theme compiler**. If your product changes primary colors, the generated RGB values may need regeneration, and other Bootstrap components may need additional mappings.

## React / StyleX

Example when a StyleX compiler is configured in the consumer:

```tsx
import * as stylex from "@stylexjs/stylex"
import { ufVars, ufDarkTheme } from "@kingbattash/universal-foundation-css/stylex"

const styles = stylex.create({
  block: {
    backgroundColor: ufVars.surface,
    color: ufVars.text,
    padding: ufVars.space4,
    borderRadius: ufVars.radiusLg,
  },
})

export function Sample() {
  return <section {...stylex.props(styles.block)}>Content</section>
}
```

Apply `ufDarkTheme` on a theme subtree using `stylex.props`. This optional starter adapter includes generated variables and a dark theme. A separate **creator-owned v2 theme** is now verified in a Next.js App Router/StyleX production Webpack build using a packed UF-CSS tarball. The consuming toolchain must process the distributed `.stylex.ts` file; plain Node cannot execute it without a compatible loader.

## React Native / Expo

```tsx
import { StyleSheet, Text, View } from "react-native"
import { ufNativeTokens } from "@kingbattash/universal-foundation-css/react-native"

const styles = StyleSheet.create({
  card: {
    backgroundColor: ufNativeTokens.colors.surface,
    padding: ufNativeTokens.space["4"],
    borderRadius: ufNativeTokens.radius.lg,
  },
})

export function Example() {
  return <View style={styles.card}><Text>Native foundation</Text></View>
}
```

The generated values are numbers appropriate as **density-independent layout starting points**; they are not browser CSS strings. For typography, respect system font scaling, safe areas and platform-specific conventions. The generated adapter is **not a ready-made React Native component library**. A real consuming Expo app now passes TypeScript and Android Metro JavaScript export with a user-owned theme and safe-area handling; native binary/device testing remains unverified.

## Other technologies

Vue, Angular, Svelte, Astro, Rails, Laravel, plain HTML or templating systems can use the Vanilla CSS output. An additional native or CSS-in-JS framework can consume the canonical DTCG-style tokens and implement its own generator.

## An entirely original system (no UF-CSS visual defaults)

For a developer who doesn't want the neutral starter theme, use the [custom system compiler](CUSTOM_SYSTEMS.md) with **their own** DTCG-style token file and optional framework mappings. This creates only the tokens the developer provided; none of the starter palette, scale, or grid choices are inherited.

The two included custom systems are compiled by the Tailwind v3/v4 and StyleX smoke tests. Bootstrap CSS mappings and native TypeScript generated output are also validated.

## Product theme integration

The [theme generator](THEMES.md) creates CSS variables, Bootstrap RGB overrides, StyleX themes and native palettes for an **independent project**, without editing UF-CSS tokens. You must import the project's generated theme **after** the UF-CSS adapter.

```bash
node scripts/generate-project-theme.mjs --config examples/project-theme/theme.json --out ../your-project/styles/uf-css
```

## Framework test evidence

- Tailwind CSS v3 CLI: compiles utility classes from the UF-CSS preset.
- Tailwind CSS v4 CLI: compiles `@theme inline` utilities from the UF-CSS mapping.
- Bootstrap 5.3: full Bootstrap stylesheet bundles with UF-CSS adapter and semantic overrides using PostCSS.
- Meta StyleX: Babel compiler transforms both generated tokens and consumer `stylex.create` styles.
- Expo SDK 57: Metro exports an Android JavaScript bundle importing the **installed packed native adapter** and an independent user-owned theme.

These are **build integration smoke tests**, including a real packed-package consumer and Next.js production Webpack export—not screenshots, native-device runs, or complete interface accessibility validation. See `integration/web/` and `integration/expo/` for the fixtures.

## Source of truth and theme override policy

1. Edit `tokens/source.tokens.json` for public default design values.
2. Regenerate the outputs; do **not** edit a `*.generated.*` file.
3. For a project's brand, override semantic roles or create a product theme **outside** this neutral package.
4. Keep shared component meaning, focus and feedback contracts; platform interaction patterns may differ.
5. Verify generated-output parity with `npm run check:tokens`.
6. Test actual browser and native integration in your consuming project before claiming production compatibility.
