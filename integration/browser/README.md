# Real browser quality suite (Phase 09)

This suite is deliberately **separate** from the UF-CSS TypeScript core. It uses Playwright Chromium and axe-core against the existing independent HTML specimens. No browser or UI toolkit is installed by the published UF-CSS package.

## Run locally

From the repository root, on Node.js 22+:

```sh
npm ci --prefix integration/browser --no-audit --no-fund --ignore-scripts
./integration/browser/node_modules/.bin/playwright install chromium
node scripts/generate-project-theme.mjs --config examples/project-theme/editorial.v2.json --out generated/editorial
node scripts/generate-project-theme.mjs --config examples/project-theme/operations.v2.json --out generated/operations
npm test --prefix integration/browser
```

The two theme-generation steps are necessary because theme previews reference generated CSS deliberately excluded from source control. For a second local run, use `--force` with those two generator commands or keep the generated directories unchanged. CI uses fresh checkouts and does not overwrite user files. On Linux CI, `playwright install --with-deps chromium` installs browser system dependencies as well.

Browser test dependencies are pinned in the committed `integration/browser/package-lock.json` and installed with `npm ci`. Root, Expo and other framework toolchains remain independently locked.

## Current automated checks

- **Rendered screenshots:** two independent themes × three viewport widths (320, 768, 1440 CSS px) × light/dark modes, attached as 12 full-page PNG evidence files in the Playwright HTML report.
- **Geometry and reflow:** document overflow assertions, actual wide/narrow grid bounding boxes, reading-order DOM markers, 320 CSS px narrow layout (a 400%-*equivalent* reflow scenario for a 1280 CSS px base viewport), 200% HTML font-size stress and long Arabic content.
- **Interaction:** manual-activation tab focus/selection separation; native dialog modal focus and Escape dismissal; local form validation, error targeting and completed-state feedback; data table sort/filter/empty-state/clear action; skip-link keyboard focus.
- **Reduced motion:** emulated CSS `prefers-reduced-motion: reduce` for specimens with optional transitions.
- **Automated WCAG:** axe checks using WCAG 2/2.1/2.2 A/AA rule tags against selected component, hierarchy, grid and both independent theme specimens. A passing scan does **not** establish full WCAG conformance.

Failed tests produce traces/screenshots; successful visual evidence screenshots are attached to the HTML report, available as a GitHub Actions artifact for 14 days.

## What this does NOT establish

There is **no committed cross-version pixel-image baseline** yet. Screenshots are review artifacts, and layout/overflow/semantic assertions are the immediate automated regression gates; screenshot diffs should be introduced with an intentional baseline review and pinned browser/OS before claiming pixel regression protection. CSS viewport reflow simulation is not the same as verifying browser-native 200%/400% zoom or platform font scaling. These tests do not prove real VoiceOver/NVDA/TalkBack output, keyboard-only user success, internationalization in production or Android/iOS device runtime.

For explicit human/device checks, see [docs/TESTING.md](../../docs/TESTING.md).
