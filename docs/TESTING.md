# Phase 09 quality and accessibility verification

UF-CSS is a framework-neutral design-system *construction* toolkit. It supplies optional helpers and specimens, not an accessibility-certified component library. Design validation has two different parts: automatic browser checks with reproducible evidence, and human/device checks that cannot be inferred from code.

## CI quality gates

| Gate | What is checked | Where | Current status |
| --- | --- | --- | --- |
| TypeScript, token authority and package tests | Static type, imports, source generation, numerical contracts | `.github/workflows/ci.yml` | Existing automated gate |
| Browser screenshot evidence | 320/768/1440 CSS px in independent editorial and operations styles, both color modes | `integration/browser/tests/browser-quality.spec.mjs` | New Phase 09 gate; review screenshots rather than claiming baseline diff |
| Automated a11y | axe WCAG A/AA tags for selected specimens and light/dark themes | `integration/browser/tests/` | New Phase 09 gate, partial coverage only |
| Keyboard interaction | Real Chromium tab/arrow/Enter/Escape, modal focus, filtering, error focus | `integration/browser/tests/` | New Phase 09 gate |
| Reflow/long content | Actual narrow layouts, font-size stress, long localized strings, reduced-motion setting | `integration/browser/tests/` | New Phase 09 gate; not native zoom certification |
| Web framework compatibility | Tailwind v3/v4, Bootstrap, StyleX, Next.js packed consumer | `integration/web/`, `integration/nextjs/` | Existing CI compile gate |
| Native code and Android JS export | Expo TypeScript, safe-area, font scaling, Metro build, scrollable fixture | `integration/expo/`, `tests/native-quality.test.mjs` | Static/build gate; **no emulator/physical device runtime** |
| Screen readers and physical devices | VoiceOver, TalkBack, NVDA, Android/iOS native app | Manual checklists below | **Pending** |
| Pixel-by-pixel screenshot regression | Committed visual baselines reviewed under a pinned browser | Future browser snapshot fixtures | **Pending** |

The browser suite pins its direct dependency versions in a separate package file but currently installs without a committed `package-lock.json`; dependency lock generation remains an improvement. The root and other integration packages remain separately locked.

## Human browser accessibility checklist (not yet executed)

- [ ] **Keyboard-only:** Tab and Shift+Tab follow meaningful document order, no traps outside modal dialogs, Skip to content is visible on focus, focused controls remain visible.
- [ ] **Screen readers:** NVDA/Firefox or Chrome and VoiceOver/Safari announce headings, controls, tab relationships, error feedback, sort order and modal name; no duplicate live messages.
- [ ] **Zoom:** Check browser-native 200% and 400% zoom on actual 1280/1440-wide windows; content stays usable, reflows, and no horizontal scrolling appears except necessary two-dimensional tables.
- [ ] **Localization:** Test Arabic/Swahili long strings, RTL language direction, mixed numbers, and 200%-scaled text on representative layouts.
- [ ] **Contrast:** Inspect all interactive states and user-owned themes, including focus rings, hover/selected, image overlays, disabled explanatory text, and custom brand combinations. Automated axe catches only certain violations.
- [ ] **Motion:** Confirm reduced-motion behavior, focus retention, and interruption of non-essential animation using actual OS preferences.
- [ ] **Visual baselines:** Review 12 screenshot artifacts in the PR and approve environment-specific golden screenshot baselines before enabling strict pixel diffs.

## Native Android/iOS runtime checklist (not yet executed)

- [ ] **Android emulator + real Android:** Build/install the Expo example, test scroll reachability under 200%–250% system font size and smallest-screen layout, focus with TalkBack, orientation changes, keyboard opening, safe-area edges.
- [ ] **iOS simulator + real iPhone:** Confirm safe-area insets, VoiceOver output, dynamic type/large text, light/dark theme, both orientations and modal overlay behavior on actual components.
- [ ] **Offline/error:** Simulate no network and validation failures on a real consumer, verify no false success message and focus recovery.
- [ ] **Web/native equivalence:** Compare the *task* and meaningful announcements for a button/form/dialog/table; do not require pixel-identical UI.
- [ ] Record device model, OS version, app build hash, screen reader version, date, screenshots and observed failures.

## Release evidence policy

Do not mark the project WCAG AA compliant, browser-visually regression-protected or physical-device verified solely because CI is green. When evidence is missing, report it as **pending**. Phase 09 may be considered **browser-automation complete** only when Chromium checks pass; the full phase acceptance gate requires human browser validation, screenshot baseline approval and real native runtime coverage.

See [browser suite README](../integration/browser/README.md), [COMPONENTS.md](COMPONENTS.md), [GRIDS.md](GRIDS.md) and [PHILOSOPHY.md](PHILOSOPHY.md).
