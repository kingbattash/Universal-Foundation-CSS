# Framework consumers — independent design systems

UF-CSS is a **design-system construction toolkit**, not a design system to copy. Its neutral palette, grid categories, typography values and component patterns are optional. Projects choose their own token source, framework and visual identity.

## Verified integration matrix

| Stack | Verified integration | Limits |
| --- | --- | --- |
| Vanilla HTML/CSS | Creator-owned light/dark CSS and standalone examples | Browser screenshots and accessibility audits remain Phase 09 |
| Tailwind CSS v4 | `@theme inline` utilities compiled from the **packed** package and consumer theme | Static class discovery required |
| Tailwind CSS v3 | CJS presets from actual packed exports and user-owned tokens | CSS-variable opacity modifiers need custom handling |
| Bootstrap 5.3 | Packed CSS exports, explicit Bootstrap mappings, mode-aware RGB | Not a full Sass/component theme |
| StyleX | Babel compilation of packed starter token sources and user-owned theme source | Consumer must configure compiler |
| Next.js App Router + StyleX | Locked production Webpack build with a locally installed UF-CSS tarball | Example compiler is optional; toolchain support varies |
| React Native / Expo SDK 57 | Locked TypeScript check, packed native import, creator-owned light/dark theme, Android Metro JS export | Not a compiled APK or real-device test |
| Vue / Svelte / Angular / Astro | Use the same project-generated Vanilla CSS | No UF-CSS-specific runtime adapter needed |

**Scope:** These are real build checks, not visual/functional accessibility certifications.

## Choose a consumer-owned theme

Author a `schemaVersion:2` theme file in your project. It may contain any allowed DTCG-profile token paths, including arbitrary colors, fonts, spacing, radii, density and motion. No fixed semantic names are required.

```bash
node scripts/cli.mjs theme --config my-product.v2.json --out ./generated
```

The v2 theme uses namespaced variables (`--my-product-*`), so it does not accidentally inherit the optional `--uf-*` neutral starter.

### Vanilla CSS, Vue, Svelte, Angular, Astro

All five can import `generated/theme.css` and use its custom properties in normal CSS:

```css
.product-panel {
  background: var(--my-product-ui-canvas);
  color: var(--my-product-ui-ink);
}
```

In Vue, import the stylesheet from `main.ts`; in SvelteKit, from the root layout; in Angular, from the global stylesheet or `angular.json`; and in Astro, from a shared layout. No Tailwind, React, CSS-in-JS or UF-CSS runtime dependency is necessary.

A consumer may apply `data-uf-theme="dark"` on a chosen scope to activate **only the dark values it provided**. Theme persistence and toggles are app decisions.

### Tailwind CSS v4

```css
@import "tailwindcss";
@import "./generated/theme.css";
@import "./generated/tailwind-v4.css";
```

Only explicitly mapped tokens generate utilities, for example `bg-my-product-canvas` if the mapping defines it.

### Tailwind CSS v3

```js
module.exports = {
  presets: [require("./generated/tailwind-v3.cjs")],
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"]
};
```

Import the generated theme stylesheet after your chosen CSS reset. Your app decides its breakpoints, fonts and content regions.

### Bootstrap 5.3

```js
import "bootstrap/dist/css/bootstrap.min.css";
import "./generated/theme.css";
import "./generated/bootstrap.css";
```

Only Bootstrap variables explicitly mapped by the creator are emitted. RGB channels are calculated for each chosen mode. These are not full Bootstrap Sass or component overrides.

**PostCSS caveat:** Some `postcss-import` resolvers don't understand CSS subpath exports. The packed-consumer fixture resolves the installed CSS export with Node before bundling. Tailwind v4 successfully resolves the package CSS exports directly.

### StyleX and Next.js

The user-owned theme generates `stylex-vars.stylex.ts` and `stylex-theme.stylex.ts`. The consuming application must compile them using a configured StyleX toolchain and apply light/dark themes on appropriate subtrees.

The `integration/nextjs` App Router sample:
- Installs the actual locally packed UF-CSS artifact.
- Creates an independent editorial theme and uses its TypeScript StyleX tokens.
- Imports the UF-CSS math API as a published-format package.
- Passes a Next.js production Webpack build in CI.

It uses the **community-maintained `@stylexswc/nextjs-plugin`**, which is not Meta's official StyleX integration and is **not a dependency of UF-CSS core**. The app's compiler and package versions are independently locked.

### React Native / Expo

The `integration/expo` fixture imports `@kingbattash/universal-foundation-css/react-native` from the locally packed and installed package and selects an independent product theme from `generated/native-theme.ts`. It uses `react-native-safe-area-context`, native numerical values, responsive display measurements and text scaling.

CI verifies TypeScript and Android Metro **JavaScript export**, not a native binary, screenshot, device execution or touch targets. A project is free to use different layouts and accessibility patterns on web and native.

## Real packed-package tests

The package is assembled using `npm pack`. CI verifies the produced tarball's exports against a separate installed consumer and real Tailwind, Bootstrap, StyleX and React Native compiler inputs.

The Next.js and Expo fixtures install **the package from that tarball** into their own locked dependency trees, not source-relative adapter files. The following workflows must remain green on a shared head commit:
- `.github/workflows/ci.yml`
- `.github/workflows/integration-web.yml`
- `.github/workflows/integration-packed-web.yml`
- `.github/workflows/integration-nextjs.yml`
- `.github/workflows/integration-expo.yml`

See [ADAPTERS.md](ADAPTERS.md), [THEMES.md](THEMES.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for import order and next steps.

**UF-CSS is still experimental and unpublished.** Visual regression, keyboard/assistive-technology testing, physical-device checks and production compatibility certification belong to later phases.
